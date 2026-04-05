package io.github.gallardorubio.banksystem.record.dto;

public record OperationCompleted(

    @NotNull 
    UUID operationId,

) 
{}
