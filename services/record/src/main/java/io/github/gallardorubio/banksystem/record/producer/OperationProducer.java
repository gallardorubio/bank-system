package io.github.gallardorubio.banksystem.record.producer;

import java.util.UUID;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import io.github.gallardorubio.banksystem.record.dto.OperationCompleted;
import io.github.gallardorubio.banksystem.record.dto.OperationRejected;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OperationProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;


    public void sendOperationCompleted(UUID operationId) {
        kafkaTemplate.send("operation-completed", new OperationCompleted(operationId));
    }

    public void sendOperationRejected(UUID operationId) {
        kafkaTemplate.send("operation-rejected", new OperationRejected(operationId));
    }
    
}
