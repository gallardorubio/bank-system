package io.github.gallardorubio.banksystem.core.deposit.entity;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Entity
@Table(name = "deposit", schema = "core")
public class DepositEntity extends OperationEntity {

    @Column(name = "target_account_id", nullable = false, updatable = false)
    private UUID targetAccountId;

    public DepositEntity(UUID targetAccountId, BigDecimal amount) {
        super(amount);
        this.targetAccountId = targetAccountId;
    }
}