package io.github.gallardorubio.banksystem.core.fraud.consumer;

import io.github.gallardorubio.banksystem.core.fraud.dto.FraudDetectedEvent;
import io.github.gallardorubio.banksystem.core.fraud.service.FraudService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FraudConsumer {

    private final FraudService fraudService;

    @KafkaListener(topics = "fraud-detected", groupId = "core-group")
    public void listenFraudDetected(FraudDetectedEvent event) {
        fraudService.registerFraud(event);
    }
    
}