package io.github.gallardorubio.banksystem.core.loan.service;

import io.github.gallardorubio.banksystem.core.loan.dao.LoanRepository;
import io.github.gallardorubio.banksystem.core.loan.dto.LoanDetails;
import io.github.gallardorubio.banksystem.core.loan.dto.LoanRequest;
import io.github.gallardorubio.banksystem.core.loan.entity.InstallmentFrequency;
import io.github.gallardorubio.banksystem.core.loan.entity.InterestType;
import io.github.gallardorubio.banksystem.core.loan.entity.LoanEntity;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationPending;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import io.github.gallardorubio.banksystem.core.operation.producer.OperationProducer;
import io.github.gallardorubio.banksystem.core.record.dao.AccountRepository;
import io.github.gallardorubio.banksystem.core.record.entity.AccountEntity;
import io.github.gallardorubio.banksystem.core.record.service.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final RecordService recordService;
    private final AccountRepository accountRepository;
    private final OperationProducer operationProducer;

    private static final UUID VAULT_ACCOUNT_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    @Value("${app.loan.rates.fixed}")
    private BigDecimal fixedRate;

    @Value("${app.loan.rates.margin}")
    private BigDecimal margin;

    @Value("${app.loan.rates.euribor}")
    private BigDecimal euribor;

    @Transactional
    public UUID initiatePendingLoan(LoanRequest loanRequest) {
        AccountEntity targetAccount = accountRepository.findById(loanRequest.targetAccountId())
            .orElseThrow(IllegalArgumentException::new);

        BigDecimal appliedInterestRate = calculateInterest(loanRequest.interestType());

        LoanEntity loanEntity = new LoanEntity(
            loanRequest.targetAccountId(),
            loanRequest.amount(),
            loanRequest.termPeriods(),
            loanRequest.installmentFrequency(),
            appliedInterestRate
        );

        loanRepository.save(loanEntity);

        LoanDetails loanDetails = new LoanDetails(
            targetAccount.getOwnerId(),
            loanEntity.getTargetAccountId(),
            loanEntity.getTermPeriods(),
            loanEntity.getInterestRate()
        );

        OperationPending<LoanDetails> operationPending = new OperationPending<>(
            loanEntity.getId(),
            loanEntity.getAmount(),
            OperationType.LOAN,
            loanDetails
        );

        operationProducer.sendOperationPending(operationPending);

        return loanEntity.getId();
    }

    @Transactional
    public void processApprovedLoan(UUID id) {
        LoanEntity loanEntity = loanRepository.findById(id)
            .orElseThrow(IllegalArgumentException::new);

        loanEntity.approve();

        try {
            MathContext mc = MathContext.DECIMAL128; // Alta precisión para cálculos intermedios

            int periodsPerYear = getPeriodsPerYear(loanEntity.getInstallmentFrequency());
            
            BigDecimal annualDecimalRate = loanEntity.getInterestRate().divide(BigDecimal.valueOf(100), mc);
            BigDecimal periodicRate = annualDecimalRate.divide(BigDecimal.valueOf(periodsPerYear), mc);

            BigDecimal installmentTotal;
            BigDecimal firstInterest;
            BigDecimal firstPrincipal;

            if (periodicRate.compareTo(BigDecimal.ZERO) == 0) {
                installmentTotal = loanEntity.getAmount().divide(BigDecimal.valueOf(loanEntity.getTermPeriods()), 4, RoundingMode.HALF_UP);
                firstInterest = BigDecimal.ZERO;
                firstPrincipal = installmentTotal;
            } else {
                // Cuota = Capital * (i / (1 - (1+i)^-n))
                BigDecimal onePlusI = BigDecimal.ONE.add(periodicRate, mc);
                // (1+i)^n
                BigDecimal onePlusIToN = onePlusI.pow(loanEntity.getTermPeriods(), mc);
                // 1 - (1 / (1+i)^n)
                BigDecimal denominator = BigDecimal.ONE.subtract(BigDecimal.ONE.divide(onePlusIToN, mc), mc);
                
                // (Capital * i) / denominador
                BigDecimal numerator = loanEntity.getAmount().multiply(periodicRate, mc);
                installmentTotal = numerator.divide(denominator, 4, RoundingMode.HALF_UP);

                firstInterest = loanEntity.getAmount().multiply(periodicRate).setScale(4, RoundingMode.HALF_UP);
                firstPrincipal = installmentTotal.subtract(firstInterest);
            }

            long daysToAdd = switch (loanEntity.getInstallmentFrequency()) {
                case MONTHLY -> 30L;
                case SEMI_ANNUAL -> 180L;
                case ANNUAL -> 365L;
            };

            Instant maturityDate = Instant.now().plus(daysToAdd * loanEntity.getTermPeriods(), ChronoUnit.DAYS);

            loanEntity.startLoan(installmentTotal, firstPrincipal, firstInterest, maturityDate);

            recordService.processDoubleEntry(
                loanEntity.getId(),
                VAULT_ACCOUNT_ID,
                loanEntity.getTargetAccountId(),
                loanEntity.getAmount(),
                OperationType.LOAN
            );

            loanEntity.complete();
        } catch (Exception e) {
            loanEntity.reject("");
        }

        loanRepository.save(loanEntity);
    }

    @Transactional
    public void processDeniedLoan(UUID id, String reason) {
        LoanEntity loanEntity = loanRepository.findById(id)
            .orElseThrow(IllegalArgumentException::new);

        loanEntity.deny(reason);
        loanRepository.save(loanEntity);
    }

    @Transactional
    public void processEscalatedLoan(UUID id, String reason) {
        LoanEntity loanEntity = loanRepository.findById(id)
            .orElseThrow(IllegalArgumentException::new);

        loanEntity.escalate(reason);
        loanRepository.save(loanEntity);
    }

    private BigDecimal calculateInterest(InterestType interestType) {
        return switch (interestType) {
            case FIXED -> fixedRate;
            case VARIABLE -> euribor.add(margin);
            case MIXED -> fixedRate.add(euribor).divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
        };
    }

    private int getPeriodsPerYear(InstallmentFrequency installmentFrequency) {
        return switch (installmentFrequency) {
            case MONTHLY -> 12;
            case SEMI_ANNUAL -> 2;
            case ANNUAL -> 1;
        };
    }

}