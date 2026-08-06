package io.github.gallardorubio.banksystem.core.transfer.service;

import io.github.gallardorubio.banksystem.core.client.service.ClientService;
import io.github.gallardorubio.banksystem.core.config.BusinessException;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationPendingEvent;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationRequestOrigin;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import io.github.gallardorubio.banksystem.core.record.service.BankAccountService;
import io.github.gallardorubio.banksystem.core.record.service.EntryService;
import io.github.gallardorubio.banksystem.core.transfer.dao.TransferRepository;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferDetails;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferRequest;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferResponse;
import io.github.gallardorubio.banksystem.core.transfer.entity.TransferEntity;
import lombok.RequiredArgsConstructor;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final TransferRepository transferRepository;
    private final EntryService recordService;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final ClientService clientService;
    private final BankAccountService bankAccountService;

    @Transactional(readOnly = true)
    public TransferResponse getTransfer(UUID transferId, UUID clientId) {
        return transferRepository.findByIdAndClientId(transferId, clientId)
            .map(TransferResponse::new)
            .orElseThrow(() -> new BusinessException("Transferencia no encontrada: " + transferId));
    }

    @Transactional(readOnly = true)
    public List<TransferResponse> getAllTransfers(UUID clientId) {
        return transferRepository.findAllByClientId(clientId).stream()
            .map(TransferResponse::new)
            .toList();
    }

    @Transactional
    public TransferResponse initiatePendingTransfer(TransferRequest transferRequest, UUID clientId, OperationRequestOrigin origin) {
        UUID clientBankAccountId = bankAccountService.getAccountIdByClientId(clientId);

        if (clientBankAccountId.equals(transferRequest.targetBankAccountId())) {
            throw new BusinessException("No puedes realizar una transferencia a tu propia cuenta bancaria");
        }

        BigDecimal currentBalance = bankAccountService.getBankAccountBalance(clientId);

        if (currentBalance.compareTo(transferRequest.amount()) < 0) {
            throw new BusinessException("Saldo insuficiente para realizar la transferencia");
        }

        TransferEntity transferEntity = TransferEntity.fromDto(transferRequest, clientId, clientBankAccountId, origin);

        if (transferRequest.shouldSaveAsTrusted()) {
            clientService.addTrustedAccount(clientId, transferRequest.targetBankAccountId());
        }

        transferEntity = transferRepository.saveAndFlush(transferEntity);
        
        transferEntity.pending("Transferencia pendiente de aprobación");

        TransferDetails transferDetails = new TransferDetails(transferEntity);

        OperationPendingEvent<TransferDetails> operationPending = new OperationPendingEvent<>(
            transferEntity.getId(),
            OperationType.TRANSFER,
            transferDetails
        );

        applicationEventPublisher.publishEvent(operationPending);

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