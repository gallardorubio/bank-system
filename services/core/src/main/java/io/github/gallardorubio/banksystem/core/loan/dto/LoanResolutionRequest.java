package io.github.gallardorubio.banksystem.core.loan.dto;

import jakarta.validation.constraints.NotBlank;

public record LoanResolutionRequest(
    @NotBlank String reason
) {}