package com.example.auctionbidding.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemName;
    private double currentPrice;
    private String imageUrl;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // --- NEW product detail fields ---
    private String brand;
    private String model;
    private String color;
    private Integer yearsUsed;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category; // PHONE | LAPTOP | EQUIPMENT

    // --- existing getters/setters ---
    public Long getId()                          { return id; }

    public String getItemName()                  { return itemName; }
    public void setItemName(String v)            { this.itemName = v; }

    public double getCurrentPrice()              { return currentPrice; }
    public void setCurrentPrice(double v)        { this.currentPrice = v; }

    public String getImageUrl()                  { return imageUrl; }
    public void setImageUrl(String v)            { this.imageUrl = v; }

    public LocalDateTime getStartTime()          { return startTime; }
    public void setStartTime(LocalDateTime v)    { this.startTime = v; }

    public LocalDateTime getEndTime()            { return endTime; }
    public void setEndTime(LocalDateTime v)      { this.endTime = v; }

    // --- new getters/setters ---
    public String getBrand()                     { return brand; }
    public void setBrand(String v)               { this.brand = v; }

    public String getModel()                     { return model; }
    public void setModel(String v)               { this.model = v; }

    public String getColor()                     { return color; }
    public void setColor(String v)               { this.color = v; }

    public Integer getYearsUsed()                { return yearsUsed; }
    public void setYearsUsed(Integer v)          { this.yearsUsed = v; }

    public String getDescription()               { return description; }
    public void setDescription(String v)         { this.description = v; }

    public String getCategory()                  { return category; }
    public void setCategory(String v)            { this.category = v; }
}
