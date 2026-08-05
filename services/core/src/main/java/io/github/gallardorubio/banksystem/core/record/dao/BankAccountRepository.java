package io.github.gallardorubio.banksystem.core.record.dao;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import io.github.gallardorubio.banksystem.core.client.dto.TrustedBankAccountResponse;
import io.github.gallardorubio.banksystem.core.record.dto.BankAccountAnalyticsResponse;
import io.github.gallardorubio.banksystem.core.record.entity.BankAccountEntity;
import jakarta.persistence.LockModeType;

public interface BankAccountRepository extends JpaRepository<BankAccountEntity, UUID> {
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM BankAccountEntity a WHERE a.id = :id")
    Optional<BankAccountEntity> findByIdForUpdate(@Param("id") UUID id);

    @Modifying
    @Query(value = "INSERT INTO account (account_id, client_id, client_name, currency, balance) " +
                   "VALUES ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'Vault', 'EUR', 0.0000) " +
                   "ON CONFLICT DO NOTHING", nativeQuery = true)
    void ensureVaultAccountExists();

    Optional<BankAccountEntity> findByClientId(UUID clientId);

    @Query("SELECT a.balance FROM BankAccountEntity a WHERE a.clientId = :clientId")
    Optional<BigDecimal> findBankAccountBalanceByClientId(@Param("clientId") UUID clientId);

    @Query("""
        SELECT new io.github.gallardorubio.banksystem.core.record.dto.BankAccountAnalyticsResponse(
            COUNT(CASE WHEN a.clientId <> :vaultId THEN 1 END),
            COALESCE(SUM(CASE WHEN a.clientId = :vaultId THEN a.balance ELSE 0 END), 0),
            COALESCE(SUM(CASE WHEN a.clientId <> :vaultId THEN a.balance ELSE 0 END), 0),
            COALESCE(AVG(CASE WHEN a.clientId <> :vaultId THEN a.balance END), 0.0)
        )
        FROM BankAccountEntity a
        """)
    BankAccountAnalyticsResponse getBankAnalytics(@Param("vaultId") UUID vaultId);

    @Query("""
    SELECT new io.github.gallardorubio.banksystem.core.client.dto.TrustedBankAccountResponse(
        b.id,
        b.clientName
    )
    FROM BankAccountEntity b
    WHERE b.id IN :accountIds
    """)
    List<TrustedBankAccountResponse> findClientNamesByAccountIds(@Param("accountIds") List<UUID> accountIds);

}
