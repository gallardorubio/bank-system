package io.github.gallardorubio.banksystem.core.deposit.dao;

import io.github.gallardorubio.banksystem.core.deposit.entity.DepositEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DepositRepository extends JpaRepository<DepositEntity, UUID> {

    Optional<DepositEntity> findByIdAndClientId(UUID depositId, UUID clientId);

    List<DepositEntity> findAllByClientId(UUID clientId);

}
