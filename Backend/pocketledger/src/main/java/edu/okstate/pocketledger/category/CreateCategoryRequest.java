package edu.okstate.pocketledger.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCategoryRequest(
    @NotBlank
    @Size(max = 255)
    String categoryLabel
){}