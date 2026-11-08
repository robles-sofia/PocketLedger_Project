package edu.okstate.pocketledger.budget;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

// body of PUT /api/budgets
// whole month gets sent at once, so saving replaces what was there before
// @Valid runs the rules in BudgetAmountRequest
public record SaveBudgetRequest(
    @NotNull @Pattern(regexp = "\\d{4}-\\d{2}", message = "Must be in YYYY-MM format") String month,
    @NotEmpty @Valid List<BudgetAmountRequest> budgets
) {}
