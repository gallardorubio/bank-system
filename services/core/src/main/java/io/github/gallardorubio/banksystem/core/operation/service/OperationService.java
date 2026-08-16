package io.github.gallardorubio.banksystem.core.operation.service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.openpdf.pdf.ITextRenderer;

import io.github.gallardorubio.banksystem.core.deposit.dao.DepositRepository;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositResponse;
import io.github.gallardorubio.banksystem.core.installment.dao.InstallmentRepository;
import io.github.gallardorubio.banksystem.core.installment.dto.InstallmentResponse;
import io.github.gallardorubio.banksystem.core.loan.dao.LoanRepository;
import io.github.gallardorubio.banksystem.core.loan.dto.LoanResponse;
import io.github.gallardorubio.banksystem.core.operation.dao.OperationRepository;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationEntryResponse;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationResponse;
import io.github.gallardorubio.banksystem.core.record.dao.BankAccountRepository;
import io.github.gallardorubio.banksystem.core.record.entity.BankAccountEntity;
import io.github.gallardorubio.banksystem.core.transfer.dao.TransferRepository;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OperationService {

    private final OperationRepository operationRepository;
    private final DepositRepository depositRepository;
    private final TransferRepository transferRepository;
    private final LoanRepository loanRepository;
    private final InstallmentRepository installmentRepository;
    private final TemplateEngine templateEngine;
    private final BankAccountRepository bankAccountRepository;

    @Transactional(readOnly = true)
    public OperationResponse getOperation(UUID operationId, UUID clientId) {
        var deposit = depositRepository.findByIdAndClientId(operationId, clientId);
        if (deposit.isPresent()) {
            return new DepositResponse(deposit.get());
        }

        var transfer = transferRepository.findByIdAndClientId(operationId, clientId);
        if (transfer.isPresent()) {
            return new TransferResponse(transfer.get());
        }

        var loan = loanRepository.findByIdAndClientId(operationId, clientId);
        if (loan.isPresent()) {
            return new LoanResponse(loan.get());
        }

        var installment = installmentRepository.findByIdAndClientId(operationId, clientId);
        if (installment.isPresent()) {
            return new InstallmentResponse(installment.get());
        }

        throw new ResourceNotFoundException("Operation not found: " + operationId);
    }
    
    @Transactional(readOnly = true)
    public byte[] getOperationStatement(UUID operationId, UUID clientId) {
        OperationResponse operationResponse = getOperation(operationId, clientId);

        String currency = bankAccountRepository.findByClientId(clientId)
            .map(BankAccountEntity::getCurrency)
            .orElse("EUR");

        Context context = new Context();
        context.setVariable("op", operationResponse);
        context.setVariable("currency", currency);

        String htmlContent = templateEngine.process("operation-statement", context);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(out);
            
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF statement for operation: " + operationId, e);
        }        
    }

    @Transactional(readOnly = true)
    public Page<OperationEntryResponse> getAllOperationsFiltered(
        UUID clientId,
        String concept,
        String targetClientName,
        Instant createdAt,
        UUID targetBankAccountId,
        BigDecimal amount,
        Pageable pageable
    ) {
        return operationRepository.findFilteredOperations(
            clientId, concept, targetClientName, createdAt, targetBankAccountId, amount, pageable
        ).map(p -> new OperationEntryResponse(
            p.getId(),
            p.getOperationId(),
            p.getOperationType(),
            p.getStatus(),
            p.getDescription(),
            p.getAmount(),
            p.getOperationDirection(),
            p.getCreatedAt()
        ));
    }

    @Transactional(readOnly = true)
    public List<OperationResponse> getAllClientOperations(UUID clientId) {
        List<OperationResponse> list = new ArrayList<>();
    
        list.addAll(depositRepository.findAllByClientId(clientId).stream().map(DepositResponse::new).toList());
        list.addAll(transferRepository.findAllByClientId(clientId).stream().map(TransferResponse::new).toList());
        list.addAll(loanRepository.findAllByClientId(clientId).stream().map(LoanResponse::new).toList());
        list.addAll(installmentRepository.findAllByClientId(clientId).stream().map(InstallmentResponse::new).toList());

        list.sort(Comparator.comparing(OperationResponse::createdAt).reversed());
        
        return list;
    }
    
}
