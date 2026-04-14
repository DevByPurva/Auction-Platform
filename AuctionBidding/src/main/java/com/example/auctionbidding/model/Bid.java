package com.example.auctionbidding.model;

import jakarta.persistence.*;

@Entity
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double amount;

    @ManyToOne
    private Auction auction;

    @ManyToOne
    private User user;

    public Long getId(){ return id; }

    public double getAmount(){ return amount; }

    public void setAmount(double amount){
        this.amount=amount;
    }

    public Auction getAuction(){
        return auction;
    }

    public void setAuction(Auction auction){
        this.auction=auction;
    }

    public User getUser(){
        return user;
    }

    public void setUser(User user){
        this.user=user;
    }
}