package io.github.gallardorubio.banksystem.core.deposit.dao;

import io.github.gallardorubio.banksystem.core.deposit.entity.DepositEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

public interface DepositRepository extends JpaRepository<DepositEntity, UUID> {

    Optional<DepositEntity> findByIdAndClientId(UUID depositId, UUID clientId);

}
