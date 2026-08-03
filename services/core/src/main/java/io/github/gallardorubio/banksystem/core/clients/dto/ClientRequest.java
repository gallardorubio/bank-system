package io.github.gallardorubio.banksystem.core.clients.dto;

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
    @NotEmpty List<SecurityQuestion> securityQuestions,
    @NotBlank
    @Size(min = 8, message = "La contraseña debe tener más de 8 caracteres")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!.]).*$", 
        message = "La contraseña debe contener mayúsculas, minúsculas, números y un carácter especial"
    )
    String password
) {}