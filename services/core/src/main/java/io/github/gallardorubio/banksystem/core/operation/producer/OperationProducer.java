package io.github.gallardorubio.banksystem.core.operation.producer;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import io.github.gallardorubio.banksystem.core.operation.dto.OperationPending;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OperationProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendOperationPending(OperationPending<?> operationPending) {
        kafkaTemplate.send("operation-pending", operationPending);
    }
    
}
