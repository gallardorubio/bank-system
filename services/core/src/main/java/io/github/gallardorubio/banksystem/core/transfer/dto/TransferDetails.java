package io.github.gallardorubio.banksystem.core.transfer.dto;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationStatus;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationRequestOrigin;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationStatusPhase;
import io.github.gallardorubio.banksystem.core.transfer.entity.TransferEntity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TransferDetails(
    UUID id,
    UUID clientId,
    UUID clientBankAccountId,
    BigDecimal amount,
    OperationStatus status,
    List<OperationStatusPhase> statusHistory,
    OperationRequestOrigin origin,
    Instant createdAt,
    UUID targetBankAccountId,
    String concept
) {
    public TransferDetails(TransferEntity entity) {
        this(
            entity.getId(),
            entity.getClientId(),
            entity.getClientBankAccountId(),
            entity.getAmount(),
            entity.getStatus(),
            entity.getStatusHistory(),
            entity.getOrigin(),
            entity.getCreatedAt(),
            entity.getTargetBankAccountId(),
            entity.getConcept()
        );
    }
}