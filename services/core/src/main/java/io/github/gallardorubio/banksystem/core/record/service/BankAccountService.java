package io.github.gallardorubio.banksystem.core.record.service;

import io.github.gallardorubio.banksystem.core.client.dto.TrustedBankAccountResponse;
import io.github.gallardorubio.banksystem.core.deposit.dao.DepositRepository;
import io.github.gallardorubio.banksystem.core.installment.dao.InstallmentRepository;
import io.github.gallardorubio.banksystem.core.loan.dao.LoanRepository;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import io.github.gallardorubio.banksystem.core.record.dao.BankAccountRepository;
import io.github.gallardorubio.banksystem.core.record.dao.EntryRepository;
import io.github.gallardorubio.banksystem.core.record.dto.BankAccountAnalyticsResponse;
import io.github.gallardorubio.banksystem.core.record.dto.BankAccountEntryResponse;
import io.github.gallardorubio.banksystem.core.record.dto.BankAccountResponse;
import io.github.gallardorubio.banksystem.core.record.entity.BankAccountEntity;
import io.github.gallardorubio.banksystem.core.record.entity.EntryEntity;
import io.github.gallardorubio.banksystem.core.transfer.dao.TransferRepository;
import io.github.gallardorubio.banksystem.core.transfer.entity.TransferEntity;
import lombok.RequiredArgsConstructor;
import org.openpdf.pdf.ITextRenderer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BankAccountService {

    private final BankAccountRepository bankAccountRepository;
    private final EntryRepository entryRepository;
    private final DepositRepository depositRepository;
    private final TransferRepository transferRepository;
    private final LoanRepository loanRepository;
    private final InstallmentRepository installmentRepository;
    private final TemplateEngine templateEngine;

    private OperationEntity getOperationEntity(UUID operationId) {
        var deposit = depositRepository.findById(operationId);
        if (deposit.isPresent()) {
            return deposit.get();
        }

        var transfer = transferRepository.findById(operationId);
        if (transfer.isPresent()) {
            return transfer.get();
        }

        var loan = loanRepository.findById(operationId);
        if (loan.isPresent()) {
            return loan.get();
        }

        var installment = installmentRepository.findById(operationId);
        if (installment.isPresent()) {
            return installment.get();
        }

        return null;
    }

    private String buildEntryDescription(EntryEntity entry, UUID clientBankAccountId, OperationEntity op) {
        if (op == null) {
            return "Movimiento en cuenta";
        }
        if (op instanceof TransferEntity transfer) {
            boolean isCredit = entry.getCreditBankAccountId().equals(clientBankAccountId);
            String conceptText = (transfer.getConcept() != null && !transfer.getConcept().isBlank())
                    ? transfer.getConcept()
                    : "Transferencia";

            if (isCredit) {
                String senderName = bankAccountRepository.findById(entry.getDebitBankAccountId())
                        .map(BankAccountEntity::getClientName)
                        .orElse("Tercero");
                return "De " + senderName + " - " + conceptText;
            } else {
                String receiverName = bankAccountRepository.findById(entry.getCreditBankAccountId())
                        .map(BankAccountEntity::getClientName)
                        .orElse("Tercero");
                return "A " + receiverName + " - " + conceptText;
            }
        }
        return op.buildDescription();
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
        ).map(entry -> {
            OperationEntity operationEntity = getOperationEntity(entry.getOperationId());
            String description = buildEntryDescription(entry, bankAccountId, operationEntity);
            return new BankAccountEntryResponse(entry, bankAccountId, operationEntity, description);
        });
    }

    @Transactional(readOnly = true)
    public byte[] getBankAccountStatement(UUID bankAccountId, Instant startDate, Instant endDate) {
        BankAccountEntity account = bankAccountRepository.findById(bankAccountId)
            .orElseThrow(() -> new IllegalArgumentException("Bank account not found: " + bankAccountId));

        List<BankAccountEntryResponse> entries = entryRepository.findEntriesForStatement(bankAccountId, startDate, endDate)
            .stream()
            .map(entry -> {
                OperationEntity op = getOperationEntity(entry.getOperationId());
                String description = buildEntryDescription(entry, bankAccountId, op);
                return new BankAccountEntryResponse(entry, bankAccountId, op, description);
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

    @Transactional
    public BankAccountEntity createClientAccount(UUID clientId, String clientName) {
        return bankAccountRepository.save(BankAccountEntity.createForClient(clientId, clientName));
    }

    @Transactional
    public void initializeVaultAccount() {
        bankAccountRepository.ensureVaultAccountExists();
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
    public UUID getAccountIdByClientId(UUID clientId) {
        return bankAccountRepository.findByClientId(clientId)
            .map(BankAccountEntity::getId)
            .orElseThrow(() -> new IllegalArgumentException("Bank account not found for client: " + clientId));
    }

    @Transactional(readOnly = true)
    public BankAccountResponse getBankAccountByClientId(UUID clientId) {
        return bankAccountRepository.findByClientId(clientId)
            .map(BankAccountResponse::new)
            .orElseThrow(() -> new IllegalArgumentException("Bank account not found for client: " + clientId));
    }

    @Transactional(readOnly = true)
    public boolean bankAccountExists(UUID bankAccountId) {
        return bankAccountRepository.existsById(bankAccountId);
    }

    @Transactional(readOnly = true)
    public List<BankAccountEntryResponse> getAllClientEntries(UUID clientId) {
        UUID bankAccountId = bankAccountRepository.findByClientId(clientId)
            .map(BankAccountEntity::getId)
            .orElseThrow(() -> new IllegalArgumentException("Bank account not found for client: " + clientId));

        return entryRepository.findAllByDebitBankAccountIdOrCreditBankAccountIdOrderByCreatedAtDesc(bankAccountId, bankAccountId)
            .stream()
            .map(entry -> {
                OperationEntity operationEntity = getOperationEntity(entry.getOperationId());
                String description = buildEntryDescription(entry, bankAccountId, operationEntity);
                return new BankAccountEntryResponse(entry, bankAccountId, operationEntity, description);
            })
            .toList();
    }

    @Transactional(readOnly = true)
    public BankAccountResponse getBankAccount(UUID bankAccountId) {
        return bankAccountRepository.findById(bankAccountId)
            .map(BankAccountResponse::new)
            .orElseThrow(() -> new IllegalArgumentException("Bank account not found: " + bankAccountId));
    }

    @Transactional
    public void updateClientName(UUID clientId, String newName) {
        bankAccountRepository.findByClientId(clientId).ifPresent(account -> {
            account.setClientName(newName);
            bankAccountRepository.save(account);
        });
    }
}