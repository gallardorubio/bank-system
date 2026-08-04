package io.github.gallardorubio.banksystem.core.client.dto;

import jakarta.validation.constraints.NotBlank;

public record MfaVerifyRequest(
    @NotBlank String totpCode
) {}