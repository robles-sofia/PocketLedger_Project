package edu.okstate.pocketledger.budget;

import java.math.BigDecimal;


// one category's line in monthly budget
// planned from budget_entry, spent added from transactions, remaining = difference
public record BudgetCategoryResponse(Integer categoryId, String categoryName, BigDecimal planned, BigDecimal spent, BigDecimal remaining) {}
