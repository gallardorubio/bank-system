package io.github.gallardorubio.banksystem.record.dto;

import io.github.gallardorubio.banksystem.record.entity.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record AccountCreateRequest(
    @NotNull UUID ownerId,
    @NotNull AccountType type,
    @NotBlank @Size(min = 3, max = 3) String currency
) {}