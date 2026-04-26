package io.github.gallardorubio.banksystem.core.record.service;

import io.github.gallardorubio.banksystem.core.record.dao.AccountRepository;
import io.github.gallardorubio.banksystem.core.record.dao.EntryRepository;
import io.github.gallardorubio.banksystem.core.record.dto.EntrySummary;
import io.github.gallardorubio.banksystem.core.record.dto.FinancialProfileResponse;
import io.github.gallardorubio.banksystem.core.record.entity.AccountEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccountQueryService {

    private final AccountRepository accountRepository;
    private final EntryRepository entryRepository;

    public FinancialProfileResponse getFinancialProfile(UUID accountId) {
        AccountEntity account = accountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));

        List<EntrySummary> recentEntries = entryRepository.findTop50ByAccountIdOrderByCreatedAtDesc(accountId)
            .stream()
            .map(entry -> new EntrySummary(
                entry.getAmount(),
                entry.getSide().name(),
                entry.getOperationType().name(),
                entry.getCreatedAt()
            ))
            .toList();

        return new FinancialProfileResponse(
            account.getBalance(),
            account.getCurrency(),
            recentEntries
        );
    }
}