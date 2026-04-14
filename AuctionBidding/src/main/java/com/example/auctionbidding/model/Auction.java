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

    private LocalDateTime endTime;
    private LocalDateTime startTime;

    public LocalDateTime getStartTime(){
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime){
        this.startTime = startTime;
    }
    public Long getId(){ return id; }

    public String getItemName(){ return itemName; }

    public void setItemName(String itemName){
        this.itemName=itemName;
    }

    public double getCurrentPrice(){
        return currentPrice;
    }

    public void setCurrentPrice(double currentPrice){
        this.currentPrice=currentPrice;
    }

    public String getImageUrl(){
        return imageUrl;
    }

    public void setImageUrl(String imageUrl){
        this.imageUrl=imageUrl;
    }

    public LocalDateTime getEndTime(){
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime){
        this.endTime=endTime;
    }
}