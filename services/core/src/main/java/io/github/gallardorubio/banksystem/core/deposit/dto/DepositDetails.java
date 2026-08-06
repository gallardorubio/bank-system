package io.github.gallardorubio.banksystem.core.deposit.dto;

import io.github.gallardorubio.banksystem.core.deposit.entity.DepositEntity;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationStatus;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationRequestOrigin;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationStatusPhase;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record DepositDetails(
    UUID clientId,
    UUID clientBankAccountId,
    BigDecimal amount,
    OperationStatus status,
    List<OperationStatusPhase> statusHistory,
    OperationRequestOrigin origin,
    Instant createdAt
) {
    public DepositDetails(DepositEntity entity) {
        this(
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