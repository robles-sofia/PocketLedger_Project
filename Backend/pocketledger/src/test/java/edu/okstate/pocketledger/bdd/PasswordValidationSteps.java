package edu.okstate.pocketledger.bdd;

import edu.okstate.pocketledger.user.CreateUserRequest;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;

import jakarta.validation.Validator;
import jakarta.validation.Validation;
import jakarta.validation.ValidatorFactory;

import static org.junit.jupiter.api.Assertions.assertFalse;

public class PasswordValidationSteps{
    private String email;
    private boolean passwordAccepted;

    @Given("a user is creating an account")
    public void userCreatedAccount(){
        email = "test@example.com";
    }

    @When("the user submits the password {string}")
    public void userSubmitsPassword(String password){
        CreateUserRequest request = new CreateUserRequest(email, password);

        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()){
            Validator validator = factory.getValidator();

            passwordAccepted = validator.validate(request).isEmpty();
        }
    }

    @Then("the password should be rejected")
    public void passwordShouldBeRejected(){
        assertFalse(passwordAccepted);
    }
}