package edu.okstate.pocketledger.bdd;

import edu.okstate.pocketledger.user.CreateUserRequest;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
import io.cucumber.datatable.DataTable;

import jakarta.validation.Validator;
import jakarta.validation.Validation;
import jakarta.validation.ValidatorFactory;

import edu.okstate.pocketledger.budget.BudgetService;
import edu.okstate.pocketledger.budget.BudgetResponse;
import edu.okstate.pocketledger.netsavings.NetSavingsService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class NetSavingsSteps{
    private final Integer userId = 1;

    private final BudgetService budgetService = mock(BudgetService.class);

    private final NetSavingsService netSavingsService = new NetSavingsService(budgetService);

    private BigDecimal actualSavings;

    @Given("the user has the following monthly budgets")
    public void userHasMonthlyBudgets(DataTable dataTable){

        List<LocalDate> budgetMonths = new ArrayList<>();

        YearMonth currentMonth = YearMonth.now();

        for(Map<String, String> row : dataTable.asMaps(String.class, String.class)){
            int monthsAgo = Integer.parseInt(row.get("Months Ago"));

            YearMonth month = currentMonth.minusMonths(monthsAgo);

            BigDecimal budgeted = new BigDecimal(row.get("Budgeted"));

            BigDecimal spent = new BigDecimal(row.get("Spent"));

            budgetMonths.add(month.atDay(1));

            BudgetResponse budget = new BudgetResponse(month.toString(), budgeted, spent, List.of());

            when(budgetService.getMonthlyBudget(userId, month.toString())).thenReturn(budget);
        }

        when(budgetService.getBudgetMonths(userId)).thenReturn(budgetMonths);
    }
        
    @When("the user requests their net savings")
    public void userRequestsNetSavings(){
        actualSavings = netSavingsService.calculateNetSavings(userId);
    }

    @Then("their cumulative net savings should be {int}")
    public void checkNetSavings(int expected){
        assertEquals(0, actualSavings.compareTo(BigDecimal.valueOf(expected)));
    }
}