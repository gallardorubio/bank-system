package io.github.gallardorubio.banksystem.core.operation.service;

import java.util.UUID;

import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.gallardorubio.banksystem.core.deposit.dto.DepositResponse;
import io.github.gallardorubio.banksystem.core.deposit.entity.DepositEntity;
import io.github.gallardorubio.banksystem.core.installment.dto.InstallmentResponse;
import io.github.gallardorubio.banksystem.core.installment.entity.InstallmentEntity;
import io.github.gallardorubio.banksystem.core.loan.dto.LoanResponse;
import io.github.gallardorubio.banksystem.core.loan.entity.LoanEntity;
import io.github.gallardorubio.banksystem.core.operation.dao.OperationRepository;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationResponse;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferResponse;
import io.github.gallardorubio.banksystem.core.transfer.entity.TransferEntity;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OperationService {

    private final OperationRepository operationRepository;

    @Transactional(readOnly = true)
    public OperationResponse getOperation(String operationId, UUID clientId) {
        OperationEntity operationEntity = operationRepository.findByIdAndClientId(operationId, clientId)
            .orElseThrow(() -> new ResourceNotFoundException("Operation not found: " + operationId));

        return switch (operationEntity) {
            case DepositEntity depositEntity -> new DepositResponse(depositEntity);
            case InstallmentEntity installmentEntity -> new InstallmentResponse(installmentEntity);
            case LoanEntity loanEntity -> new LoanResponse(loanEntity);
            case TransferEntity transferEntity -> new TransferResponse(transferEntity);
            default -> throw new UnsupportedOperationException("Operation type not supported: " + operationEntity.getClass().getSimpleName()); 
        };
    }
    
}
