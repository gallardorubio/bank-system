package io.github.gallardorubio.banksystem.core.transfer.controller;

import io.github.gallardorubio.banksystem.core.transfer.dto.TransferRequest;
import io.github.gallardorubio.banksystem.core.transfer.service.TransferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/transfers")
public class TransferController {

    private final TransferService transferService;

    @PostMapping
    public ResponseEntity<UUID> createTransfer(@Valid @RequestBody TransferRequest transferRequest) {
        UUID transferId = transferService.initiatePendingTransfer(transferRequest);
        
        return ResponseEntity.status(202).body(transferId);
    }

}
