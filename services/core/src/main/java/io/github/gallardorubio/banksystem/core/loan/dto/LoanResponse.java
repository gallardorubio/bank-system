package io.github.gallardorubio.banksystem.core.loan.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import io.github.gallardorubio.banksystem.core.loan.entity.InstallmentFrequency;
import io.github.gallardorubio.banksystem.core.loan.entity.LoanEntity;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationResponse;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationStatusPhase;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationStatus;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;

public record LoanResponse(
    UUID id,
    UUID clientBankAccountId,
    BigDecimal amount,
    OperationStatus status,
    List<OperationStatusPhase> statusHistory,
    Instant createdAt,
    Integer termPeriods,
    InstallmentFrequency installmentFrequency,
    BigDecimal interestRate,
    BigDecimal paidAmount,
    Integer installmentsPaid,
    BigDecimal nextInstallmentAmount,
    Instant nextInstallmentDate,
    Instant maturityDate
) implements OperationResponse {
    public LoanResponse(LoanEntity entity) {
        this(
            entity.getId(),
            entity.getClientBankAccountId(),
            entity.getAmount(),
            entity.getStatus(),
            entity.getStatusHistory(),
            entity.getCreatedAt(),
            entity.getTermPeriods(),
            entity.getInstallmentFrequency(),
            entity.getInterestRate(),
            entity.getPaidAmount(),
            entity.getInstallmentsPaid(),
            entity.getNextInstallmentAmount(),
            entity.getNextInstallmentDate(),
            entity.getMaturityDate()
        );
    }

    @Override
    public OperationType operationType() {
        return OperationType.LOAN;
    }
}
