package io.github.gallardorubio.banksystem.core.transfer.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TransferDetails(
    @NotNull UUID debitAccountId,
    @NotNull UUID creditAccountId
) {}