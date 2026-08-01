package io.github.gallardorubio.banksystem.core.record.dao;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import io.github.gallardorubio.banksystem.core.record.entity.BankAccountEntity;
import jakarta.persistence.LockModeType;

public interface BankAccountRepository extends JpaRepository<BankAccountEntity, UUID> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM BankAccountEntity a WHERE a.id = :id")
    Optional<BankAccountEntity> findByIdForUpdate(@Param("id") UUID id);

    @Modifying
    @Query(value = "INSERT INTO account (account_id, client_id, currency, balance) " +
                   "VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'EUR', 0.0000) " +
                   "ON CONFLICT DO NOTHING", nativeQuery = true)
    void ensureVaultAccountExists();

}
