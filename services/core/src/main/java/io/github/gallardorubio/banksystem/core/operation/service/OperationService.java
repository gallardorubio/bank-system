package io.github.gallardorubio.banksystem.core.operation.service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.openpdf.pdf.ITextRenderer;

import io.github.gallardorubio.banksystem.core.deposit.dto.DepositResponse;
import io.github.gallardorubio.banksystem.core.deposit.entity.DepositEntity;
import io.github.gallardorubio.banksystem.core.installment.dto.InstallmentResponse;
import io.github.gallardorubio.banksystem.core.installment.entity.InstallmentEntity;
import io.github.gallardorubio.banksystem.core.loan.dto.LoanResponse;
import io.github.gallardorubio.banksystem.core.loan.entity.LoanEntity;
import io.github.gallardorubio.banksystem.core.operation.dao.OperationRepository;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationEntryResponse;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationResponse;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationEntity;
import io.github.gallardorubio.banksystem.core.record.dao.BankAccountRepository;
import io.github.gallardorubio.banksystem.core.record.entity.BankAccountEntity;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferResponse;
import io.github.gallardorubio.banksystem.core.transfer.entity.TransferEntity;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OperationService {

    private final OperationRepository operationRepository;
    private final TemplateEngine templateEngine;
    private final BankAccountRepository bankAccountRepository;

    @Transactional(readOnly = true)
    public OperationResponse getOperation(UUID operationId, UUID clientId) {
        OperationEntity operationEntity = operationRepository.findByIdAndClientId(operationId, clientId)
            .orElseThrow(() -> new ResourceNotFoundException("Operation not found: " + operationId));

        return switch (operationEntity) {
            case DepositEntity depositEntity -> new DepositResponse(depositEntity);
            case InstallmentEntity installmentEntity -> new InstallmentResponse(installmentEntity);
            case LoanEntity loanEntity -> new LoanResponse(loanEntity);
            case TransferEntity transferEntity -> new TransferResponse(transferEntity);
            default -> throw new UnsupportedOperationException("Operation type not supported: " + operationEntity.getClass().getSimpleName()); 
        };
    }
    
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
            p.getDescription(),
            p.getAmount(),
            p.getOperationDirection(),
            p.getCreatedAt()
        ));
    }
    
}
