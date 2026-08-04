package io.github.gallardorubio.banksystem.core.fraud.service;

import io.github.gallardorubio.banksystem.core.fraud.dao.FraudRepository;
import io.github.gallardorubio.banksystem.core.fraud.dto.FraudDetectedEvent;
import io.github.gallardorubio.banksystem.core.fraud.entity.FraudEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FraudService {

    private final FraudRepository fraudRepository;

    @Transactional
    public void registerFraud(FraudDetectedEvent event) {
        FraudEntity fraudEntity = FraudEntity.builder()
                .operationId(event.operationId())
                .clientId(event.clientId())
                .clientBankAccountId(event.clientBankAccountId())
                .amount(event.amount())
                .reason(event.reason())
                .build();

        fraudRepository.save(fraudEntity);
    }

    @Transactional(readOnly = true)
    public Page<FraudEntity> getAllFraudRecords(Pageable pageable) {
        return fraudRepository.findAll(pageable);
    }
    
}