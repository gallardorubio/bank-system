package io.github.gallardorubio.banksystem.core.operation.dto;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationDirection;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public interface OperationEntryProjection {
    UUID getId();
    UUID getOperationId();
    OperationType getOperationType();
    String getDescription();
    BigDecimal getAmount();
    OperationDirection getOperationDirection();
    Instant getCreatedAt();
}