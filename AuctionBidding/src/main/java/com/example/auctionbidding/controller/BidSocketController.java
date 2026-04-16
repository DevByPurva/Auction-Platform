package com.example.auctionbidding.controller;

import com.example.auctionbidding.model.Bid;
import com.example.auctionbidding.model.BidUpdatePayload;
import com.example.auctionbidding.model.BidUpdatePayload.BidEntry;
import com.example.auctionbidding.service.AuctionService;
import com.example.auctionbidding.service.BidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class BidSocketController {

    @Autowired private BidService bidService;
    @Autowired private AuctionService auctionService;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    /**
     * Clients send to /app/bid
     * Payload: { auctionId, userId, amount }
     */
    @MessageMapping("/bid")
    public void handleBid(Map<String, String> data) {

        String auctionIdStr = data.get("auctionId");
        String userIdStr    = data.get("userId");
        String amountStr    = data.get("amount");

        if (auctionIdStr == null || userIdStr == null || amountStr == null) return;

        Long   auctionId = Long.parseLong(auctionIdStr);
        Long   userId    = Long.parseLong(userIdStr);
        Double amount    = Double.parseDouble(amountStr);

        var auction = auctionService.getAuction(auctionId);
        if (auction == null || auction.getEndTime().isBefore(LocalDateTime.now())) return;

        // Who was the previous highest bidder before this bid?
        List<Bid> prevHistory = bidService.getHistory(auctionId);
        Long prevHighestUserId = prevHistory.isEmpty() ? null
                : prevHistory.get(0).getUser().getId();

        String result = bidService.placeBid(auctionId, userId, amount);
        if (!"Bid placed successfully".equals(result)) return;

        broadcastUpdate(auctionId);

        // Notify the outbid user
        if (prevHighestUserId != null && !prevHighestUserId.equals(userId)) {
            sendNotification(prevHighestUserId,
                    "outbid",
                    "You have been outbid on \"" + auction.getItemName() + "\"! New price: ₹" + amount);
        }
    }

    /** Broadcast auction state to all subscribers */
    public void broadcastUpdate(Long auctionId) {

        var auction = auctionService.getAuction(auctionId);
        List<Bid> history = bidService.getHistory(auctionId);

        String highestBidder = history.isEmpty() ? "None"
                : history.get(0).getUser().getUsername();

        List<BidEntry> entries = history.stream()
                .map(b -> new BidEntry(b.getUser().getUsername(), b.getAmount(), b.getCreatedAt()))
                .collect(Collectors.toList());

        BidUpdatePayload payload = new BidUpdatePayload(
                auctionId,
                auction.getCurrentPrice(),
                highestBidder,
                entries
        );

        messagingTemplate.convertAndSend("/topic/auction/" + auctionId, payload);
    }

    /** Send a personal notification to a specific user */
    public void sendNotification(Long userId, String type, String message) {
        Map<String, String> notification = Map.of(
                "type", type,
                "message", message,
                "timestamp", String.valueOf(System.currentTimeMillis())
        );
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, notification);
    }
}
