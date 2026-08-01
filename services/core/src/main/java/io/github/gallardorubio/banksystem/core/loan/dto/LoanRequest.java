package io.github.gallardorubio.banksystem.core.loan.dto;

import io.github.gallardorubio.banksystem.core.loan.entity.InstallmentFrequency;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record LoanRequest(
    @NotNull UUID clientBankAccountId,
    @NotNull @Positive BigDecimal amount,
    @NotNull @Positive Integer termPeriods,
    @NotNull InstallmentFrequency installmentFrequency,
    @NotNull @Positive BigDecimal interestRate

) {}