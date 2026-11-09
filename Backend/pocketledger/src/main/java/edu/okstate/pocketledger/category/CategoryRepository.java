package edu.okstate.pocketledger.category;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    //Check if a category already exists
    boolean existsByUser_IdAndCategoryLabel(Integer userId, String categoryLabel);

    //Finds all categories belonging to a specified user
    List<Category> findByUser_Id(Integer userId);
    
}