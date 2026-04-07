package io.github.gallardorubio.banksystem.record.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record OperationRejected(

    @NotNull 
    UUID operationId

) 
{}
