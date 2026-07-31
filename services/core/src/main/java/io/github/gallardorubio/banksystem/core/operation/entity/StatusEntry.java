package io.github.gallardorubio.banksystem.core.operation.entity;

import java.time.LocalDateTime;

public record StatusEntry(
    OperationStatus status,
    LocalDateTime createAt,
    String reason
) {}