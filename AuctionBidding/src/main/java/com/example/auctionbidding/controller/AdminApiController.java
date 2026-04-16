package com.example.auctionbidding.controller;

import com.example.auctionbidding.model.Admin;
import com.example.auctionbidding.model.Auction;
import com.example.auctionbidding.model.Bid;
import com.example.auctionbidding.repository.AdminRepository;
import com.example.auctionbidding.repository.AuctionRepository;
import com.example.auctionbidding.service.BidService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminApiController {

    @Autowired private AuctionRepository auctionRepo;
    @Autowired private AdminRepository adminRepo;
    @Autowired private BidService bidService;
    @Autowired private BidSocketController bidSocketController;

    /** POST /admin/login — checks admin table ONLY */
    @PostMapping("/login")
    public Admin adminLogin(@RequestBody Map<String, String> data) {
        return adminRepo.findByUsernameAndPassword(
                data.get("username"), data.get("password"));
    }

    /** GET /admin/auctions */
    @GetMapping("/auctions")
    public List<Auction> getAllAuctions() {
        return auctionRepo.findAll();
    }

    /** GET /admin/auctions/{id}/bids */
    @GetMapping("/auctions/{id}/bids")
    public List<Bid> getBidsForAuction(@PathVariable Long id) {
        return bidService.getHistory(id);
    }

    /** POST /admin/closeAuction/{id} */
    @PostMapping("/closeAuction/{id}")
    public String closeAuction(@PathVariable Long id) {
        Auction a = auctionRepo.findById(id).orElse(null);
        if (a == null) return "Auction not found";
        a.setEndTime(LocalDateTime.now().minusSeconds(1));
        auctionRepo.save(a);
        bidSocketController.broadcastUpdate(id);
        return "Auction closed";
    }
}
