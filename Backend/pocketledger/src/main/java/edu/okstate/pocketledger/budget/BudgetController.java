package edu.okstate.pocketledger.budget;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

// endpoints for reading and saving a monthly budget
// both need valid token (not in permitAll list in SecurityConfig)
@RestController 
@RequestMapping("/api/budgets")
public class BudgetController {
    
    private final BudgetService budgetService;

    // service given by spring
    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    // GET returns 200
    // returns zeros instead of error if no budget was set for that month
    @GetMapping 
    public BudgetResponse getMonthlyBudget(@RequestParam String month, JwtAuthenticationToken authentication) {
        // user id comes off token, not request
        Integer userId = Integer.valueOf(authentication.getToken().getSubject());

        return budgetService.getMonthlyBudget(userId, month);
    }

    // PUT returns 200
    // forntend sends whole month at once, so replace what was saved before
    // @Valid runs rules on SaveBudgetRequest
    @PutMapping 
    public BudgetResponse saveMonthlyBudget(@Valid @RequestBody SaveBudgetRequest request, JwtAuthenticationToken authentication) {
        Integer userId = Integer.valueOf(authentication.getToken().getSubject());

        return budgetService.saveMonthlyBudget(userId, request);
    }
}
