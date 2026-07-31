package io.github.gallardorubio.banksystem.core.record.dao;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import io.github.gallardorubio.banksystem.core.record.entity.AccountEntity;
import io.github.gallardorubio.banksystem.core.record.entity.BankAccountEntity;
import jakarta.persistence.LockModeType;

public interface BankAccountRepository extends JpaRepository<BankAccountEntity, UUID> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM BankAccountEntity a WHERE a.id = :id")
    Optional<BankAccountEntity> findByIdForUpdate(@Param("id") UUID id);

}
