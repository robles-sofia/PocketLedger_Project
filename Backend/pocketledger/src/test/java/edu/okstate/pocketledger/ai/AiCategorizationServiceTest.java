package edu.okstate.pocketledger.ai;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import edu.okstate.pocketledger.account.Account;
import edu.okstate.pocketledger.category.Category;
import edu.okstate.pocketledger.category.CategoryRepository;
import edu.okstate.pocketledger.transaction.Transaction;
import edu.okstate.pocketledger.transaction.TransactionRepository;
import edu.okstate.pocketledger.user.User;

// check what happens when Gemini fails
// no matter how it fails, the transaction should still be saved in Other, but marked under "default" instead of "ai"

public class AiCategorizationServiceTest {
    private static final Integer USER_ID = 2;
    private static final Long TRANSACTION_ID = 42L;
    private static final Integer OTHER_CATEGORY_ID = 12;

    // set up by buildService so assertions can check them after
    private Transaction transaction;
    private Category other;
    private TransactionRepository transactionRepository;

    // builds service with a Gemini stand-in that fails the way we want it to
    private AiCategorizationService buildService(RuntimeException failure) {
    
    // user who owns the transaction
    User owner = mock(User.class);
        when(owner.getId()).thenReturn(USER_ID);

    Account account = mock(Account.class);
        when (account.getUser()).thenReturn(owner);

    // the transaction being recategorized
    transaction = mock(Transaction.class);
        when(transaction.getId()).thenReturn(TRANSACTION_ID);
        when(transaction.getAccount()).thenReturn(account);
        when(transaction.getLabel()).thenReturn("STARBUCKS COFFEE");

    // the shared Other category that the service falls back on
    other = mock(Category.class);
        when(other.getId()).thenReturn(OTHER_CATEGORY_ID);
        when(other.getCategoryLabel()).thenReturn("Other");

    transactionRepository = mock(TransactionRepository.class);
        when(transactionRepository.findById(TRANSACTION_ID))
                .thenReturn(Optional.of(transaction));
        when(transactionRepository.save(any(Transaction.class)))
                .thenAnswer(call -> call.getArgument(0));

    CategoryRepository categoryRepository = mock(CategoryRepository.class);
        when(categoryRepository.findAll()).thenReturn(List.of(other));

    // the Gemini stand-in always fails the way this test simulates
    GeminiCategorizationService gemini = mock(GeminiCategorizationService.class);
        when(gemini.suggestCategory(anyString(), anyInt())).thenThrow(failure);

        return new AiCategorizationService(transactionRepository, categoryRepository, gemini);
    }

    // every failure has to produce the same safe outcome
    private void assertFallsBackToOther(RuntimeException failure) {
        AiCategorizationService service = buildService(failure);

        // nothing should escape to the caller
        CategorizeResponse response = assertDoesNotThrow(() ->
                service.categorize(new CategorizeRequest(List.of(TRANSACTION_ID)), USER_ID));

        assertEquals(1, response.results().size());

        CategorizeResult result = response.results().get(0);
        assertEquals(TRANSACTION_ID, result.id());
        assertEquals(OTHER_CATEGORY_ID, result.categoryId(), "should fall back to Other");
        assertEquals("default", result.source(), "source must not claim the AI chose this");
        assertNull(result.confidence());

        // transaction categorized and still written to the db
        verify(transaction).setCategory(other);
        verify(transactionRepository).save(transaction);
    }

    @Test
    void prosePayloadFallsBackToOther() {
        // model answered something that wasn't an ID
        assertFallsBackToOther(new IllegalStateException("Gemini returned an invalid category ID"));
    }

    @Test
    void blankPayloadFallsBackToOther() {
        assertFallsBackToOther(new IllegalStateException("Gemini returned a blank response"));
    }

    @Test
    void categoryTheUserDoesNotHaveFallsBackToOther() {
        assertFallsBackToOther(new IllegalStateException("Gemini selected a category that is not available"));
    }

    @Test
    void apiOutageFallsBackToOther() {
        // SDK throws when Gemini's unreachable or key rejected
        assertFallsBackToOther(new RuntimeException("Gemini is unavailable"));
    }
}
