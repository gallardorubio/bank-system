package io.github.gallardorubio.banksystem.core.operation.dto;

import java.util.UUID;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import jakarta.validation.constraints.NotNull;

public record OperationDenied(

    @NotNull 
    UUID operationId,

    @NotNull
    OperationType operationType,

    @NotNull
    String reason

) {}
