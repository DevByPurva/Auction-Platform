package com.example.auctionbidding.service;

import com.example.auctionbidding.model.Auction;
import com.example.auctionbidding.repository.AuctionRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AuctionService {

    private final AuctionRepository repo;

    public AuctionService(AuctionRepository repo){
        this.repo = repo;
    }

    public List<Auction> getAll(){
        return repo.findAll();
    }

    public Auction getById(Long id){
        return repo.findById(id).orElse(null);
    }
    public Auction getAuction(Long id){
        return repo.findById(id).orElse(null);
    }
}