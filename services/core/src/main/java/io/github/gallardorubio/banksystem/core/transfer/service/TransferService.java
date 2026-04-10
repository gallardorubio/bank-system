package io.github.gallardorubio.banksystem.core.transfer.service;

import io.github.gallardorubio.banksystem.core.operation.dto.OperationPending;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import io.github.gallardorubio.banksystem.core.operation.producer.OperationProducer;
import io.github.gallardorubio.banksystem.core.record.service.RecordService;
import io.github.gallardorubio.banksystem.core.transfer.dao.TransferRepository;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferRequest;
import io.github.gallardorubio.banksystem.core.transfer.entity.TransferEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final TransferRepository transferRepository;
    private final RecordService recordService;
    private final OperationProducer operationProducer;

    @Transactional
    public UUID initiatePendingTransfer(TransferRequest transferRequest) {
        TransferEntity transferEntity = new TransferEntity(
            transferRequest.debitAccountId(),
            transferRequest.creditAccountId(),
            transferRequest.amount()
        );

        transferRepository.save(transferEntity);

        OperationPending operationPending = new OperationPending(
            transferEntity.getId(),
            transferEntity.getDebitAccountId(),
            transferEntity.getCreditAccountId(),
            transferEntity.getAmount(),
            OperationType.TRANSFER
        );

        operationProducer.sendOperationPending(operationPending);

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
}