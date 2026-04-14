package com.example.auctionbidding.controller;

import com.example.auctionbidding.model.Auction;
import com.example.auctionbidding.repository.AuctionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AuctionController {

    private final AuctionRepository repo;

    public AuctionController(AuctionRepository repo){
        this.repo=repo;
    }

    @GetMapping("/auctions")
    public List<Auction> getAll(){
        return repo.findAll();
    }

    @GetMapping("/auctions/{id}")
    public Auction getOne(@PathVariable Long id){
        return repo.findById(id).orElse(null);
    }
}