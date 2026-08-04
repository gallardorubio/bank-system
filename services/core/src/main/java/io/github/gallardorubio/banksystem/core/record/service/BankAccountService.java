package io.github.gallardorubio.banksystem.core.record.service;

import io.github.gallardorubio.banksystem.core.clients.dto.TrustedBankAccountResponse;
import io.github.gallardorubio.banksystem.core.operation.dao.OperationRepository;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import io.github.gallardorubio.banksystem.core.record.dao.BankAccountRepository;
import io.github.gallardorubio.banksystem.core.record.dao.EntryRepository;
import io.github.gallardorubio.banksystem.core.record.dto.BankAccountAnalyticsResponse;
import io.github.gallardorubio.banksystem.core.record.dto.BankAccountEntryResponse;
import io.github.gallardorubio.banksystem.core.record.entity.BankAccountEntity;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.openpdf.pdf.ITextRenderer;
import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
public class BankAccountService {

    private final BankAccountRepository bankAccountRepository;
    private final EntryRepository entryRepository;
    private final OperationRepository operationRepository;
    private final TemplateEngine templateEngine;

    @Transactional
    public BankAccountEntity createClientAccount(UUID clientId, String clientName) {
        return bankAccountRepository.save(BankAccountEntity.createForClient(clientId, clientName));
    }

    @Transactional
    public void initializeVaultAccount() {
        bankAccountRepository.ensureVaultAccountExists();
    }

    @Transactional(readOnly = true)
    public Page<BankAccountEntryResponse> getAllBankAccountEntriesFiltered(
        UUID clientId,
        String concept,
        String targetClientName,
        Instant createdAt,
        UUID targetBankAccountId,
        BigDecimal amount,
        Pageable pageable
    ) {
        UUID bankAccountId = bankAccountRepository.findByClientId(clientId)
            .map(BankAccountEntity::getId)
            .orElseThrow(() -> new IllegalArgumentException("Bank account not found for client: " + clientId));

        return entryRepository.findFilteredEntries(
                bankAccountId, concept, targetClientName, createdAt, targetBankAccountId, amount, pageable
            )
            .map(entry -> {
                OperationEntity operationEntity = operationRepository.findById(entry.getOperationId()).orElse(null);
                return new BankAccountEntryResponse(entry, bankAccountId, operationEntity);
            });
    }

    @Transactional(readOnly = true)
    public BigDecimal getBankAccountBalance(UUID clientId) {
        return bankAccountRepository.findBankAccountBalanceByClientId(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Bank account not found for client: " + clientId));
    }

    @Transactional(readOnly = true)
    public BankAccountAnalyticsResponse getBankAnalytics() {
        return bankAccountRepository.getBankAnalytics(BankAccountEntity.VAULT_ACCOUNT_ID);
    }

    @Transactional(readOnly = true)
    public List<TrustedBankAccountResponse> getClientNamesByAccountIds(List<UUID> accountIds) {
        if (accountIds == null || accountIds.isEmpty()) {
            return List.of();
        }
        return bankAccountRepository.findClientNamesByAccountIds(accountIds);
    }

    @Transactional(readOnly = true)
    public byte[] getBankAccountStatementPdf(UUID bankAccountId, Instant startDate, Instant endDate) {
        BankAccountEntity account = bankAccountRepository.findById(bankAccountId)
            .orElseThrow(() -> new IllegalArgumentException("Bank account not found: " + bankAccountId));

        List<BankAccountEntryResponse> entries = entryRepository.findEntriesForStatement(bankAccountId, startDate, endDate)
            .stream()
            .map(entry -> {
                OperationEntity op = operationRepository.findById(entry.getOperationId()).orElse(null);
                return new BankAccountEntryResponse(entry, bankAccountId, op);
            })
            .toList();

        Context context = new Context();
        context.setVariable("account", account);
        context.setVariable("entries", entries);
        
        String period = (startDate != null ? startDate.toString() : "Inicio") + " - " + (endDate != null ? endDate.toString() : "Hoy");
        context.setVariable("period", period);

        String htmlContent = templateEngine.process("bank-account-statement", context);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(out);

            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF statement for bank account: " + bankAccountId, e);
        }
    }

    @Transactional(readOnly = true)
    public UUID getAccountIdByClientId(UUID clientId) {
        return bankAccountRepository.findByClientId(clientId)
            .map(BankAccountEntity::getId)
            .orElseThrow(() -> new IllegalArgumentException("Bank account not found for client: " + clientId));
    }

}
