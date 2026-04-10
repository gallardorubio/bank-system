package io.github.gallardorubio.banksystem.core.transfer.dto;

import jakarta.validation.constraints.NotBlank;

public record TransferResolutionRequest(

    @NotBlank String reason
    
) {}