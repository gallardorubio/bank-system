package io.github.gallardorubio.banksystem.core.operation.entity;

import java.time.Instant;
import java.time.LocalDateTime;

public record StatusEntry(
    OperationStatus status,
    Instant createAt,
    String reason
) {}