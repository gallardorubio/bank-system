package io.github.gallardorubio.banksystem.core.client.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ClientPersonalUpdateRequest(
    String name,
    String phone,
    String address,
    String nationality,
    LocalDate birthDate,
    @Email String email,
    @NotNull int questionId,
    @NotBlank String answer
) {}