package io.github.gallardorubio.banksystem.core.deposit.service;

import io.github.gallardorubio.banksystem.core.deposit.dao.DepositRepository;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositDetails;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositRequest;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositResponse;
import io.github.gallardorubio.banksystem.core.deposit.entity.DepositEntity;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationPending;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationStatus;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import io.github.gallardorubio.banksystem.core.operation.entity.RequestOrigin;
import io.github.gallardorubio.banksystem.core.operation.entity.StatusEntry;
import io.github.gallardorubio.banksystem.core.record.service.RecordService;
import lombok.RequiredArgsConstructor;

import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DepositService {

    private final DepositRepository depositRepository;
    private final RecordService recordService;
    private final ApplicationEventPublisher applicationEventPublisher;
    private static final UUID VAULT_ACCOUNT_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    @Transactional(readOnly = true)
    public DepositResponse getDeposit(UUID depositId, UUID clientId) {
        return depositRepository.findByIdAndClientId(depositId, clientId)
            .map(deposit -> new DepositResponse(
                deposit.getAmount(),
                deposit.getStatus(),
                deposit.getStatusHistory(),
                deposit.getOrigin(),
                deposit.getCreatedAt()
            ))
            .orElseThrow(() -> new ResourceNotFoundException("Deposit not found with id: " + depositId));
    }

    @Transactional(readOnly = true)
    public List<DepositResponse> getAllDeposits(UUID clientId) {
        return depositRepository.findAll().stream()
            .filter(deposit -> deposit.getClientId().equals(clientId))
            .map(deposit -> new DepositResponse(
                deposit.getAmount(),
                deposit.getStatus(),
                deposit.getStatusHistory(),
                deposit.getOrigin(),
                deposit.getCreatedAt()
            ))
            .toList();
    }

    @Transactional
    public UUID initiatePendingDeposit(DepositRequest depositRequest, UUID clientId, RequestOrigin origin) {
        DepositEntity depositEntity = DepositEntity.builder()
            .clientId(clientId)
            .clientBankAccountId(depositRequest.bankAccountId())
            .amount(depositRequest.amount())
            .status(OperationStatus.PENDING)
            .statusHistory(List.of(new StatusEntry(OperationStatus.PENDING, LocalDateTime.now(), "Created")))
            .origin(origin)
            .createdAt(LocalDateTime.now())
            .build();

        depositRepository.save(depositEntity);

        DepositDetails depositDetails = new DepositDetails(
            depositEntity.getId(),
            depositEntity.getClientId(),
            depositEntity.getClientBankAccountId(),
            depositEntity.getTargetBankAccountId(),
            depositEntity.getAmount(),
            depositEntity.getStatus(),
            depositEntity.getStatusHistory(),
            depositEntity.getOrigin(),
            depositEntity.getCreatedAt()
        );

        OperationPending<DepositDetails> operationPending = new OperationPending<>(
            depositEntity.getId(),
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
