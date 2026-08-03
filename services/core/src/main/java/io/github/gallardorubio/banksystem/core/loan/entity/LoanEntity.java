package io.github.gallardorubio.banksystem.core.loan.entity;

import io.github.gallardorubio.banksystem.core.loan.dto.LoanRequest;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationRequestOrigin;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Entity
@SuperBuilder
@Table(name = "loan", schema = "core")
public class LoanEntity extends OperationEntity {

    @Column(name = "term_periods", nullable = false, updatable = false)
    private Integer termPeriods;

    @Enumerated(EnumType.STRING)
    @Column(name = "installmentFrequency", nullable = false, updatable = false)
    private InstallmentFrequency installmentFrequency;

    @Column(name = "interest_rate", nullable = false, updatable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "paid_amount", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "installments_paid", nullable = false)
    @Builder.Default
    private Integer installmentsPaid = 0;

    @Column(name = "next_installment_amount", precision = 19, scale = 4)
    private BigDecimal nextInstallmentAmount;    

    @Column(name = "next_installment_date")
    private Instant nextInstallmentDate;

    @Column(name = "maturity_date")
    private Instant maturityDate;

    public static LoanEntity fromDto(LoanRequest dto, UUID clientId, OperationRequestOrigin origin) {
        return LoanEntity.builder()
            .clientId(clientId)
            .clientBankAccountId(dto.clientBankAccountId())
            .amount(dto.amount())
            .termPeriods(dto.termPeriods())
            .installmentFrequency(dto.installmentFrequency())
            .interestRate(dto.interestRate())
            .origin(origin)
            .createdAt(Instant.now())
            .build();
    }

    public void registerNextInstallment(Instant nextDate) {
        this.paidAmount = this.paidAmount.add(this.nextInstallmentAmount);
        this.installmentsPaid++;
        
        if (this.installmentsPaid.equals(this.termPeriods)) {
            this.nextInstallmentDate = null;
        } else {
            this.nextInstallmentDate = nextDate;
        }
    }

    public void registerFirstInstallment() {
        BigDecimal annualRateDecimal = this.interestRate.divide(BigDecimal.valueOf(100), 8, RoundingMode.HALF_UP);
        BigDecimal years = BigDecimal.valueOf(this.termPeriods)
                .divide(BigDecimal.valueOf(this.installmentFrequency.getPeriodsPerYear()), 8, RoundingMode.HALF_UP);
        
        BigDecimal totalInterest = this.getAmount().multiply(annualRateDecimal).multiply(years);
        BigDecimal totalToPay = this.getAmount().add(totalInterest);

        this.nextInstallmentAmount = totalToPay.divide(BigDecimal.valueOf(this.termPeriods), 4, RoundingMode.HALF_UP);

        Instant now = Instant.now();
        this.nextInstallmentDate = now.plus(this.installmentFrequency.getDaysToAdd(), ChronoUnit.DAYS);

        long totalDays = (long) this.installmentFrequency.getDaysToAdd() * this.termPeriods;
        this.maturityDate = now.plus(totalDays, ChronoUnit.DAYS);
    }

    @Override
    public OperationType getOperationType() {
        return OperationType.LOAN;
    }

    @Override
    public String buildDescription() {
        return "Préstamo en cuenta";
    }

}
