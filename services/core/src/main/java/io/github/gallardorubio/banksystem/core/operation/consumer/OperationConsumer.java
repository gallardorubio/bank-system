package io.github.gallardorubio.banksystem.core.operation.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import io.github.gallardorubio.banksystem.core.deposit.service.DepositService;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationApproved;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationDenied;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationEscalated;
import io.github.gallardorubio.banksystem.core.transfer.service.TransferService;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OperationConsumer {
    
    private final TransferService transferService;
    private final DepositService depositService;

    @KafkaListener(topics = "operation-approved", groupId = "core-group")
    public void listenOperationApproved(OperationApproved operationApproved) {
        switch (operationApproved.operationType()) {
            case TRANSFER -> transferService.processApprovedTransfer(operationApproved.operationId());
            case DEPOSIT -> depositService.processApprovedDeposit(operationApproved.operationId());
            default -> throw new UnsupportedOperationException();
        }
    }

    @KafkaListener(topics = "operation-denied", groupId = "core-group")
    public void listenOperationDenied(OperationDenied operationDenied) {
        switch (operationDenied.operationType()) {
            case TRANSFER -> transferService.processDeniedTransfer(operationDenied.operationId(), operationDenied.reason());
            case DEPOSIT -> depositService.processDeniedDeposit(operationDenied.operationId(), operationDenied.reason());
            default -> throw new UnsupportedOperationException();
        }
    }

    @KafkaListener(topics = "operation-escalated", groupId = "core-group")
    public void listenOperationEscalated(OperationEscalated operationEscalated) {
        switch (operationEscalated.operationType()) {
            case TRANSFER -> transferService.processEscalatedTransfer(operationEscalated.operationId(), operationEscalated.reason());
            case DEPOSIT -> depositService.processEscalatedDeposit(operationEscalated.operationId(), operationEscalated.reason());
            default -> throw new UnsupportedOperationException();
        }
    }

}
