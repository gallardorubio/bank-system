package io.github.gallardorubio.banksystem.users.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record UserRegistered(
    @NotNull
    UUID userId
) {}