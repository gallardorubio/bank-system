package io.github.gallardorubio.banksystem.core.fraud.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record FraudDetectedEvent(
    UUID operationId,
    UUID clientId,
    UUID clientBankAccountId,
    BigDecimal amount,
    String reason
) {}