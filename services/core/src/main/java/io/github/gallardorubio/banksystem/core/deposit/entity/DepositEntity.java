package io.github.gallardorubio.banksystem.core.deposit.entity;

import io.github.gallardorubio.banksystem.core.deposit.dto.DepositRequest;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import io.github.gallardorubio.banksystem.core.operation.entity.RequestOrigin;
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

    public static DepositEntity fromDto(DepositRequest dto, UUID clientId, RequestOrigin origin) {
        return DepositEntity.builder()
                .clientId(clientId)
                .clientBankAccountId(dto.clientBankAccountId())
                .amount(dto.amount())
                .origin(origin)
                .build();
    }
}