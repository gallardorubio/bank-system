package io.github.gallardorubio.banksystem.core.deposit.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationStatus;
import io.github.gallardorubio.banksystem.core.operation.entity.RequestOrigin;
import io.github.gallardorubio.banksystem.core.operation.entity.StatusEntry;

public record DepositResponse (
    BigDecimal amount,
    OperationStatus status,
    List<StatusEntry> statusHistory,
    RequestOrigin origin,
    Instant createdAt
) {}
