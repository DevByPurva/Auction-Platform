package com.example.auctionbidding.controller;

import com.example.auctionbidding.model.Auction;
import com.example.auctionbidding.repository.AuctionRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AuctionRepository repo;

    public AdminController(AuctionRepository repo){
        this.repo = repo;
    }


    @PostMapping("/addAuction")
    public Auction addAuction(
            @RequestParam String itemName,
            @RequestParam double price,
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam String imagePath){

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");

        Auction a = new Auction();

        a.setItemName(itemName);
        a.setCurrentPrice(price);
        a.setImageUrl(imagePath);

        a.setStartTime(LocalDateTime.parse(startTime, formatter));
        a.setEndTime(LocalDateTime.parse(endTime, formatter));

        return repo.save(a);
    }
    @PostMapping("/uploadImage")
    public String uploadImage(@RequestParam("file") MultipartFile file) throws Exception {

        String uploadDir = "uploads/images/";

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

        Path path = Paths.get(uploadDir + fileName);

        Files.createDirectories(path.getParent());

        Files.write(path, file.getBytes());

        return "/images/" + fileName;
    }

}