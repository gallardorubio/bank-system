package io.github.gallardorubio.banksystem.core.client.dto;

import java.util.UUID;

public record TrustedBankAccountResponse(
    UUID bankAccountId,
    String clientName
) {}