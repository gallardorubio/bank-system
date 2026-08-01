package io.github.gallardorubio.banksystem.core.loan.dto;

public record LoanResolutionRequest(
    String action,
    String reason
) {}