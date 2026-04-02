package io.github.gallardorubio.banksystem.record.controller;

import io.github.gallardorubio.banksystem.record.dto.AccountCreateRequest;
import io.github.gallardorubio.banksystem.record.dto.RecordOperationRequest;
import io.github.gallardorubio.banksystem.record.service.RecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/record")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService recordService;

    @PostMapping("/entry")
    public ResponseEntity<Void> createEntry(@Valid @RequestBody RecordOperationRequest request) {
        recordService.processDoubleEntry(
                request.operationId(),
                request.debitAccountId(),
                request.creditAccountId(),
                request.amount()
        );
        
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/account")
    public ResponseEntity<UUID> createAccount(@Valid @RequestBody AccountCreateRequest request) {
        UUID accountId = recordService.createAccount(request);
        return ResponseEntity.status(201).body(accountId);
    }

}