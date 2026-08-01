package io.github.gallardorubio.banksystem.core.operation.consumer;

import io.github.gallardorubio.banksystem.core.deposit.service.DepositService;
import io.github.gallardorubio.banksystem.core.loan.service.LoanService;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationResolution;
import io.github.gallardorubio.banksystem.core.transfer.service.TransferService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OperationConsumer {

    private final TransferService transferService;
    private final DepositService depositService;
    private final LoanService loanService;

    @KafkaListener(topics = "operation-approved", groupId = "core-group")
    public void listenOperationApproved(OperationResolution res) {
        switch (res.operationType()) {
            case TRANSFER -> transferService.processApprovedTransfer(res.operationId(), res.reason());
            case DEPOSIT  -> depositService.processApprovedDeposit(res.operationId(), res.reason());
            case LOAN     -> loanService.processApprovedLoan(res.operationId(), res.reason());
            default      -> throw new UnsupportedOperationException("Operation not supported: " + res.operationType());
        }
    }

    @KafkaListener(topics = "operation-denied", groupId = "core-group")
    public void listenOperationDenied(OperationResolution res) {
        switch (res.operationType()) {
            case TRANSFER -> transferService.processDeniedTransfer(res.operationId(), res.reason());
            case DEPOSIT  -> depositService.processDeniedDeposit(res.operationId(), res.reason());
            case LOAN     -> loanService.processDeniedLoan(res.operationId(), res.reason());
            default      -> throw new UnsupportedOperationException("Operation not supported: " + res.operationType());
        }
    }

    @KafkaListener(topics = "operation-escalated", groupId = "core-group")
    public void listenOperationEscalated(OperationResolution res) {
        switch (res.operationType()) {
            case DEPOSIT -> depositService.processEscalatedDeposit(res.operationId(), res.reason());
            case LOAN    -> loanService.processEscalatedLoan(res.operationId(), res.reason());
            default      -> throw new UnsupportedOperationException("Operation not supported: " + res.operationType());
        }
    }

}
