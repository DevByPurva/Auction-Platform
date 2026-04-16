package com.example.auctionbidding.service;

import com.example.auctionbidding.model.User;
import com.example.auctionbidding.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    /** Login — only USER role allowed, never ADMIN */
    public User login(String username, String password) {
        User user = repo.findByUsernameAndPassword(username, password);
        if (user == null) return null;
        if ("ADMIN".equalsIgnoreCase(user.getRole())) return null; // block admin
        return user;
    }

    /** Signup — returns error string or null on success */
    public String signup(String username, String email, String password) {
        if (username == null || username.trim().isEmpty())
            return "Username is required";
        if (password == null || password.length() < 4)
            return "Password must be at least 4 characters";
        if (email == null || !email.contains("@"))
            return "Valid email is required";
        if (repo.existsByUsername(username.trim()))
            return "Username already taken";
        if (repo.existsByEmail(email.trim()))
            return "Email already registered";

        User u = new User();
        u.setUsername(username.trim());
        u.setEmail(email.trim());
        u.setPassword(password);
        u.setRole("USER");
        repo.save(u);
        return null; // null = success
    }
}
