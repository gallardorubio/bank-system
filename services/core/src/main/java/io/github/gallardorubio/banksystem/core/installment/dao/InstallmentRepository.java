package io.github.gallardorubio.banksystem.core.installment.dao;

import io.github.gallardorubio.banksystem.core.installment.entity.InstallmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InstallmentRepository extends JpaRepository<InstallmentEntity, UUID> {
}