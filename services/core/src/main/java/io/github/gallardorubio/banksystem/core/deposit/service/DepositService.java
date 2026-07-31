package io.github.gallardorubio.banksystem.core.deposit.service;

import io.github.gallardorubio.banksystem.core.deposit.dao.DepositRepository;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositDetails;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositRequest;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositResponse;
import io.github.gallardorubio.banksystem.core.deposit.entity.DepositEntity;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationPending;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationStatus;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import io.github.gallardorubio.banksystem.core.operation.entity.RequestOrigin;
import io.github.gallardorubio.banksystem.core.operation.entity.StatusEntry;
import io.github.gallardorubio.banksystem.core.record.service.RecordService;
import lombok.RequiredArgsConstructor;

import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepositService {

    private final DepositRepository depositRepository;
    private final RecordService recordService;
    private final ApplicationEventPublisher applicationEventPublisher;
    private static final UUID VAULT_ACCOUNT_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    @Transactional(readOnly = true)
    public DepositResponse getDeposit(UUID depositId, UUID clientId) {
        return depositRepository.findByIdAndClientId(depositId, clientId)
            .map(deposit -> new DepositResponse(
                deposit.getAmount(),
                deposit.getStatus(),
                deposit.getStatusHistory(),
                deposit.getOrigin(),
                deposit.getCreatedAt()
            ))
            .orElseThrow(() -> new ResourceNotFoundException("Deposit not found with id: " + depositId));
    }

    @Transactional(readOnly = true)
    public List<DepositResponse> getAllDeposits(UUID clientId) {
        return depositRepository.findAllByClientId(clientId).stream()
            .map(deposit -> new DepositResponse(
                deposit.getAmount(),
                deposit.getStatus(),
                deposit.getStatusHistory(),
                deposit.getOrigin(),
                deposit.getCreatedAt()
            ))
            .toList();
    }

    @Transactional
    public DepositResponse initiatePendingDeposit(DepositRequest depositRequest, UUID clientId, RequestOrigin origin) {
        DepositEntity depositEntity = DepositEntity.builder()
            .clientId(clientId)
            .clientBankAccountId(depositRequest.bankAccountId())
            .amount(depositRequest.amount())
            .status(OperationStatus.PENDING)
            .statusHistory(List.of(new StatusEntry(OperationStatus.PENDING, Instant.now(), "Created")))
            .origin(origin)
            .createdAt(Instant.now())
            .build();

        depositEntity = depositRepository.save(depositEntity);

        DepositDetails depositDetails = new DepositDetails(
            depositEntity.getId(),
            depositEntity.getClientId(),
            depositEntity.getClientBankAccountId(),
            depositEntity.getTargetBankAccountId(),
            depositEntity.getAmount(),
            depositEntity.getStatus(),
            depositEntity.getStatusHistory(),
            depositEntity.getOrigin(),
            depositEntity.getCreatedAt()
        );

        OperationPending<DepositDetails> operationPending = new OperationPending<>(
            depositEntity.getId(),
            OperationType.DEPOSIT,
            depositDetails
        );

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                applicationEventPublisher.publishEvent(operationPending);
            }
        });

        return new DepositResponse(
            depositEntity.getAmount(),
            depositEntity.getStatus(),
            depositEntity.getStatusHistory(),
            depositEntity.getOrigin(),
            depositEntity.getCreatedAt()
        );
    }

    @Transactional
    public void processApprovedDeposit(UUID depositId, String reason) {
        DepositEntity depositEntity = depositRepository.findById(depositId)
            .orElseThrow(() -> new IllegalArgumentException("Depósito no encontrado: " + depositId));

        depositEntity.approve(reason);

        recordService.processEntry(
            depositEntity.getId(),
            VAULT_ACCOUNT_ID,
            depositEntity.getClientBankAccountId(),
            depositEntity.getAmount()
        );

        depositEntity.complete("Bookkeeping completed");
    }

    @Transactional
    public void processDeniedDeposit(UUID depositId, String reason) {
        DepositEntity depositEntity = depositRepository.findById(depositId)
            .orElseThrow(() -> new IllegalArgumentException("Depósito no encontrado: " + depositId));

        depositEntity.deny(reason);
    }

    @Transactional
    public void processEscalatedDeposit(UUID depositId, String reason) {
        DepositEntity depositEntity = depositRepository.findById(depositId)
            .orElseThrow(() -> new IllegalArgumentException("Depósito no encontrado: " + depositId));

        depositEntity.escalate(reason);
    }

    @Transactional
    public DepositResponse resolveDeposit(UUID depositId, String action, String reason) {
        switch (action.toUpperCase()) {
            case "APPROVE" -> processApprovedDeposit(depositId, reason);
            case "DENY" -> processDeniedDeposit(depositId, reason);
            case "ESCALATE" -> processEscalatedDeposit(depositId, reason);
            default -> throw new IllegalArgumentException("Acción no soportada: " + action);
        }

        DepositEntity deposit = depositRepository.findById(depositId)
            .orElseThrow(() -> new ResourceNotFoundException("Depósito no encontrado: " + depositId));

        return new DepositResponse(
            deposit.getAmount(),
            deposit.getStatus(),
            deposit.getStatusHistory(),
            deposit.getOrigin(),
            deposit.getCreatedAt()
        );
    }

}
