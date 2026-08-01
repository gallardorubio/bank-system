package io.github.gallardorubio.banksystem.core.installment.entity;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Getter
@Entity
@Table(name = "installment", schema = "core")
@SuperBuilder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InstallmentEntity extends OperationEntity {

    @Column(name = "loan_id", nullable = false, updatable = false)
    private UUID loanId;

}
