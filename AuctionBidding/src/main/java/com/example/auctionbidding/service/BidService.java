package com.example.auctionbidding.service;

import com.example.auctionbidding.model.*;
import com.example.auctionbidding.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BidService {

    @Autowired
    private BidRepository bidRepo;

    @Autowired
    private AuctionRepository auctionRepo;

    @Autowired
    private UserRepository userRepo;


    /* PLACE BID */

    @Transactional
    public synchronized String placeBid(Long auctionId, Long userId, Double amount){

        Auction auction = auctionRepo.findById(auctionId).orElse(null);

        if(auction==null){
            return "Auction not found";
        }

        if(amount <= auction.getCurrentPrice()){
            return "Bid must be higher";
        }

        auction.setCurrentPrice(amount);
        auctionRepo.save(auction);

        Bid bid = new Bid();
        bid.setAmount(amount);
        bid.setAuction(auction);
        bid.setUser(userRepo.findById(userId).orElse(null));

        bidRepo.save(bid);

        return "Bid placed successfully";

    }


    /* HISTORY */

    public List<Bid> getHistory(Long auctionId){

        return bidRepo.findByAuctionIdOrderByAmountDesc(auctionId);

    }


    /* WINNER */

    public Bid getWinner(Long auctionId){

        List<Bid> bids = bidRepo.findByAuctionIdOrderByAmountDesc(auctionId);

        if(bids.isEmpty()){
            return null;
        }

        return bids.get(0);

    }

}