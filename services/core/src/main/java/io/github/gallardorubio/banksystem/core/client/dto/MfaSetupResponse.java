package io.github.gallardorubio.banksystem.core.client.dto;

public record MfaSetupResponse(
    String secretCode
) {}