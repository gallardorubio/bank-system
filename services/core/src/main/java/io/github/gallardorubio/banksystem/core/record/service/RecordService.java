package io.github.gallardorubio.banksystem.core.record.service;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.stereotype.Service;

import io.github.gallardorubio.banksystem.core.record.dao.AccountRepository;
import io.github.gallardorubio.banksystem.core.record.dao.EntryRepository;
import io.github.gallardorubio.banksystem.core.record.entity.AccountEntity;
import io.github.gallardorubio.banksystem.core.record.entity.EntryEntity;
import io.github.gallardorubio.banksystem.core.record.entity.OperationType;
import io.github.gallardorubio.banksystem.core.record.entity.Side;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecordService {

    private final AccountRepository accountRepository;

    private final EntryRepository entryRepository;

    @Transactional
    public void processDoubleEntry(UUID operationId, 
                                   UUID debitAccountId, 
                                   UUID creditAccountId, 
                                   BigDecimal amount,
                                   OperationType operationType) {
        
        AccountEntity debitAccount = accountRepository.findByIdForUpdate(debitAccountId)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta de débito no encontrada: " + debitAccountId));
                
        AccountEntity creditAccount = accountRepository.findByIdForUpdate(creditAccountId)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta de crédito no encontrada: " + creditAccountId));

        debitAccount.apply(amount, Side.DEBIT);
        creditAccount.apply(amount, Side.CREDIT);

        EntryEntity debitEntry = new EntryEntity(
                debitAccount, 
                amount,
                Side.DEBIT,
                operationId,
                operationType
        );

        EntryEntity creditEntry = new EntryEntity(
                creditAccount,
                amount,
                Side.CREDIT,
                operationId,
                operationType
        );

        entryRepository.save(debitEntry);
        entryRepository.save(creditEntry);
    } 

}
