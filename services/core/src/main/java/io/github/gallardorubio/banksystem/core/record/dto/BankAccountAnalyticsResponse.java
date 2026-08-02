package io.github.gallardorubio.banksystem.core.record.dto;

import java.math.BigDecimal;

public record BankAccountAnalyticsResponse(
        Long totalClientBankAccount,
        BigDecimal vaultBalance,
        BigDecimal totalClientBalance,
        Double averageClientBalance
) {}