package io.github.gallardorubio.banksystem.core.client.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record SecurityQuestionAnswersRequest(
    @NotEmpty List<SecurityAnswer> answers
) {
    public record SecurityAnswer(
        int questionId,
        String answer
    ) {}
}