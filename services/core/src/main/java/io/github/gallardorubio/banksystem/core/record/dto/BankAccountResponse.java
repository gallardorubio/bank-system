package io.github.gallardorubio.banksystem.core.record.dto;

import java.math.BigDecimal;
import java.util.UUID;
import io.github.gallardorubio.banksystem.core.record.entity.BankAccountEntity;

public record BankAccountResponse(
    UUID id,
    String clientName,
    String currency,
    BigDecimal balance
) {
    public BankAccountResponse(BankAccountEntity entity) {
        this(
            entity.getId(),
            entity.getClientName(),
            entity.getCurrency(),
            entity.getBalance()
        );
    }
}