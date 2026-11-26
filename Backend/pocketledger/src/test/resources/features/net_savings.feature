Feature: Net savings calculation
    Scenario: Calculate the cumulative net savings
        Given the user has the following monthly budgets
        | Months Ago | Budgeted | Spent |
        | 2          | 1000     | 1150  |
        | 1          | 1000     | 800   | 
        | 0          | 1000     | 400   |
        When the user requests their net savings
        Then their cumulative net savings should be 50