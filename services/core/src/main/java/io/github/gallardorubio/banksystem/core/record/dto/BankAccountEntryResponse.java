package io.github.gallardorubio.banksystem.core.record.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationDirection;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import io.github.gallardorubio.banksystem.core.record.entity.EntryEntity;

public record BankAccountEntryResponse(
    UUID id,
    UUID operationId,
    OperationType operationType,
    String description,
    BigDecimal amount,
    OperationDirection operationDirection,
    Instant createdAt
) {
    public BankAccountEntryResponse(
        EntryEntity entryEntity,
        UUID bankAccountId,
        OperationEntity operationEntity,
        String customDescription
    ) {
        this(
            entryEntity.getId(),
            entryEntity.getOperationId(),
            operationEntity != null ? operationEntity.getOperationType() : null,
            customDescription,
            entryEntity.getAmount(),
            entryEntity.getCreditBankAccountId().equals(bankAccountId) ? OperationDirection.CREDIT : OperationDirection.DEBIT,
            entryEntity.getCreatedAt()
        );
    }

    public BankAccountEntryResponse(
        EntryEntity entryEntity,
        UUID bankAccountId,
        OperationEntity operationEntity
    ) {
        this(
            entryEntity,
            bankAccountId,
            operationEntity,
            operationEntity != null ? operationEntity.buildDescription() : "Movimiento en cuenta"
        );
    }
}