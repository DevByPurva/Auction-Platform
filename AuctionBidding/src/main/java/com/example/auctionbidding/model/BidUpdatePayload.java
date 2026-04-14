package com.example.auctionbidding.model;

import java.util.List;

/**
 * Broadcast payload sent to /topic/auction/{auctionId} after every bid.
 */
public class BidUpdatePayload {

    private Long auctionId;
    private double currentPrice;
    private String highestBidder;
    private List<BidEntry> bidHistory;

    public BidUpdatePayload() {}

    public BidUpdatePayload(Long auctionId, double currentPrice,
                            String highestBidder, List<BidEntry> bidHistory) {
        this.auctionId = auctionId;
        this.currentPrice = currentPrice;
        this.highestBidder = highestBidder;
        this.bidHistory = bidHistory;
    }

    // --- getters ---

    public Long getAuctionId()           { return auctionId; }
    public double getCurrentPrice()      { return currentPrice; }
    public String getHighestBidder()     { return highestBidder; }
    public List<BidEntry> getBidHistory(){ return bidHistory; }

    // --- setters ---

    public void setAuctionId(Long auctionId)               { this.auctionId = auctionId; }
    public void setCurrentPrice(double currentPrice)       { this.currentPrice = currentPrice; }
    public void setHighestBidder(String highestBidder)     { this.highestBidder = highestBidder; }
    public void setBidHistory(List<BidEntry> bidHistory)   { this.bidHistory = bidHistory; }

    // ---- nested flat entry (avoids lazy-load issues) ----

    public static class BidEntry {
        private String username;
        private double amount;

        public BidEntry() {}
        public BidEntry(String username, double amount) {
            this.username = username;
            this.amount   = amount;
        }

        public String getUsername() { return username; }
        public double getAmount()   { return amount; }
        public void setUsername(String username) { this.username = username; }
        public void setAmount(double amount)     { this.amount = amount; }
    }
}
