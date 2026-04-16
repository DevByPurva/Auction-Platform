package com.example.auctionbidding.controller;

import com.example.auctionbidding.model.User;
import com.example.auctionbidding.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    /** POST /login — users only, admin blocked */
    @PostMapping("/login")
    public User login(@RequestBody Map<String, String> data) {
        return service.login(data.get("username"), data.get("password"));
    }

    /** POST /signup */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> data) {
        String error = service.signup(
                data.get("username"),
                data.get("email"),
                data.get("password")
        );
        if (error != null) return ResponseEntity.badRequest().body(error);
        return ResponseEntity.ok("Signup successful");
    }
}
