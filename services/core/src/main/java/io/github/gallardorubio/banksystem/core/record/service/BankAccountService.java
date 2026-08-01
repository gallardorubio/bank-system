package io.github.gallardorubio.banksystem.core.record.service;

import io.github.gallardorubio.banksystem.core.record.dao.BankAccountRepository;
import io.github.gallardorubio.banksystem.core.record.entity.BankAccountEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BankAccountService {

    private final BankAccountRepository bankAccountRepository;

    @Transactional
    public void createClientAccount(UUID ownerId) {
        BankAccountEntity account = new BankAccountEntity(ownerId, BankAccountEntity.AccountType.LIABILITY, "EUR");
        bankAccountRepository.save(account);
    }

    @Transactional
    public void initializeVaultAccount() {
        bankAccountRepository.ensureVaultAccountExists();
    }
}