package io.github.gallardorubio.banksystem.core.operation.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Setter
@SuperBuilder
@MappedSuperclass
public abstract class OperationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "client_id", nullable = false, updatable = false)
    private UUID clientId;

    @Column(name = "client_bank_account_id", nullable = false, updatable = false)
    private UUID clientBankAccountId;

    @Column(name = "target_bank_account_id", nullable = false, updatable = false)
    private UUID targetBankAccountId;

    @Column(name = "amount", nullable = false, updatable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OperationStatus status;

    @JdbcTypeCode(SqlTypes.JSON)
    private List<StatusEntry> statusHistory = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    private RequestOrigin origin;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public void approve(String reason) {
        if (this.status != OperationStatus.PENDING && this.status != OperationStatus.ESCALATED) {
            throw new IllegalStateException();
        }
        this.status = OperationStatus.APPROVED;
        this.statusHistory.add(new StatusEntry(this.status, Instant.now(), reason));
    }

    public void deny(String reason) {
        if (this.status != OperationStatus.PENDING && this.status != OperationStatus.ESCALATED) {
            throw new IllegalStateException();
        }
        this.status = OperationStatus.DENIED;
        this.statusHistory.add(new StatusEntry(this.status, Instant.now(), reason));
    }

    public void escalate(String reason) {
        if (this.status != OperationStatus.PENDING) {
            throw new IllegalStateException();
        }
        this.status = OperationStatus.ESCALATED;
        this.statusHistory.add(new StatusEntry(this.status, Instant.now(), reason));
    }

    public void complete(String reason) {
        if (this.status != OperationStatus.APPROVED) {
            throw new IllegalStateException();
        }
        this.status = OperationStatus.COMPLETED;
        this.statusHistory.add(new StatusEntry(this.status, Instant.now(), reason));
    }

    public void reject(String reason) {
        if (this.status != OperationStatus.APPROVED) {
            throw new IllegalStateException();
        }
        this.status = OperationStatus.REJECTED;
        this.statusHistory.add(new StatusEntry(this.status, Instant.now(), reason));
    }

}
