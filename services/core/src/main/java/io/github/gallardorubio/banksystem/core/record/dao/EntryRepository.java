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
    
    @Query("""
        SELECT e FROM EntryEntity e
        LEFT JOIN TransferEntity t ON e.operationId = t.id
        LEFT JOIN BankAccountEntity bDebit ON e.debitBankAccountId = bDebit.id
        LEFT JOIN BankAccountEntity bCredit ON e.creditBankAccountId = bCredit.id
        WHERE (e.debitBankAccountId = :bankAccountId OR e.creditBankAccountId = :bankAccountId)
          AND (:amount IS NULL OR e.amount = :amount)
          AND (:createdAt IS NULL OR e.createdAt >= :createdAt)
          AND (:concept IS NULL OR (t.id IS NOT NULL AND LOWER(t.concept) LIKE LOWER(CONCAT('%', :concept, '%'))))
          AND (:targetBankAccountId IS NULL OR (t.id IS NOT NULL AND (
               (e.debitBankAccountId = :bankAccountId AND e.creditBankAccountId = :targetBankAccountId) OR
               (e.creditBankAccountId = :bankAccountId AND e.debitBankAccountId = :targetBankAccountId)
          )))
          AND (:targetClientName IS NULL OR (t.id IS NOT NULL AND (
               (e.debitBankAccountId = :bankAccountId AND LOWER(bCredit.clientName) LIKE LOWER(CONCAT('%', :targetClientName, '%'))) OR
               (e.creditBankAccountId = :bankAccountId AND LOWER(bDebit.clientName) LIKE LOWER(CONCAT('%', :targetClientName, '%')))
          )))
        ORDER BY e.createdAt DESC
    """)
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
      AND (:startDate IS NULL OR e.createdAt >= :startDate)
      AND (:endDate IS NULL OR e.createdAt <= :endDate)
    ORDER BY e.createdAt DESC
    """)
    List<EntryEntity> findEntriesForStatement(
        @Param("bankAccountId") UUID bankAccountId,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );
    
}
