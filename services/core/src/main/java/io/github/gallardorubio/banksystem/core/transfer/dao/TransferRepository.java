package io.github.gallardorubio.banksystem.core.transfer.dao;

import io.github.gallardorubio.banksystem.core.transfer.entity.TransferEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TransferRepository extends JpaRepository<TransferEntity, UUID> {
    
    java.util.Optional<TransferEntity> findByIdAndClientId(UUID transferId, UUID clientId);

    java.util.List<TransferEntity> findAllByClientId(UUID clientId);

}
