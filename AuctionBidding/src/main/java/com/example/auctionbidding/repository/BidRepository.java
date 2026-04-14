package com.example.auctionbidding.repository;

import com.example.auctionbidding.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid,Long>{

    List<Bid> findByAuctionIdOrderByAmountDesc(Long auctionId);

}