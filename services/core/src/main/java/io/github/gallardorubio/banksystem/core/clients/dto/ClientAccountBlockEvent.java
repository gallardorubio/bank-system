package io.github.gallardorubio.banksystem.core.clients.dto;

import java.util.UUID;

public record ClientAccountBlockEvent(
    UUID clientId
) {
}