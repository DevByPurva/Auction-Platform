package com.example.auctionbidding.controller;

import com.example.auctionbidding.model.Auction;
import com.example.auctionbidding.repository.AuctionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private static final List<String> ALLOWED_CATEGORIES = List.of("PHONE", "LAPTOP", "EQUIPMENT");
    private final AuctionRepository repo;

    public AdminController(AuctionRepository repo) {
        this.repo = repo;
    }

    @PostMapping("/addAuction")
    public ResponseEntity<?> addAuction(
            @RequestParam String itemName,
            @RequestParam double price,
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam String imagePath,
            // new fields
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String color,
            @RequestParam(required = false, defaultValue = "0") int yearsUsed,
            @RequestParam(required = false) String description,
            @RequestParam String category) {

        // Category validation
        if (category == null || !ALLOWED_CATEGORIES.contains(category.toUpperCase()))
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Category must be one of: PHONE, LAPTOP, EQUIPMENT"));

        // Time validation
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
        LocalDateTime start = LocalDateTime.parse(startTime, fmt);
        LocalDateTime end   = LocalDateTime.parse(endTime,   fmt);
        LocalDateTime now   = LocalDateTime.now();

        if (start.isBefore(now))
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Start time must be in the future"));
        if (!start.isBefore(end))
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Start time must be before end time"));

        if (yearsUsed < 0)
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Years used cannot be negative"));

        Auction a = new Auction();
        a.setItemName(itemName);
        a.setCurrentPrice(price);
        a.setImageUrl(imagePath);
        a.setStartTime(start);
        a.setEndTime(end);
        a.setBrand(brand);
        a.setModel(model);
        a.setColor(color);
        a.setYearsUsed(yearsUsed);
        a.setDescription(description);
        a.setCategory(category.toUpperCase());

        return ResponseEntity.ok(repo.save(a));
    }

    @PostMapping("/uploadImage")
    public String uploadImage(@RequestParam("file") MultipartFile file) throws Exception {
        String uploadDir = "uploads/images/";
        String fileName  = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadDir + fileName);
        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());
        return "/images/" + fileName;
    }
}
