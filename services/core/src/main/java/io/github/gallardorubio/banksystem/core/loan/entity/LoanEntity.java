package io.github.gallardorubio.banksystem.core.loan.entity;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Entity
@Table(name = "loan", schema = "core")
public class LoanEntity extends OperationEntity {

    @Column(name = "target_account_id", nullable = false, updatable = false)
    private UUID targetAccountId;

    @Column(name = "term_periods", nullable = false, updatable = false)
    private Integer termPeriods;

    @Enumerated(EnumType.STRING)
    @Column(name = "installmentFrequency", nullable = false, updatable = false)
    private InstallmentFrequency installmentFrequency;

    // TIN
    @Column(name = "interest_rate", nullable = false, updatable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "paid_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal paidAmount;

    @Column(name = "next_installment_amount", precision = 19, scale = 4)
    private BigDecimal nextInstallmentAmount;

    @Column(name = "next_installment_principal", precision = 19, scale = 4)
    private BigDecimal nextInstallmentPrincipal;

    @Column(name = "next_installment_interest", precision = 19, scale = 4)
    private BigDecimal nextInstallmentInterest;

    @Column(name = "maturity_date")
    private Instant maturityDate;

    public LoanEntity(UUID targetAccountId, BigDecimal amount, Integer termPeriods, InstallmentFrequency installmentFrequency, BigDecimal interestRate) {
        super(amount);
        this.targetAccountId = targetAccountId;
        this.termPeriods = termPeriods;
        this.installmentFrequency = installmentFrequency;
        this.interestRate = interestRate;
        this.paidAmount = BigDecimal.ZERO;
    }

    public void startLoan(BigDecimal totalInstallment, BigDecimal principalComponent, BigDecimal interestComponent, Instant maturityDate) {
        this.nextInstallmentAmount = totalInstallment;
        this.nextInstallmentPrincipal = principalComponent;
        this.nextInstallmentInterest = interestComponent;
        this.maturityDate = maturityDate;
    }
    
}