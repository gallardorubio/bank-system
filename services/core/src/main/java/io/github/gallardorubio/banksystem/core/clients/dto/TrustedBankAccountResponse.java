package io.github.gallardorubio.banksystem.core.clients.dto;

import java.util.UUID;

public record TrustedBankAccountResponse(
    UUID bankAccountId,
    String clientName
) {}