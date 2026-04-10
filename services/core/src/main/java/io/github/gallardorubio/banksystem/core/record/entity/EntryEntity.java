package io.github.gallardorubio.banksystem.core.record.entity;

import java.util.UUID;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import lombok.*;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Entity
@Table(name = "entry")
public class EntryEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "entry_id", nullable = false, updatable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false, updatable = false)
    private AccountEntity account;

    @NotNull
    @Column(name = "amount", nullable = false, precision = 19, scale = 4, updatable = false)
    private BigDecimal amount;

    @NotNull
    @Enumerated(EnumType.STRING) 
    @Column(name = "side", nullable = false, updatable = false)
    private Side side;

    @NotNull
    @Column(name = "operation_id", nullable = false, updatable = false)
    private UUID operationId;

    @NonNull
    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, updatable = false)
    private OperationType operationType;
    
    @NotNull
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public EntryEntity(AccountEntity account, BigDecimal amount, Side side, UUID operationId, OperationType operationType) {
        this.account = account;
        this.amount = amount;
        this.side = side;
        this.operationId = operationId;
        this.operationType = operationType;
        this.createdAt = Instant.now();
    }
    
}
