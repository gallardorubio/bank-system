package io.github.gallardorubio.banksystem.core.operation.producer;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import io.github.gallardorubio.banksystem.core.operation.dto.OperationPendingEvent;
import io.github.springwolf.bindings.kafka.annotations.KafkaAsyncOperationBinding;
import io.github.springwolf.core.asyncapi.annotations.AsyncOperation;
import io.github.springwolf.core.asyncapi.annotations.AsyncPublisher;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OperationProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @AsyncPublisher(
        operation = @AsyncOperation(
            channelName = "operation-pending",
            payloadType = OperationPendingEvent.class,
            headers = @AsyncOperation.Headers(
                schemaName = "SpringKafkaDefaultHeaders-OperationPendingEvent",
                values = {
                    @AsyncOperation.Headers.Header(
                        name = "__TypeId__",
                        value = "OperationPendingEvent"
                    )
                }
            )
        )
    )
    @KafkaAsyncOperationBinding
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void sendOperationPending(OperationPendingEvent<?> operationPending) {
        kafkaTemplate.send("operation-pending", operationPending);
    }
    
}
