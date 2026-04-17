package io.github.gallardorubio.banksystem.core.deposit.service;

import io.github.gallardorubio.banksystem.core.deposit.dao.DepositRepository;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositDetails;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositRequest;
import io.github.gallardorubio.banksystem.core.deposit.entity.DepositEntity;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationPending;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import io.github.gallardorubio.banksystem.core.record.service.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepositService {

    private final DepositRepository depositRepository;
    private final RecordService recordService;
    private final ApplicationEventPublisher applicationEventPublisher;
    private static final UUID VAULT_ACCOUNT_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    @Transactional
    public UUID initiatePendingDeposit(DepositRequest depositRequest) {
        recordService.checkAccountExists(depositRequest.targetAccountId());

        DepositEntity depositEntity = new DepositEntity(
            depositRequest.targetAccountId(),
            depositRequest.amount()
        );

        depositRepository.save(depositEntity);

        DepositDetails depositDetails = new DepositDetails(depositEntity.getTargetAccountId());

        OperationPending<DepositDetails> operationPending = new OperationPending<>(
            depositEntity.getId(),
            depositEntity.getAmount(),
            OperationType.DEPOSIT,
            depositDetails
        );

        applicationEventPublisher.publishEvent(operationPending);

        return depositEntity.getId();
    }

    @Transactional
    public void processApprovedDeposit(UUID id) {
        DepositEntity depositEntity = depositRepository.findById(id)
            .orElseThrow(IllegalArgumentException::new);

        depositEntity.approve();

        try {
            recordService.processDoubleEntry(
                depositEntity.getId(),
                depositEntity.getTargetAccountId(),
                VAULT_ACCOUNT_ID,
                depositEntity.getAmount(),
                OperationType.DEPOSIT
            );
            
            depositEntity.complete();
        } catch (Exception e) {
            depositEntity.reject("");
        }

        depositRepository.save(depositEntity);
    }

    @Transactional
    public void processDeniedDeposit(UUID id, String reason) {
        DepositEntity depositEntity = depositRepository.findById(id)
            .orElseThrow(IllegalArgumentException::new);
        
        depositEntity.deny(reason);
        depositRepository.save(depositEntity);
    }

    @Transactional
    public void processEscalatedDeposit(UUID id, String reason) {
        DepositEntity depositEntity = depositRepository.findById(id)
            .orElseThrow(IllegalArgumentException::new);
        
        depositEntity.escalate(reason);
        depositRepository.save(depositEntity);
    }

}
