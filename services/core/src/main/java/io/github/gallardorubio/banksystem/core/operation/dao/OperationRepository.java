package io.github.gallardorubio.banksystem.core.operation.dao;

import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public interface OperationRepository extends JpaRepository<OperationEntity, UUID> {

    @Query(value = """
        SELECT op.id FROM (
            SELECT id, client_id, amount, created_at, concept FROM core.transfer
            UNION ALL
            SELECT id, client_id, amount, created_at, NULL AS concept FROM core.deposit
            UNION ALL
            SELECT id, client_id, amount, created_at, NULL AS concept FROM core.loan
            UNION ALL
            SELECT id, client_id, amount, created_at, NULL AS concept FROM core.installment
        ) op
        WHERE op.client_id = :clientId
          AND (CAST(:amount AS numeric) IS NULL OR op.amount = :amount)
          AND (CAST(:createdAt AS timestamp) IS NULL OR op.created_at >= CAST(:createdAt AS timestamp))
          AND (CAST(:concept AS text) IS NULL OR (op.concept IS NOT NULL AND LOWER(op.concept) LIKE LOWER(CONCAT('%', :concept, '%'))))
        ORDER BY op.created_at DESC
        """,
        countQuery = """
        SELECT count(op.id) FROM (
            SELECT id, client_id, amount, created_at, concept FROM core.transfer
            UNION ALL
            SELECT id, client_id, amount, created_at, NULL AS concept FROM core.deposit
            UNION ALL
            SELECT id, client_id, amount, created_at, NULL AS concept FROM core.loan
            UNION ALL
            SELECT id, client_id, amount, created_at, NULL AS concept FROM core.installment
        ) op
        WHERE op.client_id = :clientId
          AND (CAST(:amount AS numeric) IS NULL OR op.amount = :amount)
          AND (CAST(:createdAt AS timestamp) IS NULL OR op.created_at >= CAST(:createdAt AS timestamp))
          AND (CAST(:concept AS text) IS NULL OR (op.concept IS NOT NULL AND LOWER(op.concept) LIKE LOWER(CONCAT('%', :concept, '%'))))
        """,
        nativeQuery = true)
    Page<UUID> findOperationIdsFiltered(
        @Param("clientId") UUID clientId,
        @Param("concept") String concept,
        @Param("createdAt") Instant createdAt,
        @Param("amount") BigDecimal amount,
        Pageable pageable
    );
}