package io.github.gallardorubio.banksystem.core.record.dao;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.github.gallardorubio.banksystem.core.record.entity.EntryEntity;

@Repository
public interface EntryRepository extends JpaRepository<EntryEntity, UUID> {
    List<EntryEntity> findTop50ByAccountIdOrderByCreatedAtDesc(UUID accountId);    
}
