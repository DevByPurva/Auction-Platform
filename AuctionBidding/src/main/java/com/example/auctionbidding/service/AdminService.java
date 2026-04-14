package com.example.auctionbidding.service;

import com.example.auctionbidding.model.Admin;
import com.example.auctionbidding.repository.AdminRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final AdminRepository repo;

    public AdminService(AdminRepository repo){
        this.repo = repo;
    }

    public Admin login(String username,String password){
        return repo.findByUsernameAndPassword(username,password);
    }
}