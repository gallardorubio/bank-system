package io.github.gallardorubio.banksystem.core.installment.scheduler;

import io.github.gallardorubio.banksystem.core.installment.service.InstallmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InstallmentScheduler {

    private final InstallmentService installmentService;

    @Scheduled(cron = "0 0 2 * * ?")
    public void runBatch() {
        installmentService.processDailyInstallments();
    }

}
