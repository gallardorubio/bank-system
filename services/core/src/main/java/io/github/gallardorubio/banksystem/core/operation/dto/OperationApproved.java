package io.github.gallardorubio.banksystem.core.operation.dto;

import java.math.BigDecimal;
import java.util.UUID;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record OperationApproved(

    @NotNull 
    UUID operationId,
    
    @NotNull 
    UUID debitAccountId,

    @NotNull 
    UUID creditAccountId,

    @NotNull @Positive 
    BigDecimal amount,

    @NotNull
    OperationType operationType

) {}
