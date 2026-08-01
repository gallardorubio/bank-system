package io.github.gallardorubio.banksystem.core.record.dao;

import io.github.gallardorubio.banksystem.core.record.entity.EntryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface EntryRepository extends JpaRepository<EntryEntity, UUID> {
    
    @Query("""
        SELECT e FROM EntryEntity e 
        WHERE e.debitBankAccountId = :bankAccountId OR e.creditBankAccountId = :bankAccountId 
        ORDER BY e.createdAt DESC
    """)
    Page<EntryEntity> findAllByBankAccountIdOrderByCreatedAtDesc(@Param("bankAccountId") UUID bankAccountId, Pageable pageable);
    
}