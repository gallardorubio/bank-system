package io.github.gallardorubio.banksystem.core.transfer.entity;

import java.util.UUID;

import io.github.gallardorubio.banksystem.core.operation.dto.OperationRequestOrigin;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferRequest;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Entity
@SuperBuilder
@Table(name = "transfer", schema = "core")
public class TransferEntity extends OperationEntity {

    @Column(name = "target_bank_account_id", nullable = false, updatable = false)
    private UUID targetBankAccountId;

    @Column(name = "concept", nullable = false, updatable = false)
    private String concept;

    public static TransferEntity fromDto(TransferRequest dto, UUID clientId, OperationRequestOrigin origin) {
        return TransferEntity.builder()
                .clientId(clientId)
                .clientBankAccountId(dto.clientBankAccountId())
                .amount(dto.amount())
                .origin(origin)
                .targetBankAccountId(dto.targetBankAccountId())
                .concept(dto.concept())
                .build();
    }

    @Override
    public OperationType getOperationType() {
        return OperationType.TRANSFER;
    }

    @Override
    public String buildDescription() {
        return (concept != null ? concept : "Transferencia sin concepto");
    }

}
