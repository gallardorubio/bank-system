package io.github.gallardorubio.banksystem.core.deposit.dto;

import jakarta.validation.constraints.NotBlank;

public record DepositResolutionRequest(

    @NotBlank String reason
    
) {}