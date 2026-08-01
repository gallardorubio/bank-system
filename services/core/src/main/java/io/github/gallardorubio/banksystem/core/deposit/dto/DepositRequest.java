package io.github.gallardorubio.banksystem.core.deposit.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;

public record DepositRequest(
    @NotNull UUID clientBankAccountId,
    @NotNull @Positive BigDecimal amount
    
) {}