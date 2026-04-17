package io.github.gallardorubio.banksystem.users.producer;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import io.github.gallardorubio.banksystem.users.dto.ClientRegistered;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class UserProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendClientRegistered(ClientRegistered clientRegistered) {
        kafkaTemplate.send("client-registered", clientRegistered);
    }

}
