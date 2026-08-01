package io.github.gallardorubio.banksystem.core.loan.service;

import io.github.gallardorubio.banksystem.core.loan.dao.LoanRepository;
import io.github.gallardorubio.banksystem.core.loan.dto.LoanDetails;
import io.github.gallardorubio.banksystem.core.loan.dto.LoanRequest;
import io.github.gallardorubio.banksystem.core.loan.dto.LoanResponse;
import io.github.gallardorubio.banksystem.core.loan.entity.LoanEntity;
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

import java.util.List;
import java.util.UUID;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final EntryService recordService;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Transactional(readOnly = true)
    public LoanResponse getLoan(UUID loanId, UUID clientId) {
        return loanRepository.findByIdAndClientId(loanId, clientId)
            .map(loan -> new LoanResponse(loan))
            .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));
    }

    @Transactional(readOnly = true)
    public List<LoanResponse> getAllLoans(UUID clientId) {
        return loanRepository.findAllByClientId(clientId).stream()
            .map(loan -> new LoanResponse(loan))
            .toList();
    }

    @Transactional
    public LoanResponse initiatePendingLoan(LoanRequest loanRequest, UUID clientId, OperationRequestOrigin origin) {
        LoanEntity loanEntity = LoanEntity.fromDto(loanRequest, clientId, origin);

        loanEntity.pending("Préstamo pendiente de aprobación");

        LoanDetails loanDetails = new LoanDetails(loanEntity);

        OperationPending<LoanDetails> operationPending = new OperationPending<>(
            loanEntity.getId(),
            OperationType.LOAN,
            loanDetails
        );

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                applicationEventPublisher.publishEvent(operationPending);
            }
        });

        return new LoanResponse(loanEntity);
    }

    @Transactional
    public void processApprovedLoan(UUID loanId, String reason) {
        LoanEntity loanEntity = loanRepository.findById(loanId)
            .orElseThrow(() -> new IllegalArgumentException("Loan not found: " + loanId));

        loanEntity.approve(reason);

        try {
            recordService.processEntry(
                loanEntity.getId(),
                BankAccountEntity.VAULT_ACCOUNT_ID,
                loanEntity.getClientBankAccountId(),
                loanEntity.getAmount()
            );

            loanEntity.registerFirstInstallment();

            loanEntity.complete("Apunte contable de préstamo completado");
        } catch (Exception e) {
            loanEntity.reject("Error en apunte contable de préstamo: " + e.getMessage());
        }
    }

    @Transactional
    public void processDeniedLoan(UUID loanId, String reason) {
        LoanEntity loanEntity = loanRepository.findById(loanId)
            .orElseThrow(() -> new IllegalArgumentException("Loan not found: " + loanId));

        loanEntity.deny(reason);
    }

    @Transactional
    public void processEscalatedLoan(UUID id, String reason) {
        LoanEntity loanEntity = loanRepository.findById(id)
            .orElseThrow(IllegalArgumentException::new);

        loanEntity.escalate(reason);
        loanRepository.save(loanEntity);
    }

    @Transactional
    public LoanResponse resolveLoan(UUID loanId, String action, String reason) {
        switch (action.toUpperCase()) {
            case "APPROVE" -> processApprovedLoan(loanId, reason);
            case "DENY" -> processDeniedLoan(loanId, reason);
            default -> throw new IllegalArgumentException("Action not supported: " + action);
        }

        LoanEntity loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new ResourceNotFoundException("Loan not found: " + loanId));

        return new LoanResponse(loan);
    }

}
