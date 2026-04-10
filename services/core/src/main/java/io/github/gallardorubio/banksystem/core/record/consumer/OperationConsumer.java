package io.github.gallardorubio.banksystem.core.record.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import io.github.gallardorubio.banksystem.core.record.dto.OperationApproved;
import io.github.gallardorubio.banksystem.core.record.producer.OperationProducer;
import io.github.gallardorubio.banksystem.core.record.service.RecordService;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OperationConsumer {

    private final RecordService recordService;
    private final OperationProducer operationProducer;

    @KafkaListener(topics = "operation-approved", groupId = "operation-approved-group")
    public void onOperationApproved(OperationApproved operationApproved) {
        try {
            recordService.processDoubleEntry(
                operationApproved.operationId(),
                operationApproved.debitAccountId(),
                operationApproved.creditAccountId(),
                operationApproved.amount(),
                operationApproved.operationType()
            );

            operationProducer.sendOperationCompleted(operationApproved.operationId());
        } catch (Exception e) {
            operationProducer.sendOperationRejected(operationApproved.operationId());
        }
    }
    
}
