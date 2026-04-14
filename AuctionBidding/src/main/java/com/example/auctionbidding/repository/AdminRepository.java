package com.example.auctionbidding.repository;

import com.example.auctionbidding.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin,Long>{

    Admin findByUsernameAndPassword(String username,String password);

}