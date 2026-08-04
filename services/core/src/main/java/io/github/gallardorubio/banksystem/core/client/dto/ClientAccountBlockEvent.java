package io.github.gallardorubio.banksystem.core.client.dto;

import java.util.UUID;

public record ClientAccountBlockEvent(
    UUID clientId
) {
}