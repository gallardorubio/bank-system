package io.github.gallardorubio.banksystem.core.record.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record EntrySummary(
    BigDecimal amount,
    String side,
    String operationType,
    Instant createdAt
) {}