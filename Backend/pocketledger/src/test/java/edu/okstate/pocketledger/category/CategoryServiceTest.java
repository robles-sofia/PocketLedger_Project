package edu.okstate.pocketledger.category;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import edu.okstate.pocketledger.user.UserRepository;
import edu.okstate.pocketledger.user.User;

import org.springframework.security.access.AccessDeniedException;

public class CategoryServiceTest {

    @Test
    void getAllCategoriesReturnsUserCategories() {

        // Create fake repositories
        CategoryRepository categoryRepository =
            mock(CategoryRepository.class);

        UserRepository userRepository =
            mock(UserRepository.class);

        // Create the service we're testing
        CategoryService categoryService =
            new CategoryService(categoryRepository, userRepository);

        // Pretend user 1 has two categories
        Category groceries = new Category("Groceries", null);
        Category entertainment = new Category("Entertainment", null);

        when(categoryRepository.findByUser_Id(1))
            .thenReturn(List.of(groceries, entertainment));

        // Call the service
        List<Category> result = categoryService.getAllCategories(1);

        // Verify the results
        assertEquals(2, result.size());
        assertEquals("Groceries", result.get(0).getCategoryLabel());
        assertEquals("Entertainment", result.get(1).getCategoryLabel());

        // Verify that the repository was called with user 1
        verify(categoryRepository).findByUser_Id(1);
    }

    @Test
    void getCategoryByIdRejectsUnauthorizedUser() {

        CategoryRepository categoryRepository =
            mock(CategoryRepository.class);

        UserRepository userRepository =
            mock(UserRepository.class);

        CategoryService categoryService =
            new CategoryService(categoryRepository, userRepository);

        // User 1 owns the category
        User owner = mock(User.class);
        when(owner.getId()).thenReturn(1);

        Category category = new Category("Groceries", owner);

        when(categoryRepository.findById(5))
            .thenReturn(Optional.of(category));

        // User 2 tries to access it
        assertThrows(
            AccessDeniedException.class,
            () -> categoryService.getCategoryById(5, 2)
        );
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
}
