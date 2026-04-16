package io.github.gallardorubio.banksystem.core.loan.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record LoanDetails(
    @NotNull UUID targetAccountId
) {}