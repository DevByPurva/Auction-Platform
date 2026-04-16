package com.example.auctionbidding.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double amount;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    private Auction auction;

    @ManyToOne
    private User user;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getId()                       { return id; }

    public double getAmount()                 { return amount; }
    public void setAmount(double v)           { this.amount = v; }

    public LocalDateTime getCreatedAt()       { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }

    public Auction getAuction()               { return auction; }
    public void setAuction(Auction v)         { this.auction = v; }

    public User getUser()                     { return user; }
    public void setUser(User v)               { this.user = v; }
}
