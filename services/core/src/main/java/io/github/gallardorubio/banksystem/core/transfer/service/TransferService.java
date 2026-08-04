package io.github.gallardorubio.banksystem.core.transfer.service;

import io.github.gallardorubio.banksystem.core.client.service.ClientService;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationPendingEvent;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationRequestOrigin;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import io.github.gallardorubio.banksystem.core.record.service.EntryService;
import io.github.gallardorubio.banksystem.core.transfer.dao.TransferRepository;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferDetails;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferRequest;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferResponse;
import io.github.gallardorubio.banksystem.core.transfer.entity.TransferEntity;
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
public class TransferService {

    private final TransferRepository transferRepository;
    private final EntryService recordService;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final ClientService clientService;

    @Transactional(readOnly = true)
    public TransferResponse getTransfer(UUID transferId, UUID clientId) {
        return transferRepository.findByIdAndClientId(transferId, clientId)
            .map(TransferResponse::new)
            .orElseThrow(() -> new ResourceNotFoundException("Transfer not found: " + transferId));
    }

    @Transactional(readOnly = true)
    public List<TransferResponse> getAllTransfers(UUID clientId) {
        return transferRepository.findAllByClientId(clientId).stream()
            .map(TransferResponse::new)
            .toList();
    }

    @Transactional
    public TransferResponse initiatePendingTransfer(TransferRequest transferRequest, UUID clientId, OperationRequestOrigin origin) {
        TransferEntity transferEntity = TransferEntity.fromDto(transferRequest, clientId, origin);

        if (transferRequest.shouldSaveAsTrusted()) {
            clientService.addTrustedAccount(clientId, transferRequest.targetBankAccountId());
        }
        
        transferEntity.pending("Transferencia pendiente de aprobación");

        TransferDetails transferDetails = new TransferDetails(transferEntity);

        OperationPendingEvent<TransferDetails> operationPending = new OperationPendingEvent<>(
            transferEntity.getId(),
            OperationType.TRANSFER,
            transferDetails
        );

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                applicationEventPublisher.publishEvent(operationPending);
            }
        });

        return new TransferResponse(transferEntity);
    }

    @Transactional
    public void processApprovedTransfer(UUID transferId, String reason) {
        TransferEntity transferEntity = transferRepository.findById(transferId)
            .orElseThrow(() -> new IllegalArgumentException("Transfer not found: " + transferId));

        transferEntity.approve(reason);

        try {
            recordService.processEntry(
                transferEntity.getId(),
                transferEntity.getClientBankAccountId(),
                transferEntity.getTargetBankAccountId(),
                transferEntity.getAmount()
            );

            transferEntity.complete("Apunte contable de transferencia completado");
        } catch (Exception e) {
            transferEntity.reject("Error en apunte contable de transferencia: " + e.getMessage());
        }
    }

    @Transactional
    public void processDeniedTransfer(UUID transferId, String reason) {
        TransferEntity transferEntity = transferRepository.findById(transferId)
            .orElseThrow(() -> new IllegalArgumentException("Transfer not found: " + transferId));

        transferEntity.deny(reason);
    }
    
}