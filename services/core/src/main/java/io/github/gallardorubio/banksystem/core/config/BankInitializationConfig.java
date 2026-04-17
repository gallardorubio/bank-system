package io.github.gallardorubio.banksystem.core.config;

import io.github.gallardorubio.banksystem.core.record.service.AccountService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BankInitializationConfig {

    @Bean
    public CommandLineRunner initializeBankInfrastructure(AccountService accountService) {
        return args -> {
            accountService.initializeVaultAccount();
        };
    }
}