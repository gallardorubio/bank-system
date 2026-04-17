package io.github.gallardorubio.banksystem.users.dto;

import jakarta.validation.constraints.NotBlank;

public record SecurityQuestionRequest(
    @NotBlank String question,
    @NotBlank String answer
) {}