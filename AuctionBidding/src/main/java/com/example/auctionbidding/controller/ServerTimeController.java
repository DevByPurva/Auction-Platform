package com.example.auctionbidding.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class ServerTimeController {

    @GetMapping("/server-time")
    public Map<String, Long> serverTime() {
        return Map.of("timestamp", Instant.now().toEpochMilli());
    }
}
