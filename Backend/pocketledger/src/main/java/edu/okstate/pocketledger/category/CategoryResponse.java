package edu.okstate.pocketledger.category;

public record CategoryResponse(Integer id, String categoryLabel){
    public static CategoryResponse from (Category category){
        return new CategoryResponse(category.getId(), category.getCategoryLabel());
    }
}
