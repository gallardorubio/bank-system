package io.github.gallardorubio.banksystem.core.client.consumer;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import io.github.gallardorubio.banksystem.core.client.dto.ClientAccountBlockEvent;
import io.github.gallardorubio.banksystem.core.client.service.ClientService;

@Component
@RequiredArgsConstructor
public class ClientConsumer {

    private final ClientService clientService;

    @KafkaListener(topics = "client-blocked", groupId = "users-group")
    public void listenClientAccountBlocked(ClientAccountBlockEvent clientAccountBlockedEvent) {
        clientService.resolveClientAccountBlocked(clientAccountBlockedEvent);
    }

}
