package io.github.gallardorubio.banksystem.core.transfer.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import io.github.gallardorubio.banksystem.core.operation.dto.OperationResponse;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationStatusPhase;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationStatus;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import io.github.gallardorubio.banksystem.core.transfer.entity.TransferEntity;

public record TransferResponse(
    UUID id,
    UUID clientBankAccountId,
    BigDecimal amount,
    OperationStatus status,
    List<OperationStatusPhase> statusHistory,
    Instant createdAt,
    UUID targetBankAccountId,
    String concept
) implements OperationResponse {
    public TransferResponse(TransferEntity entity) {
        this(
            entity.getId(),
            entity.getClientBankAccountId(),
            entity.getAmount(),
            entity.getStatus(),
            entity.getStatusHistory(),
            entity.getCreatedAt(),
            entity.getTargetBankAccountId(),
            entity.getConcept()
        );
    }

    @Override
    public OperationType operationType() {
        return OperationType.TRANSFER;
    }
}