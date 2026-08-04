package io.github.gallardorubio.banksystem.core.clients.dto;

import jakarta.validation.constraints.NotBlank;

public record MfaVerifyRequest(
    @NotBlank String totpCode
) {}