package io.github.gallardorubio.banksystem.core.operation.dto;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record OperationEventResolution(
    @NotNull UUID operationId,
    @NotNull OperationType operationType,
    String reason
) {}