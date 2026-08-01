package io.github.gallardorubio.banksystem.core.record.service;

import io.github.gallardorubio.banksystem.core.operation.dao.OperationRepository;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import io.github.gallardorubio.banksystem.core.record.dao.BankAccountRepository;
import io.github.gallardorubio.banksystem.core.record.dao.EntryRepository;
import io.github.gallardorubio.banksystem.core.record.dto.BankAccountEntryResponse;
import io.github.gallardorubio.banksystem.core.record.dto.ClientRegistered;
import io.github.gallardorubio.banksystem.core.record.entity.BankAccountEntity;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BankAccountService {

    private final BankAccountRepository bankAccountRepository;
    private final EntryRepository entryRepository;
    private final OperationRepository operationRepository;

    @Transactional
    public void createClientAccount(ClientRegistered event) {
        BankAccountEntity bankAccountEntity = BankAccountEntity.fromDto(event);
        bankAccountRepository.save(bankAccountEntity);
    }

    @Transactional
    public void initializeVaultAccount() {
        bankAccountRepository.ensureVaultAccountExists();
    }

    @Transactional(readOnly = true)
    public Page<BankAccountEntryResponse> getAllBankAccountEntries(UUID clientId, Pageable pageable) {
        UUID bankAccountId = bankAccountRepository.findByClientId(clientId)
            .map(BankAccountEntity::getId)
            .orElseThrow(() -> new IllegalArgumentException("Bank account not found for client: " + clientId));

        return entryRepository.findAllByBankAccountIdOrderByCreatedAtDesc(bankAccountId, pageable)
            .map(entry -> {
                OperationEntity operationEntity = operationRepository.findById(entry.getOperationId()).orElse(null);
                return new BankAccountEntryResponse(entry, bankAccountId, operationEntity);
            });
    }

}
