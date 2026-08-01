package io.github.gallardorubio.banksystem.core.loan.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum InstallmentFrequency {

    MONTHLY(12, 30L),
    SEMI_ANNUAL(2, 180L),
    ANNUAL(1, 365L);

    private final int periodsPerYear;
    private final long daysToAdd;

}
