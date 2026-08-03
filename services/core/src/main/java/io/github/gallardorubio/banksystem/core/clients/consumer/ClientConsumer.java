package io.github.gallardorubio.banksystem.core.clients.consumer;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import io.github.gallardorubio.banksystem.core.clients.dto.ClientAccountBlockEvent;
import io.github.gallardorubio.banksystem.core.clients.service.ClientService;

@Component
@RequiredArgsConstructor
public class ClientConsumer {

    private final ClientService userService;

    @KafkaListener(topics = "client-account-blocked", groupId = "users-group")
    public void listenClientAccountBlocked(ClientAccountBlockEvent clientAccountBlockedEvent) {
        userService.resolveClientAccountBlocked(clientAccountBlockedEvent);
    }

}
