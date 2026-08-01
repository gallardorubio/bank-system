package io.github.gallardorubio.banksystem.core.operation.dao;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;

public interface OperationRepository extends JpaRepository<OperationEntity, UUID> {
    
    public Optional<OperationEntity> findById(UUID id);

}
