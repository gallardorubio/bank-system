package io.github.gallardorubio.banksystem.core.installment.service;

import io.github.gallardorubio.banksystem.core.installment.dao.InstallmentRepository;
import io.github.gallardorubio.banksystem.core.installment.entity.InstallmentEntity;
import io.github.gallardorubio.banksystem.core.loan.dao.LoanRepository;
import io.github.gallardorubio.banksystem.core.loan.entity.LoanEntity;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationRequestOrigin;
import io.github.gallardorubio.banksystem.core.record.entity.BankAccountEntity;
import io.github.gallardorubio.banksystem.core.record.service.EntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InstallmentService {

    private final LoanRepository loanRepository;
    private final EntryService recordService;
    private final InstallmentRepository installmentRepository;

    @Transactional
    public void processDailyInstallments() {
        List<LoanEntity> dueLoans = loanRepository.findDueLoans(Instant.now());
        
        for(LoanEntity loanEntity : dueLoans) {
            try {
                processInstallment(loanEntity);
            } catch (Exception e) {

            }
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processInstallment(LoanEntity loanEntity) {
        OperationRequestOrigin origin = new OperationRequestOrigin(
            "127.0.0.1",
            "CoreBatch",
            "ES",
            "local"
        );

        InstallmentEntity installmentEntity = InstallmentEntity.builder()
            .loanId(loanEntity.getId())
            .clientId(loanEntity.getClientId())
            .clientBankAccountId(loanEntity.getClientBankAccountId())
            .amount(loanEntity.getNextInstallmentAmount())
            .origin(origin)
            .build();

        installmentEntity.pending("Pago de cuota pendiente de aprobación automática");
        installmentEntity.approve("Pago de cuota aprobado automáticamente");

        installmentEntity = installmentRepository.saveAndFlush(installmentEntity);
        
        try {
            recordService.processEntry(
                installmentEntity.getId(),
                loanEntity.getClientBankAccountId(), 
                BankAccountEntity.VAULT_ACCOUNT_ID,
                installmentEntity.getAmount()
            );

            installmentEntity.complete("Apunte contable de cuota completado");

            Instant nextInstallmentDate = loanEntity.getNextInstallmentDate()
                .plus(loanEntity.getInstallmentFrequency().getDaysToAdd(), ChronoUnit.DAYS);
        
            loanEntity.registerNextInstallment(nextInstallmentDate);
            loanRepository.save(loanEntity);
        } catch (Exception e) {
            installmentEntity.reject("Error en apunte contable de cuota: " + e.getMessage());
        }

        installmentRepository.save(installmentEntity);
    }

    

}
