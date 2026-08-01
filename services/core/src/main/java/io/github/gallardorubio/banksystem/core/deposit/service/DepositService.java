package io.github.gallardorubio.banksystem.core.deposit.service;

import io.github.gallardorubio.banksystem.core.deposit.dao.DepositRepository;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositDetails;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositRequest;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositResponse;
import io.github.gallardorubio.banksystem.core.deposit.entity.DepositEntity;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationPending;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationRequestOrigin;
import io.github.gallardorubio.banksystem.core.record.entity.BankAccountEntity;
import io.github.gallardorubio.banksystem.core.record.service.EntryService;
import lombok.RequiredArgsConstructor;

import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepositService {

    private final DepositRepository depositRepository;
    private final EntryService recordService;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Transactional(readOnly = true)
    public DepositResponse getDeposit(UUID depositId, UUID clientId) {
        return depositRepository.findByIdAndClientId(depositId, clientId)
            .map(deposit -> new DepositResponse(deposit))
            .orElseThrow(() -> new ResourceNotFoundException("Deposit not found: " + depositId));
    }

    @Transactional(readOnly = true)
    public List<DepositResponse> getAllDeposits(UUID clientId) {
        return depositRepository.findAllByClientId(clientId).stream()
            .map(deposit -> new DepositResponse(deposit))
            .toList();
    }

    @Transactional
    public DepositResponse initiatePendingDeposit(DepositRequest depositRequest, UUID clientId, OperationRequestOrigin origin) {
        DepositEntity depositEntity = DepositEntity.fromDto(depositRequest, clientId, origin);
        
        depositEntity.pending("Depósito pendiente de aprobación");

        DepositDetails depositDetails = new DepositDetails(depositEntity);

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

        return new DepositResponse(depositEntity);
    }

    @Transactional
    public void processApprovedDeposit(UUID depositId, String reason) {
        DepositEntity depositEntity = depositRepository.findById(depositId)
            .orElseThrow(() -> new IllegalArgumentException("Deposit not found: " + depositId));

        depositEntity.approve(reason);

        try {
            recordService.processEntry(
                depositEntity.getId(),
                BankAccountEntity.VAULT_ACCOUNT_ID,
                depositEntity.getClientBankAccountId(),
                depositEntity.getAmount()
            );

            depositEntity.complete("Apunte contable de depósito completado");
        } catch (Exception e) {
            depositEntity.reject("Error en apunte contable de depósito: " + e.getMessage());
        }
    }

    @Transactional
    public void processDeniedDeposit(UUID depositId, String reason) {
        DepositEntity depositEntity = depositRepository.findById(depositId)
            .orElseThrow(() -> new IllegalArgumentException("Deposit not found: " + depositId));

        depositEntity.deny(reason);
    }

    @Transactional
    public void processEscalatedDeposit(UUID depositId, String reason) {
        DepositEntity depositEntity = depositRepository.findById(depositId)
            .orElseThrow(() -> new IllegalArgumentException("Deposit not found: " + depositId));

        depositEntity.escalate(reason);
    }

    @Transactional
    public DepositResponse resolveDeposit(UUID depositId, String action, String reason) {
        switch (action.toUpperCase()) {
            case "APPROVE" -> processApprovedDeposit(depositId, reason);
            case "DENY" -> processDeniedDeposit(depositId, reason);
            default -> throw new IllegalArgumentException("Action not supported: " + action);
        }

        DepositEntity deposit = depositRepository.findById(depositId)
            .orElseThrow(() -> new ResourceNotFoundException("Deposit not found: " + depositId));

        return new DepositResponse(deposit);
    }

}
