package com.example.auctionbidding.service;

import com.example.auctionbidding.model.User;
import com.example.auctionbidding.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo){
        this.repo=repo;
    }

    public User login(String username,String password){
        return repo.findByUsernameAndPassword(username,password);
    }
}