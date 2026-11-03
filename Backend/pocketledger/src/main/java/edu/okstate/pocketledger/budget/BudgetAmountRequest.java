package edu.okstate.pocketledger.budget;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

// one line of the budget the user is saving
public record BudgetAmountRequest(
        @NotNull Integer categoryId,
        @NotNull @PositiveOrZero BigDecimal amount) {}
