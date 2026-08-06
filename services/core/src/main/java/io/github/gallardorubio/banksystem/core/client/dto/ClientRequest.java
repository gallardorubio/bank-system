package io.github.gallardorubio.banksystem.core.client.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record ClientRequest(
    @NotBlank String name,
    @NotBlank String phone,
    @NotBlank String address,
    @NotBlank String nationality,
    @NotNull LocalDate birthDate,
    @NotBlank @Email String email,
    @NotBlank String taxId,
    @NotNull(message = "Las preguntas de seguridad no pueden ser nulas")
    @Size(min = 3, max = 3, message = "Debe proporcionar exactamente 3 preguntas de seguridad")
    @NotEmpty 
    List<@Valid SecurityQuestionAnswer> securityQuestionAnswers,
    @NotBlank
    @Size(min = 8, message = "La contraseña debe tener más de 8 caracteres")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!.]).*$", 
        message = "La contraseña debe contener mayúsculas, minúsculas, números y un carácter especial"
    )
    String password
) {}