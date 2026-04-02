package io.github.gallardorubio.banksystem.record.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.UUID;

public record RecordOperationRequest(

    @NotNull 
    UUID operationId,
    
    @NotNull 
    UUID debitAccountId,

    @NotNull 
    UUID creditAccountId,

    @NotNull @Positive 
    BigDecimal amount

) {}
