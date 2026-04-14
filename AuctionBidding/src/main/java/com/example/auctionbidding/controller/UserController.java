package com.example.auctionbidding.controller;

import com.example.auctionbidding.model.User;
import com.example.auctionbidding.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class UserController {

    private final UserService service;

    public UserController(UserService service){
        this.service=service;
    }

    @PostMapping("/login")
    public User login(@RequestBody Map<String,String> data){

        return service.login(
                data.get("username"),
                data.get("password")
        );
    }
}