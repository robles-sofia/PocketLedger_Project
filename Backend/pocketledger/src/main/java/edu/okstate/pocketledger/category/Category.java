package edu.okstate.pocketledger.category;

import edu.okstate.pocketledger.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/*
 * Category.java
 * Maps rows in the table Category to a Java object.
 */

// validates
@Entity
@Table(name = "category")
public class Category {
    // Default categories are assigned to user one. Need to go in and implement this.

    //Category Id (Primary key)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Integer id;

    @Column(name = "category_label", nullable = false, unique = true, length = 255)
    private String categoryLabel;

    //User who owns the category
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Empty constructor for JPA
    protected Category() {
    }

    // Constructor with parameters
    public Category(String categoryLabel, User user){
        this.categoryLabel = categoryLabel;
        this.user = user;
    }

    // accessor methods
    public Integer getId(){
        return id;
    }

    public String getCategoryLabel(){
        return categoryLabel;
    }

    public User getUser(){
        return user;
    }
}
