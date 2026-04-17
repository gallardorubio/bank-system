package io.github.gallardorubio.banksystem.users.dto;

import io.github.gallardorubio.banksystem.users.entity.Role;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record UserRequest(
    @NotBlank String name,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8) String password,
    @NotNull Role role,
    @NotBlank String taxId,
    @NotBlank String phone,
    @NotBlank String address,
    @NotBlank String nationality,
    @NotNull LocalDate birthDate,
    @NotBlank String birthPlace,
    @NotNull @Size(min = 1) List<@Valid SecurityQuestionRequest> securityQuestions
) {}