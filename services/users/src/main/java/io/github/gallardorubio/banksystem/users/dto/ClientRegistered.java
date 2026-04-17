package io.github.gallardorubio.banksystem.users.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ClientRegistered(
    @NotNull
    UUID clientId
) {}