package io.github.gallardorubio.banksystem.users.controller;

import io.github.gallardorubio.banksystem.users.dto.UserRequest;
import io.github.gallardorubio.banksystem.users.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/users")
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UUID> registerUser(@Valid @RequestBody UserRequest userRequest) {
        UUID userId = userService.initiateUserRegistration(userRequest);

        return ResponseEntity.status(HttpStatus.CREATED).body(userId);
    }
    
}