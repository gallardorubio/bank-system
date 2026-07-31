package io.github.gallardorubio.banksystem.core.deposit.entity;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Setter
@SuperBuilder
@Entity
@Table(name = "deposit", schema = "core")
public class DepositEntity extends OperationEntity {

}