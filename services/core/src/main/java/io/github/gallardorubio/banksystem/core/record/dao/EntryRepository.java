package io.github.gallardorubio.banksystem.core.record.dao;

import io.github.gallardorubio.banksystem.core.record.entity.EntryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface EntryRepository extends JpaRepository<EntryEntity, UUID> {    
    @Query(value = """
        SELECT e.* FROM core.entry e
        LEFT JOIN core.transfer t ON e.operation_id = t.id
        LEFT JOIN core.account b_debit ON e.debit_bank_account_id = b_debit.account_id
        LEFT JOIN core.account b_credit ON e.credit_bank_account_id = b_credit.account_id
        WHERE (e.debit_bank_account_id = :bankAccountId OR e.credit_bank_account_id = :bankAccountId)
          AND (CAST(:amount AS numeric) IS NULL OR ROUND(e.amount, 2) = CAST(:amount AS numeric))
          AND (CAST(:createdAt AS timestamp) IS NULL OR e.created_at >= CAST(:createdAt AS timestamp))
          AND (CAST(:concept AS text) IS NULL OR (t.id IS NOT NULL AND LOWER(t.concept) LIKE LOWER(CONCAT('%', CAST(:concept AS text), '%'))))
          AND (:targetBankAccountId IS NULL OR (t.id IS NOT NULL AND (
               (e.debit_bank_account_id = :bankAccountId AND e.credit_bank_account_id = :targetBankAccountId) OR
               (e.credit_bank_account_id = :bankAccountId AND e.debit_bank_account_id = :targetBankAccountId)
          )))
          AND (CAST(:targetClientName AS text) IS NULL OR (t.id IS NOT NULL AND (
               (e.debit_bank_account_id = :bankAccountId AND LOWER(b_credit.client_name) LIKE LOWER(CONCAT('%', CAST(:targetClientName AS text), '%'))) OR
               (e.credit_bank_account_id = :bankAccountId AND LOWER(b_debit.client_name) LIKE LOWER(CONCAT('%', CAST(:targetClientName AS text), '%')))
          )))
        ORDER BY e.created_at DESC
        """,
        countQuery = """
        SELECT count(e.entry_id) FROM core.entry e
        LEFT JOIN core.transfer t ON e.operation_id = t.id
        LEFT JOIN core.account b_debit ON e.debit_bank_account_id = b_debit.account_id
        LEFT JOIN core.account b_credit ON e.credit_bank_account_id = b_credit.account_id
        WHERE (e.debit_bank_account_id = :bankAccountId OR e.credit_bank_account_id = :bankAccountId)
          AND (CAST(:amount AS numeric) IS NULL OR ROUND(e.amount, 2) = CAST(:amount AS numeric))
          AND (CAST(:createdAt AS timestamp) IS NULL OR e.created_at >= CAST(:createdAt AS timestamp))
          AND (CAST(:concept AS text) IS NULL OR (t.id IS NOT NULL AND LOWER(t.concept) LIKE LOWER(CONCAT('%', CAST(:concept AS text), '%'))))
          AND (:targetBankAccountId IS NULL OR (t.id IS NOT NULL AND (
               (e.debit_bank_account_id = :bankAccountId AND e.credit_bank_account_id = :targetBankAccountId) OR
               (e.credit_bank_account_id = :bankAccountId AND e.debit_bank_account_id = :targetBankAccountId)
          )))
          AND (CAST(:targetClientName AS text) IS NULL OR (t.id IS NOT NULL AND (
               (e.debit_bank_account_id = :bankAccountId AND LOWER(b_credit.client_name) LIKE LOWER(CONCAT('%', CAST(:targetClientName AS text), '%'))) OR
               (e.credit_bank_account_id = :bankAccountId AND LOWER(b_debit.client_name) LIKE LOWER(CONCAT('%', CAST(:targetClientName AS text), '%')))
          )))
        """,
        nativeQuery = true)
    Page<EntryEntity> findFilteredEntries(
        @Param("bankAccountId") UUID bankAccountId,
        @Param("concept") String concept,
        @Param("targetClientName") String targetClientName,
        @Param("createdAt") Instant createdAt,
        @Param("targetBankAccountId") UUID targetBankAccountId,
        @Param("amount") BigDecimal amount,
        Pageable pageable
    );

    @Query("""
    SELECT e FROM EntryEntity e
    WHERE (e.debitBankAccountId = :bankAccountId OR e.creditBankAccountId = :bankAccountId)
      AND (CAST(:startDate AS timestamp) IS NULL OR e.createdAt >= :startDate)
      AND (CAST(:endDate AS timestamp) IS NULL OR e.createdAt <= :endDate)
    ORDER BY e.createdAt DESC
    """)
    List<EntryEntity> findEntriesForStatement(
        @Param("bankAccountId") UUID bankAccountId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    List<EntryEntity> findAllByDebitBankAccountIdOrCreditBankAccountIdOrderByCreatedAtDesc(UUID debitBankAccountId, UUID creditBankAccountId);
    
}
