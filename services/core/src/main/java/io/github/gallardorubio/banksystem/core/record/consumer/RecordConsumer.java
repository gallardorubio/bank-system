package io.github.gallardorubio.banksystem.core.record.consumer;

import io.github.gallardorubio.banksystem.core.record.dto.ClientRegistered;
import io.github.gallardorubio.banksystem.core.record.service.BankAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RecordConsumer {

    private final BankAccountService bankAccountService;

    @KafkaListener(topics = "client-registered", groupId = "core-group")
    public void listenClientRegistered(ClientRegistered event) {
        bankAccountService.createClientAccount(event);
    }

}
