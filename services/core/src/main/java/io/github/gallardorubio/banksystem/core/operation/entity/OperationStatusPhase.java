package io.github.gallardorubio.banksystem.core.operation.entity;

import java.time.Instant;

public record OperationStatusPhase(
    OperationStatus status,
    Instant createAt,
    String reason
) {}