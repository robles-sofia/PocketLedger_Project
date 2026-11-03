package edu.okstate.pocketledger.budget;

import java.math.BigDecimal;
import java.util.List;

// GET and PUT /api/budgets both send back
// totals are category lines added, not stored anywhere
public record BudgetResponse(String month, BigDecimal totalPlanned, BigDecimal totalSpent, List<BudgetCategoryResponse> categories) {}
