package edu.okstate.pocketledger.category;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import edu.okstate.pocketledger.user.User;
import edu.okstate.pocketledger.user.UserRepository;

@Service
public class CategoryService{

    //Constant for default userID for default categories
    private static final Integer DEFAULT_USER_ID = 1;

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryService(CategoryRepository categoryRepository, UserRepository userRepository){
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    //Retrieve all categories belonging to the user
    public List<Category> getAllCategories(Integer userId){
        return categoryRepository.findByUser_IdIn(List.of(DEFAULT_USER_ID, userId).stream().distinct().toList());
    }

    //Retrieve a category by it's ID, make sure the current user is the owner
    public Category getCategoryById(Integer categoryId, Integer userId){
        Category category = categoryRepository.findById(categoryId).orElseThrow(() ->
        new IllegalArgumentException("Category not found"));

        if (!category.getUser().getId().equals(userId)
        && !category.getUser().getId().equals(DEFAULT_USER_ID)){
            throw new AccessDeniedException(
                "User does not have access to this category"
            );
        }

        return category;
    }

    //Function to create a new category as long as it isn't a duplicate
    public Category createCategory(String categoryLabel, Integer userId){
        //Make sure the name isn't empty
        if (categoryLabel == null || categoryLabel.isBlank()){
            throw new IllegalArgumentException("Category name cannot be empty");
        }

        //Remove unnecessary spaces
        categoryLabel = categoryLabel.trim();

        //Make sure the name fits into the specified length
        if (categoryLabel.length() > 255){
            throw new IllegalArgumentException("Category name cannopt exceed 255 characters");
        }

        //Check if the category already exists
        if (categoryRepository.existsByUser_IdAndCategoryLabel(userId, categoryLabel)){
            throw new IllegalArgumentException("Category already exists");
        }

        //Find the user who owns the category
        User user = userRepository.findById(userId).orElseThrow(()
        -> new IllegalArgumentException("User not found")
        );

        //Create a new category object
        Category category = new Category(categoryLabel, user);

        //Save it to the database
        return categoryRepository.save(category);
    }
}