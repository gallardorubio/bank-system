package io.github.gallardorubio.banksystem.core.operation.dao;

import io.github.gallardorubio.banksystem.core.operation.dto.OperationEntryProjection;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface OperationRepository extends JpaRepository<OperationEntity, UUID> {

    @Query(value = """
        SELECT 
            op.id AS id,
            op.id AS operationId,
            op.op_type AS operationType,
            op.description AS description,
            op.amount AS amount,
            op.direction AS operationDirection,
            op.created_at AS createdAt
        FROM (
            SELECT 
                t.id AS id, 
                t.client_id AS client_id,
                t.client_bank_account_id AS client_bank_account_id,
                'TRANSFER' AS op_type, 
                COALESCE(t.concept, 'Transferencia sin concepto') AS description, 
                t.amount AS amount, 
                'DEBIT' AS direction, 
                t.created_at AS created_at,
                t.concept AS concept,
                t.target_bank_account_id AS target_bank_account_id,
                b_target.client_name AS target_client_name
            FROM core.transfer t
            LEFT JOIN core.account b_target ON t.target_bank_account_id = b_target.account_id
            
            UNION ALL
            
            SELECT 
                d.id AS id, 
                d.client_id AS client_id,
                d.client_bank_account_id AS client_bank_account_id,
                'DEPOSIT' AS op_type, 
                'Depósito en cuenta' AS description, 
                d.amount AS amount, 
                'CREDIT' AS direction, 
                d.created_at AS created_at,
                NULL AS concept,
                NULL AS target_bank_account_id,
                NULL AS target_client_name
            FROM core.deposit d
            
            UNION ALL
            
            SELECT 
                l.id AS id, 
                l.client_id AS client_id,
                l.client_bank_account_id AS client_bank_account_id,
                'LOAN' AS op_type, 
                'Préstamo en cuenta' AS description, 
                l.amount AS amount, 
                'CREDIT' AS direction, 
                l.created_at AS created_at,
                NULL AS concept,
                NULL AS target_bank_account_id,
                NULL AS target_client_name
            FROM core.loan l
            
            UNION ALL
            
            SELECT 
                i.id AS id, 
                i.client_id AS client_id,
                i.client_bank_account_id AS client_bank_account_id,
                'INSTALLMENT' AS op_type, 
                'Pago de cuota de préstamo' AS description, 
                i.amount AS amount, 
                'DEBIT' AS direction, 
                i.created_at AS created_at,
                NULL AS concept,
                NULL AS target_bank_account_id,
                NULL AS target_client_name
            FROM core.installment i
        ) op
        WHERE op.client_id = :clientId
          AND (CAST(:amount AS numeric) IS NULL OR op.amount = :amount)
          AND (CAST(:createdAt AS timestamp) IS NULL OR op.created_at >= CAST(:createdAt AS timestamp))
          AND (CAST(:concept AS text) IS NULL OR (op.concept IS NOT NULL AND LOWER(op.concept) LIKE LOWER(CONCAT('%', :concept, '%'))))
          AND (CAST(:targetBankAccountId AS uuid) IS NULL OR op.target_bank_account_id = :targetBankAccountId)
          AND (CAST(:targetClientName AS text) IS NULL OR (op.target_client_name IS NOT NULL AND LOWER(op.target_client_name) LIKE LOWER(CONCAT('%', :targetClientName, '%'))))
        ORDER BY op.created_at DESC
        """,
        countQuery = """
        SELECT count(op.id) FROM (
            SELECT t.id AS id, t.client_id AS client_id, t.amount AS amount, t.created_at AS created_at, t.concept AS concept, t.target_bank_account_id AS target_bank_account_id, b_target.client_name AS target_client_name FROM core.transfer t LEFT JOIN core.account b_target ON t.target_bank_account_id = b_target.account_id
            UNION ALL
            SELECT d.id AS id, d.client_id AS client_id, d.amount AS amount, d.created_at AS created_at, NULL AS concept, NULL AS target_bank_account_id, NULL AS target_client_name FROM core.deposit d
            UNION ALL
            SELECT l.id AS id, l.client_id AS client_id, l.amount AS amount, l.created_at AS created_at, NULL AS concept, NULL AS target_bank_account_id, NULL AS target_client_name FROM core.loan l
            UNION ALL
            SELECT i.id AS id, i.client_id AS client_id, i.amount AS amount, i.created_at AS created_at, NULL AS concept, NULL AS target_bank_account_id, NULL AS target_client_name FROM core.installment i
        ) op
        WHERE op.client_id = :clientId
          AND (CAST(:amount AS numeric) IS NULL OR op.amount = :amount)
          AND (CAST(:createdAt AS timestamp) IS NULL OR op.created_at >= CAST(:createdAt AS timestamp))
          AND (CAST(:concept AS text) IS NULL OR (op.concept IS NOT NULL AND LOWER(op.concept) LIKE LOWER(CONCAT('%', :concept, '%'))))
          AND (CAST(:targetBankAccountId AS uuid) IS NULL OR op.target_bank_account_id = :targetBankAccountId)
          AND (CAST(:targetClientName AS text) IS NULL OR (op.target_client_name IS NOT NULL AND LOWER(op.target_client_name) LIKE LOWER(CONCAT('%', :targetClientName, '%'))))
        """,
        nativeQuery = true)
    Page<OperationEntryProjection> findFilteredOperations(
        @Param("clientId") UUID clientId,
        @Param("concept") String concept,
        @Param("targetClientName") String targetClientName,
        @Param("createdAt") Instant createdAt,
        @Param("targetBankAccountId") UUID targetBankAccountId,
        @Param("amount") BigDecimal amount,
        Pageable pageable
    );
}