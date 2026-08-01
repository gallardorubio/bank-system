package io.github.gallardorubio.banksystem.core.deposit.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import io.github.gallardorubio.banksystem.core.deposit.entity.DepositEntity;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationStatus;
import io.github.gallardorubio.banksystem.core.operation.entity.StatusEntry;

public record DepositResponse (
    UUID id,
    UUID clientBankAccountId,
    BigDecimal amount,
    OperationStatus status,
    List<StatusEntry> statusHistory,
    Instant createdAt
) {
    public DepositResponse(DepositEntity entity) {
        this(
            entity.getId(),
            entity.getClientBankAccountId(),
            entity.getAmount(),
            entity.getStatus(),
            entity.getStatusHistory(),
            entity.getCreatedAt()
        );
    }
}