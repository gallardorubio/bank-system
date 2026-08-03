package io.github.gallardorubio.banksystem.core.clients.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record ClientPersonalUpdateRequest(
    String name,
    String phone,
    String address,
    String nationality,
    LocalDate birthDate,
    @Email String email,
    @NotNull UUID questionId,
    @NotBlank String answer
) {}