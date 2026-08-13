package io.github.gallardorubio.banksystem.core.operation.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationDirection;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import io.github.gallardorubio.banksystem.core.record.entity.EntryEntity;

public record OperationEntryResponse (
    UUID id,
    UUID operationId,
    OperationType operationType,
    String description,
    BigDecimal amount,
    OperationDirection operationDirection,
    Instant createdAt
) {
    public OperationEntryResponse(
        EntryEntity entryEntity,
        UUID bankAccountId,
        OperationEntity operationEntity
    ) {
        this(
            entryEntity.getId(),
            entryEntity.getOperationId(),
            operationEntity.getOperationType(),
            operationEntity.buildDescription(),
            entryEntity.getAmount(),
            entryEntity.getCreditBankAccountId().equals(bankAccountId) ? OperationDirection.CREDIT : OperationDirection.DEBIT,
            entryEntity.getCreatedAt()
        );
    }
}