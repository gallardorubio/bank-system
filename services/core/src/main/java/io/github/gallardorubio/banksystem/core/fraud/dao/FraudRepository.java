package io.github.gallardorubio.banksystem.core.fraud.dao;

import io.github.gallardorubio.banksystem.core.fraud.entity.FraudEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FraudRepository extends JpaRepository<FraudEntity, UUID> {
}