package io.github.gallardorubio.banksystem.core.deposit.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record DepositDetails(
    @NotNull UUID targetAccountId
) {}