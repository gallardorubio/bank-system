package io.github.gallardorubio.banksystem.core.deposit.dto;

import io.github.gallardorubio.banksystem.core.deposit.entity.DepositEntity;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationStatus;
import io.github.gallardorubio.banksystem.core.operation.entity.RequestOrigin;
import io.github.gallardorubio.banksystem.core.operation.entity.StatusEntry;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DepositDetails(
    UUID id,
    UUID clientId,
    UUID clientBankAccountId,
    BigDecimal amount,
    OperationStatus status,
    List<StatusEntry> statusHistory,
    RequestOrigin origin,
    Instant createdAt
) {
    public DepositDetails(DepositEntity entity) {
        this(
            entity.getId(),
            entity.getClientId(),
            entity.getClientBankAccountId(),
            entity.getAmount(),
            entity.getStatus(),
            entity.getStatusHistory(),
            entity.getOrigin(),
            entity.getCreatedAt()
        );
    }
}