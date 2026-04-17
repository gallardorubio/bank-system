package io.github.gallardorubio.banksystem.core.transfer.service;

import io.github.gallardorubio.banksystem.core.operation.dto.OperationPending;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import io.github.gallardorubio.banksystem.core.record.service.RecordService;
import io.github.gallardorubio.banksystem.core.transfer.dao.TransferRepository;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferDetails;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferRequest;
import io.github.gallardorubio.banksystem.core.transfer.entity.TransferEntity;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final TransferRepository transferRepository;
    private final RecordService recordService;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Transactional
    public UUID initiatePendingTransfer(TransferRequest transferRequest) {
        recordService.checkAccountExists(transferRequest.debitAccountId());
        recordService.checkAccountExists(transferRequest.creditAccountId());

        TransferEntity transferEntity = new TransferEntity(
            transferRequest.debitAccountId(),
            transferRequest.creditAccountId(),
            transferRequest.amount()
        );

        transferRepository.save(transferEntity);

        TransferDetails transferDetails = new TransferDetails(
            transferEntity.getDebitAccountId(),
            transferEntity.getCreditAccountId()
        );

        OperationPending<TransferDetails> operationPending = new OperationPending<>(
            transferEntity.getId(),
            transferEntity.getAmount(),
            OperationType.TRANSFER,
            transferDetails
        );

        applicationEventPublisher.publishEvent(operationPending);

        return transferEntity.getId();
    }

    @Transactional
    public void processApprovedTransfer(UUID transferId) {
        TransferEntity transferEntity = transferRepository.findById(transferId)
            .orElseThrow(IllegalArgumentException::new);

        transferEntity.approve();

        try {
            recordService.processDoubleEntry(
                transferEntity.getId(),
                transferEntity.getDebitAccountId(),
                transferEntity.getCreditAccountId(),
                transferEntity.getAmount(),
                OperationType.TRANSFER
            );
            
            transferEntity.complete();
            
        } catch (Exception e) {
            transferEntity.reject("");
        }

        transferRepository.save(transferEntity);
    }

    @Transactional
    public void processDeniedTransfer(UUID id, String reason) {
        TransferEntity transferEntity = transferRepository.findById(id)
            .orElseThrow(IllegalArgumentException::new);
        
        transferEntity.deny(reason);
        transferRepository.save(transferEntity);
    }

    @Transactional
    public void processEscalatedTransfer(UUID id, String reason) {
        TransferEntity transferEntity = transferRepository.findById(id)
            .orElseThrow(IllegalArgumentException::new);
        
        transferEntity.escalate(reason);
        transferRepository.save(transferEntity);
    }
}