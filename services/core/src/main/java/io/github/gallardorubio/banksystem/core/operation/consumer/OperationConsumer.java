package io.github.gallardorubio.banksystem.core.operation.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import io.github.gallardorubio.banksystem.core.operation.dto.OperationApproved;
import io.github.gallardorubio.banksystem.core.operation.producer.OperationProducer;
import io.github.gallardorubio.banksystem.core.record.service.RecordService;
import io.github.gallardorubio.banksystem.core.transfer.service.TransferService;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OperationConsumer {
    
    private final TransferService transferService;

    @KafkaListener(topics = "operation-approved", groupId = "core-group")
    public void listenOperationApproved(OperationApproved operationApproved) {
        switch (operationApproved.operationType()) {
            case TRANSFER:
                transferService.processApprovedTransfer(operationApproved.operationId());
                break;
            default:
                throw new UnsupportedOperationException();
        }
    }

}
