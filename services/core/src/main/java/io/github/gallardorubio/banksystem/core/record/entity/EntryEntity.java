package io.github.gallardorubio.banksystem.core.record.entity;

import java.util.UUID;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import lombok.*;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
@Entity
@Builder
@Table(name = "entry")
public class EntryEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "entry_id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "debit_bank_account_id", nullable = false, updatable = false)
    private UUID debitBankAccountId;

    @Column(name = "credit_bank_account_id", nullable = false, updatable = false)
    private UUID creditBankAccountId;

    @Column(name = "amount", nullable = false, precision = 19, scale = 4, updatable = false)
    private BigDecimal amount;

    @Column(name = "operation_id", nullable = false, updatable = false)
    private UUID operationId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    
}
