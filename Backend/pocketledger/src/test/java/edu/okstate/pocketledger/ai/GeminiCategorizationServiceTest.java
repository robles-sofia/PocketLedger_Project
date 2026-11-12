package edu.okstate.pocketledger.ai;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.Test;

import edu.okstate.pocketledger.category.Category;
import edu.okstate.pocketledger.category.CategoryService;

public class GeminiCategorizationServiceTest {

    @Test
    void categorizeTransactionUsingGemini() {

        // Create a fake category service for the test.
        CategoryService categoryService = mock(CategoryService.class);

        // Create sample categories without accessing the database.
        Category groceries = mock(Category.class);
        Category dining = mock(Category.class);
        Category transportation = mock(Category.class);

        when(groceries.getId()).thenReturn(1);
        when(groceries.getCategoryLabel()).thenReturn("Groceries");

        when(dining.getId()).thenReturn(2);
        when(dining.getCategoryLabel()).thenReturn("Dining");

        when(transportation.getId()).thenReturn(3);
        when(transportation.getCategoryLabel()).thenReturn("Transportation");

        // Simulate the categories available to user 2.
        when(categoryService.getAllCategories(2))
                .thenReturn(List.of(groceries, dining, transportation));

        // Read the API key from the environment.
        String apiKey = System.getenv("GEMINI_API_KEY");

        assertNotNull(apiKey, "GEMINI_API_KEY is missing");

        GeminiCategorizationService geminiService =
                new GeminiCategorizationService(apiKey, categoryService);

        // Ask Gemini to categorize a sample transaction.
        Category result = geminiService.suggestCategory(
                "STARBUCKS COFFEE",
                2
        );

        // Verify that Gemini selected an allowed category.
        assertNotNull(result);
        assertTrue(List.of(1, 2, 3).contains(result.getId()));

        System.out.println(
                "Gemini selected: " + result.getCategoryLabel()
        );
    }
}