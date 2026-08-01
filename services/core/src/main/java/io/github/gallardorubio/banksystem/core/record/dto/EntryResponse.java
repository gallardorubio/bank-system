package io.github.gallardorubio.banksystem.core.record.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import io.github.gallardorubio.banksystem.core.record.entity.EntryEntity;

public record EntryResponse(
    UUID id,
    UUID debitBankAccountId,
    UUID creditBankAccountId,
    BigDecimal amount,
    UUID operationId,
    Instant createdAt
) {
    public EntryResponse(EntryEntity entity, UUID clientBankAccountId) {
        this(
            entity.getId(),
            entity.getDebitBankAccountId(),
            entity.getCreditBankAccountId(),
            entity.getAmount(),
            entity.getOperationId(),
            entity.getCreatedAt()
        );
    }
}