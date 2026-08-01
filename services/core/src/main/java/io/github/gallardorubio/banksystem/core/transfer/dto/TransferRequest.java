package io.github.gallardorubio.banksystem.core.transfer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;

public record TransferRequest(
    @NotNull UUID clientBankAccountId,
    @NotNull @Positive BigDecimal amount,
    @NotNull UUID targetBankAccountId,
    @NotBlank String concept
) {}