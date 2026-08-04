package io.github.gallardorubio.banksystem.core.client.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

public record SecurityAnswersRequest(
    @NotEmpty List<SecurityAnswer> answers
) {
    public record SecurityAnswer(
        UUID questionId,
        String answer
    ) {}
}