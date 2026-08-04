package io.github.gallardorubio.banksystem.core.clients.dto;

public record MfaSetupResponse(
    String secretCode
) {}