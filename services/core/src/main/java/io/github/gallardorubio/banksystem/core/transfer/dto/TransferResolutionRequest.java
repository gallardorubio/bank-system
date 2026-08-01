package io.github.gallardorubio.banksystem.core.transfer.dto;

public record TransferResolutionRequest(

    String action,
    String reason
    
) {}