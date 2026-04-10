package io.github.gallardorubio.banksystem.core.transfer.dao;

import io.github.gallardorubio.banksystem.core.transfer.entity.TransferEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TransferRepository extends JpaRepository<TransferEntity, UUID> {
    
}
