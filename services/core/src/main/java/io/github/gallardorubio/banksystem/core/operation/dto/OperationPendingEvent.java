package io.github.gallardorubio.banksystem.core.operation.dto;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record OperationPendingEvent<T>(
    @NotNull UUID operationId,
    @NotNull OperationType operationType,
    @Valid @NotNull T details
) {}