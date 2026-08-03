package io.github.gallardorubio.banksystem.core.deposit.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import io.github.gallardorubio.banksystem.core.deposit.entity.DepositEntity;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationResponse;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationStatusPhase;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationStatus;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;

public record DepositResponse (
    UUID id,
    UUID clientBankAccountId,
    BigDecimal amount,
    OperationStatus status,
    List<OperationStatusPhase> statusHistory,
    Instant createdAt
) implements OperationResponse {
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

    @Override
    public OperationType operationType() {
        return OperationType.DEPOSIT;
    }
}