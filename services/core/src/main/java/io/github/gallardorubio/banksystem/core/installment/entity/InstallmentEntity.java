package io.github.gallardorubio.banksystem.core.installment.entity;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Entity
@Table(name = "installment", schema = "core")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InstallmentEntity extends OperationEntity {

    @Column(name = "loan_id", nullable = false, updatable = false)
    private UUID loanId;

    @Column(name = "principal_amount", nullable = false, updatable = false, precision = 19, scale = 4)
    private BigDecimal principalAmount;

    @Column(name = "interest_amount", nullable = false, updatable = false, precision = 19, scale = 4)
    private BigDecimal interestAmount;

    public InstallmentEntity(UUID loanId, BigDecimal totalAmount, BigDecimal principalAmount, BigDecimal interestAmount) {
        super(totalAmount);
        this.loanId = loanId;
        this.principalAmount = principalAmount;
        this.interestAmount = interestAmount;
    }
}