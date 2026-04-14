package com.example.auctionbidding.controller;

import com.example.auctionbidding.model.Auction;
import com.example.auctionbidding.model.Bid;
import com.example.auctionbidding.service.AuctionService;
import com.example.auctionbidding.service.BidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
public class BidController {

    @Autowired
    private BidService bidService;

    @Autowired
    private AuctionService auctionService;

    @Autowired
    private BidSocketController bidSocketController;


    /* PLACE BID */

    @PostMapping("/bid")
    public String placeBid(@RequestBody Map<String,String> data){

        String auctionIdStr = data.get("auctionId");
        String userIdStr = data.get("userId");
        String amountStr = data.get("amount");

        if(auctionIdStr == null || userIdStr == null || amountStr == null ||
                auctionIdStr.equals("undefined") || userIdStr.equals("undefined")){
            return "Invalid bid request";
        }

        Long auctionId = Long.parseLong(auctionIdStr);
        Long userId = Long.parseLong(userIdStr);
        Double amount = Double.parseDouble(amountStr);

        Auction auction = auctionService.getAuction(auctionId);

        if(auction.getEndTime().isBefore(LocalDateTime.now())){
            return "Auction ended";
        }

        String response = bidService.placeBid(auctionId,userId,amount);

        // Broadcast real-time update to all WebSocket subscribers
        if ("Bid placed successfully".equals(response)) {
            bidSocketController.broadcastUpdate(auctionId);
        }

        return response;
    } 


    /* BID HISTORY */

    @GetMapping("/bid/history/{auctionId}")
    public List<Bid> getHistory(@PathVariable Long auctionId){

        return bidService.getHistory(auctionId);

    }


    /* WINNER */

    @GetMapping("/winner/{auctionId}")
    public Bid getWinner(@PathVariable Long auctionId){

        return bidService.getWinner(auctionId);

    }

}