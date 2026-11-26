Feature: Password validation

    Scenario: Reject a password containing only letters
        Given a user is creating an account
        When the user submits the password "Password"
        Then the password should be rejected