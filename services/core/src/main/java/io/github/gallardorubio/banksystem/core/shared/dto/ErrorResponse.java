package io.github.gallardorubio.banksystem.core.shared.dto;

import java.time.Instant;

public record ErrorResponse(
    int status,
    String error,
    String message,
    Instant timestamp
) {}