package io.github.gallardorubio.banksystem.core.operation.dto;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositResponse;
import io.github.gallardorubio.banksystem.core.installment.dto.InstallmentResponse;
import io.github.gallardorubio.banksystem.core.loan.dto.LoanResponse;
import io.github.gallardorubio.banksystem.core.operation.entity.OperationType;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferResponse;

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "operationType",
    visible = true
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = DepositResponse.class, name = "DEPOSIT"),
    @JsonSubTypes.Type(value = LoanResponse.class, name = "LOAN"),
    @JsonSubTypes.Type(value = TransferResponse.class, name = "TRANSFER"),
    @JsonSubTypes.Type(value = InstallmentResponse.class, name = "INSTALLMENT")
})
public interface OperationResponse {
    OperationType operationType();
    Instant createdAt();
}