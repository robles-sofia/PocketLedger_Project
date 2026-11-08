package edu.okstate.pocketledger.category;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/categories")
public class CategoryController{
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService){
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryResponse> getAllCategories(JwtAuthenticationToken authentication){
        Integer userId = Integer.valueOf(authentication.getToken().getSubject());

        return categoryService.getAllCategories(userId).stream().map(CategoryResponse::from).toList();
    }

    @GetMapping("/{id}")
    public CategoryResponse getCategoryById(@PathVariable Integer id, JwtAuthenticationToken authentication){
            Integer userId = Integer.valueOf(authentication.getToken().getSubject());

            Category category = categoryService.getCategoryById(id, userId);

            return CategoryResponse.from(category);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse createCategory(@Valid @RequestBody CreateCategoryRequest request, JwtAuthenticationToken authentication){
        Integer userId = Integer.valueOf(authentication.getToken().getSubject());

        Category category = categoryService.createCategory(request.categoryLabel(), userId);

        return CategoryResponse.from(category);
    }  
}