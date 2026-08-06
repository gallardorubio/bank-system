package io.github.gallardorubio.banksystem.core.deposit.entity;

import io.github.gallardorubio.banksystem.core.deposit.dto.DepositRequest;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationRequestOrigin;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Setter
@SuperBuilder
@Entity
@Table(name = "deposit", schema = "core")
public class DepositEntity extends OperationEntity {

    public static DepositEntity fromDto(DepositRequest dto, UUID clientId, UUID clientBankAccountId, OperationRequestOrigin origin) {
        return DepositEntity.builder()
                .clientId(clientId)
                .clientBankAccountId(clientBankAccountId)
                .amount(dto.amount())
                .origin(origin)
                .build();
    }

    @Override
    public OperationType getOperationType() {
        return OperationType.DEPOSIT;
    }

    @Override
    public String buildDescription() {
        return "Depósito en cuenta";
    }
    
}