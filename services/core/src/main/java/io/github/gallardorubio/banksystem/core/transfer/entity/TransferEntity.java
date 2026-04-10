package io.github.gallardorubio.banksystem.core.transfer.entity;

import java.math.BigDecimal;
import java.util.UUID;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Entity
@Table(name = "transfer", schema = "core")
public class TransferEntity extends OperationEntity {

    @Column(name = "debit_account_id", nullable = false, updatable = false)
    private UUID debitAccountId;

    @Column(name = "credit_account_id", nullable = false, updatable = false)
    private UUID creditAccountId;

    public TransferEntity(UUID debitAccountId, UUID creditAccountId, BigDecimal amount) {
        super(amount);
        this.debitAccountId = debitAccountId;
        this.creditAccountId = creditAccountId;
    }

}
