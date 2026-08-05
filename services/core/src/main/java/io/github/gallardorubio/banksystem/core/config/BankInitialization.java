package io.github.gallardorubio.banksystem.core.config;

import io.github.gallardorubio.banksystem.core.record.service.BankAccountService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BankInitialization {

    @Bean
    public CommandLineRunner initializeBankInfrastructure(BankAccountService bankAccountService) {
        return args -> {
            bankAccountService.initializeVaultAccount();
        };
    }

}
