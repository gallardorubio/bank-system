package io.github.gallardorubio.banksystem.core.deposit.controller;

import io.github.gallardorubio.banksystem.core.deposit.dto.DepositRequest;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositResolutionRequest;
import io.github.gallardorubio.banksystem.core.deposit.service.DepositService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/deposits")
public class DepositController {
    
    private final DepositService depositService;

    @PostMapping
    public ResponseEntity<UUID> createDeposit(@Valid @RequestBody DepositRequest depositRequest) {
        UUID depositId = depositService.initiatePendingDeposit(depositRequest);

        return ResponseEntity.status(202).body(depositId);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Void> approveDeposit(@PathVariable("id") UUID depositId) {
        depositService.processApprovedDeposit(depositId);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/deny")
    public ResponseEntity<Void> denyDeposit(@PathVariable("id") UUID depositId, 
                                     @Valid @RequestBody DepositResolutionRequest depositResolutionRequest) {
        depositService.processDeniedDeposit(depositId, depositResolutionRequest.reason());

        return ResponseEntity.noContent().build();
    }

}
