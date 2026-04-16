package com.example.auctionbidding.model;

import java.time.LocalDateTime;
import java.util.List;

public class BidUpdatePayload {

    private Long auctionId;
    private double currentPrice;
    private String highestBidder;
    private List<BidEntry> bidHistory;

    public BidUpdatePayload() {}

    public BidUpdatePayload(Long auctionId, double currentPrice,
                            String highestBidder, List<BidEntry> bidHistory) {
        this.auctionId    = auctionId;
        this.currentPrice = currentPrice;
        this.highestBidder = highestBidder;
        this.bidHistory   = bidHistory;
    }

    public Long getAuctionId()            { return auctionId; }
    public double getCurrentPrice()       { return currentPrice; }
    public String getHighestBidder()      { return highestBidder; }
    public List<BidEntry> getBidHistory() { return bidHistory; }

    public void setAuctionId(Long v)              { this.auctionId = v; }
    public void setCurrentPrice(double v)         { this.currentPrice = v; }
    public void setHighestBidder(String v)        { this.highestBidder = v; }
    public void setBidHistory(List<BidEntry> v)   { this.bidHistory = v; }

    public static class BidEntry {
        private String username;
        private double amount;
        private LocalDateTime createdAt;

        public BidEntry() {}
        public BidEntry(String username, double amount, LocalDateTime createdAt) {
            this.username  = username;
            this.amount    = amount;
            this.createdAt = createdAt;
        }

        public String getUsername()          { return username; }
        public double getAmount()            { return amount; }
        public LocalDateTime getCreatedAt()  { return createdAt; }
        public void setUsername(String v)    { this.username = v; }
        public void setAmount(double v)      { this.amount = v; }
        public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    }
}
