package io.github.gallardorubio.banksystem.core.installment.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

import io.github.gallardorubio.banksystem.core.installment.entity.InstallmentEntity;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationResponse;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationStatusPhase;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationStatus;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;

public record InstallmentResponse(
    UUID id,
    UUID clientBankAccountId,
    BigDecimal amount,
    OperationStatus status,
    List<OperationStatusPhase> statusHistory,
    Instant createdAt,
    UUID loanId
) implements OperationResponse {
    public InstallmentResponse(InstallmentEntity entity) {
        this(
            entity.getId(),
            entity.getClientBankAccountId(),
            entity.getAmount(),
            entity.getStatus(),
            entity.getStatusHistory(),
            entity.getCreatedAt(),
            entity.getLoanId()
        );
    }

    @JsonProperty("operationType")
    @Override
    public OperationType operationType() {
        return OperationType.INSTALLMENT;
    }
}