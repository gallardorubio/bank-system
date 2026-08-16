package io.github.gallardorubio.banksystem.core.installment.dao;

import io.github.gallardorubio.banksystem.core.installment.entity.InstallmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InstallmentRepository extends JpaRepository<InstallmentEntity, UUID> {

    Optional<InstallmentEntity> findByIdAndClientId(UUID id, UUID clientId);
    
    List<InstallmentEntity> findAllByClientId(UUID clientId);

}