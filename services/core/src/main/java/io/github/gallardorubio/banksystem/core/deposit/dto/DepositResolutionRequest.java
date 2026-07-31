package io.github.gallardorubio.banksystem.core.deposit.dto;

public record DepositResolutionRequest(
    String action,
    String reason
) {}