package io.github.gallardorubio.banksystem.core.record.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import org.springframework.stereotype.Service;

import io.github.gallardorubio.banksystem.core.record.dao.BankAccountRepository;
import io.github.gallardorubio.banksystem.core.record.dao.EntryRepository;
import io.github.gallardorubio.banksystem.core.record.entity.BankAccountEntity;
import io.github.gallardorubio.banksystem.core.record.entity.EntryEntity;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EntryService {

    private final BankAccountRepository bankAccountRepository;
    private final EntryRepository entryRepository;

    @Transactional
    public void processEntry(
        UUID operationId,
        UUID debitBankAccountId,
        UUID creditBankAccountId,
        BigDecimal amount
    ) {
        BankAccountEntity debitAccountEntity = bankAccountRepository.findByIdForUpdate(debitBankAccountId)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta de débito (vault) no encontrada: " + debitBankAccountId));
        
        BankAccountEntity creditAccountEntity = bankAccountRepository.findByIdForUpdate(creditBankAccountId)
                .orElseThrow(() -> new IllegalArgumentException("Cuenta de crédito no encontrada: " + creditBankAccountId));

        debitAccountEntity.withdraw(amount);
        creditAccountEntity.deposit(amount);

        EntryEntity entry = EntryEntity.builder()
                .debitBankAccountId(debitBankAccountId)
                .creditBankAccountId(creditBankAccountId)
                .amount(amount)
                .operationId(operationId)
                .createdAt(Instant.now())
                .build();

        entryRepository.save(entry);
    }

}
