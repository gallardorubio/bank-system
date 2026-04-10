package io.github.gallardorubio.banksystem.core.operation.dto;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record OperationPending<T>(
    
    @NotNull 
    UUID operationId,

    @NotNull 
    @Positive 
    BigDecimal amount,

    @NotNull 
    OperationType operationType,

    @Valid 
    @NotNull T details

) {}