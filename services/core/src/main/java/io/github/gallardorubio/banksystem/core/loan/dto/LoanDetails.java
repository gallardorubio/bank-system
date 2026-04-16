package io.github.gallardorubio.banksystem.core.loan.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record LoanDetails(
    @NotNull UUID ownerId,
    @NotNull UUID targetAccountId,
    @NotNull Integer termPeriods,
    @NotNull BigDecimal interestRate
) {}