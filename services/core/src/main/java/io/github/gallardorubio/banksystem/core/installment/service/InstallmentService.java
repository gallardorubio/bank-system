package io.github.gallardorubio.banksystem.core.installment.service;

import io.github.gallardorubio.banksystem.core.installment.dao.InstallmentRepository;
import io.github.gallardorubio.banksystem.core.installment.entity.InstallmentEntity;
import io.github.gallardorubio.banksystem.core.loan.dao.LoanRepository;
import io.github.gallardorubio.banksystem.core.loan.entity.InstallmentFrequency;
import io.github.gallardorubio.banksystem.core.loan.entity.LoanEntity;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import io.github.gallardorubio.banksystem.core.record.service.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InstallmentService {

    private final LoanRepository loanRepository;
    private final InstallmentRepository installmentRepository;
    private final RecordService recordService;

    private static final UUID VAULT_ACCOUNT_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    @Transactional
    public void processDailyInstallments() {
        List<LoanEntity> dueLoans = loanRepository.findDueLoans(Instant.now());
        
        for (LoanEntity loan : dueLoans) {
            try {
                processSingleInstallment(loan);
            } catch (Exception e) {
                // En un entorno de producción se registra en el log
            }
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processSingleInstallment(LoanEntity loan) {
        InstallmentEntity installment = new InstallmentEntity(
            loan.getId(),
            loan.getNextInstallmentAmount(),
            loan.getNextInstallmentPrincipal(),
            loan.getNextInstallmentInterest()
        );

        installment.approve();

        recordService.processDoubleEntry(
            installment.getId(),
            loan.getTargetAccountId(), 
            VAULT_ACCOUNT_ID,          
            installment.getAmount(),
            OperationType.INSTALLMENT
        );

        installment.complete();
        installmentRepository.save(installment);

        Instant nextDate = calculateNextDate(loan.getNextInstallmentDate(), loan.getInstallmentFrequency());
        loan.registerInstallmentPayment(nextDate);
        loanRepository.save(loan);
    }

    private Instant calculateNextDate(Instant current, InstallmentFrequency frequency) {
        long daysToAdd = switch (frequency) {
            case MONTHLY -> 30L;
            case SEMI_ANNUAL -> 180L;
            case ANNUAL -> 365L;
        };
        return current.plus(daysToAdd, ChronoUnit.DAYS);
    }

}
