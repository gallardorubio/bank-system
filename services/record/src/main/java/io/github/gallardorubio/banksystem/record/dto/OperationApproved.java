package io.github.gallardorubio.banksystem.record.dto;

import java.math.BigDecimal;
import java.util.UUID;

import io.github.gallardorubio.banksystem.record.entity.OperationType;
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
