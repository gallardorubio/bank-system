package io.github.gallardorubio.banksystem.core.operation.dto;

import java.time.Instant;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationStatus;

public record OperationStatusPhase(
    OperationStatus status,
    Instant createAt,
    String reason
) {}