package io.github.gallardorubio.banksystem.core.operation.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@MappedSuperclass
public abstract class OperationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "amount", nullable = false, updatable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OperationStatus status;

    @Column(name = "status_reason")
    private String statusReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public OperationEntity(BigDecimal amount) {
        this.amount = amount;
        this.status = OperationStatus.PENDING;
    }

    public void approve() {
        if (this.status != OperationStatus.PENDING && this.status != OperationStatus.ESCALATED) {
            throw new IllegalStateException();
        }
        this.status = OperationStatus.APPROVED;
    }

    public void deny(String reason) {
        if (this.status != OperationStatus.PENDING && this.status != OperationStatus.ESCALATED) {
            throw new IllegalStateException();
        }
        this.status = OperationStatus.DENIED;
        this.statusReason = reason;
    }

    public void escalate(String reason) {
        if (this.status != OperationStatus.PENDING) {
            throw new IllegalStateException();
        }
        this.status = OperationStatus.ESCALATED;
        this.statusReason = reason;
    }

    public void complete() {
        if (this.status != OperationStatus.APPROVED) {
            throw new IllegalStateException();
        }
        this.status = OperationStatus.COMPLETED;
    }

    public void reject(String reason) {
        if (this.status != OperationStatus.APPROVED) {
            throw new IllegalStateException();
        }
        this.status = OperationStatus.REJECTED;
        this.statusReason = reason;
    }

}
