package edu.okstate.pocketledger.category;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.security.access.AccessDeniedException;

import edu.okstate.pocketledger.user.User;
import edu.okstate.pocketledger.user.UserRepository;

public class CategoryServiceTest {

    @Test
    void getAllCategoriesReturnsDefaultAndPersonalCategories() {

        CategoryRepository categoryRepository =
            mock(CategoryRepository.class);

        UserRepository userRepository =
            mock(UserRepository.class);

        CategoryService categoryService =
            new CategoryService(categoryRepository, userRepository);

        Category rent = new Category("Rent", null);
        Category groceries = new Category("Groceries", null);
        Category pets = new Category("Pets", null);

        // User 2 should receive defaults from User 1
        // plus their own categories
        when(categoryRepository.findByUser_IdIn(List.of(1, 2)))
            .thenReturn(List.of(rent, groceries, pets));

        List<Category> result = categoryService.getAllCategories(2);

        assertEquals(3, result.size());
        assertEquals("Rent", result.get(0).getCategoryLabel());
        assertEquals("Groceries", result.get(1).getCategoryLabel());
        assertEquals("Pets", result.get(2).getCategoryLabel());

        verify(categoryRepository).findByUser_IdIn(List.of(1, 2));
    }

    @Test
    void createCategorySavesCategoryForCorrectUser() {

        CategoryRepository categoryRepository =
            mock(CategoryRepository.class);

        UserRepository userRepository =
            mock(UserRepository.class);

        CategoryService categoryService =
            new CategoryService(categoryRepository, userRepository);

        User user = mock(User.class);

        when(userRepository.findById(1))
            .thenReturn(Optional.of(user));

        when(categoryRepository.existsByUser_IdAndCategoryLabel(
            1, "Groceries"
        )).thenReturn(false);

        when(categoryRepository.save(any(Category.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        Category result = categoryService.createCategory(
            "Groceries", 1
        );

        assertEquals("Groceries", result.getCategoryLabel());
        assertSame(user, result.getUser());

        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void createCategoryRejectsDuplicateName() {

        CategoryRepository categoryRepository =
            mock(CategoryRepository.class);

        UserRepository userRepository =
            mock(UserRepository.class);

        CategoryService categoryService =
            new CategoryService(categoryRepository, userRepository);

        // User 1 already has a Groceries category
        when(categoryRepository.existsByUser_IdAndCategoryLabel(
            1, "Groceries"
        )).thenReturn(true);

        assertThrows(
            IllegalArgumentException.class,
            () -> categoryService.createCategory("Groceries", 1)
        );

        // Make sure no duplicate category is saved
        verify(categoryRepository, never())
            .save(any(Category.class));
    }

    @Test
    void getCategoryByIdAllowsDefaultCategory() {

        CategoryRepository categoryRepository =
            mock(CategoryRepository.class);

        UserRepository userRepository =
            mock(UserRepository.class);

        CategoryService categoryService =
            new CategoryService(categoryRepository, userRepository);

        // Default user owns this category
        User defaultUser = mock(User.class);
        when(defaultUser.getId()).thenReturn(1);

        Category rent = new Category("Rent", defaultUser);

        when(categoryRepository.findById(5))
            .thenReturn(Optional.of(rent));

        // User 2 accesses the default category
        Category result = categoryService.getCategoryById(5, 2);

        assertSame(rent, result);
    }

    @Test
    void getCategoryByIdRejectsOtherUsersPersonalCategory() {

        CategoryRepository categoryRepository =
            mock(CategoryRepository.class);

        UserRepository userRepository =
            mock(UserRepository.class);

        CategoryService categoryService =
            new CategoryService(categoryRepository, userRepository);

        // User 3 owns this personal category
        User owner = mock(User.class);
        when(owner.getId()).thenReturn(3);

        Category hobbies = new Category("Hobbies", owner);

        when(categoryRepository.findById(8))
            .thenReturn(Optional.of(hobbies));

        // User 2 should not be allowed to access it
        assertThrows(
            AccessDeniedException.class,
            () -> categoryService.getCategoryById(8, 2)
        );
    }
}