package io.github.gallardorubio.banksystem.core.record.service;

import io.github.gallardorubio.banksystem.core.record.dao.AccountRepository;
import io.github.gallardorubio.banksystem.core.record.entity.AccountEntity;
import io.github.gallardorubio.banksystem.core.record.entity.AccountType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private static final UUID VAULT_ACCOUNT_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    @Transactional
    public void createClientAccount(UUID ownerId) {
        AccountEntity account = new AccountEntity(ownerId, AccountType.LIABILITY, "EUR");
        accountRepository.save(account);
    }

    @Transactional
    public void initializeVaultAccount() {
        if (!accountRepository.existsById(VAULT_ACCOUNT_ID)) {
            AccountEntity vaultAccount = new AccountEntity(VAULT_ACCOUNT_ID, AccountType.ASSET, "EUR");
            
            try {
                var idField = AccountEntity.class.getDeclaredField("id");
                idField.setAccessible(true);
                idField.set(vaultAccount, VAULT_ACCOUNT_ID);
            } catch (Exception e) {
                throw new RuntimeException("Fallo crítico al inicializar la Bóveda del Banco", e);
            }
            
            accountRepository.save(vaultAccount);
        }
    }
}