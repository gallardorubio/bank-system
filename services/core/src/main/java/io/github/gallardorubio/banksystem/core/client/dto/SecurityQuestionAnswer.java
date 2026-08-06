package io.github.gallardorubio.banksystem.core.client.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record SecurityQuestionAnswer(
    @Min(value = 1, message = "El ID de la pregunta no es válido")
    int questionId,
    @NotBlank(message = "La respuesta a la pregunta de seguridad es obligatoria")
    String answer
) {}