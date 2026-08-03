package io.github.gallardorubio.banksystem.core.operation.producer;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import io.github.gallardorubio.banksystem.core.operation.dto.OperationPendingEvent;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OperationProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendOperationPending(OperationPendingEvent<?> operationPending) {
        kafkaTemplate.send("operation-pending", operationPending);
    }
    
}
