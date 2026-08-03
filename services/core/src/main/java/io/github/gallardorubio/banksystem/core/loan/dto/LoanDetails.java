package io.github.gallardorubio.banksystem.core.loan.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import io.github.gallardorubio.banksystem.core.loan.entity.InstallmentFrequency;
import io.github.gallardorubio.banksystem.core.loan.entity.LoanEntity;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationStatus;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationRequestOrigin;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationStatusPhase;

public record LoanDetails(
    UUID id,
    UUID clientId,
    UUID clientBankAccountId,
    BigDecimal amount,
    OperationStatus status,
    List<OperationStatusPhase> statusHistory,
    OperationRequestOrigin origin,
    Instant createdAt,
    Integer termPeriods,
    InstallmentFrequency installmentFrequency,
    BigDecimal interestRate
) {
    public LoanDetails(LoanEntity entity) {
        this(
            entity.getId(),
            entity.getClientId(),
            entity.getClientBankAccountId(),
            entity.getAmount(),
            entity.getStatus(),
            entity.getStatusHistory(),
            entity.getOrigin(),
            entity.getCreatedAt(),
            entity.getTermPeriods(),
            entity.getInstallmentFrequency(),
            entity.getInterestRate()
        );
    }
}
