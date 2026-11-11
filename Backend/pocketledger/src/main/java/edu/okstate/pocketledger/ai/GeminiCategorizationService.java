package edu.okstate.pocketledger.ai;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.HttpOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import edu.okstate.pocketledger.category.CategoryService;
import edu.okstate.pocketledger.category.Category;

import java.util.List;
import java.util.stream.Collectors;

//Service for communicating with Gemini to assign a fitting category
@Service
public class GeminiCategorizationService{

    //Client for sending requests to Gemini
    private final Client client;

    //Category service for retrieving the user's categories
    private final CategoryService categoryService;

    //Constructor for the client
    public GeminiCategorizationService(@Value("${app.gemini-api-key}") String apiKey, CategoryService categoryService){

        //Create the client using client builder
        this.client = Client.builder().apiKey(apiKey).httpOptions(HttpOptions.builder().apiVersion("v1beta").build()).build();

        //Create the category service
        this.categoryService = categoryService;
    }
    
    //Method to suggest a category based on transaction  description
    public Category suggestCategory(String transactionDescription, Integer userId){

        //Get all of the user's categories
        List<Category> categories = categoryService.getAllCategories(userId);


        //Categories shouldn't be empty but have an error ready just in case
        if (categories.isEmpty()){
            throw new IllegalStateException("No categories available for this user");
        }

        //Format each category as Id: Label
        String categoryList = categories.stream().map(category -> category.getId() + ": " + category.getCategoryLabel()).collect(Collectors.joining("\n"));

        //Construct the prompt
        String prompt = """
        You are helping categorize bank transaction based on the transaction description.
        
        Choose the best category for this transaction from the categories available to the user. 
        Base your choice on the transaction description provided.
        
        Categories Available (ID: Name):
        %s

        Transaction Description:
        %s

        Return ONLY the numeric ID for the category you select.
        Do not create categories or include explanations.
        Only select ONE category from the provided list and choose the one that best fits the transaction description.
        """.formatted(categoryList, transactionDescription);

        //Send the prompt to gemini
        GenerateContentResponse response = client.models.generateContent(
            "gemini-3.8-flash",
            prompt,
            null
        );

        //Extract gemini's response
        String answer = response.text();

        //Error for it gemini returns a blank response
        if (answer == null || answer.isBlank()){
            throw new IllegalStateException("Gemini return a blank response");
        }

        //Convert the reponse into a category ID
        Integer selectedId;

        try {
            selectedId = Integer.valueOf(answer.trim());
        } catch (NumberFormatException exception){
            throw new IllegalStateException("Gemini return an invalid category ID", exception);
        }

        //Verify that the category belongs to the list
        return categories.stream().filter(category -> category.getId().equals(selectedId)).findFirst().orElseThrow(() ->
        new IllegalStateException("Gemini selected a category that is not available"));
    }
}