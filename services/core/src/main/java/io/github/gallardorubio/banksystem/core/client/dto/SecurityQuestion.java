package io.github.gallardorubio.banksystem.core.client.dto;

import java.util.UUID;

public record SecurityQuestion(
    UUID id,
    String question,
    String answer
) {}