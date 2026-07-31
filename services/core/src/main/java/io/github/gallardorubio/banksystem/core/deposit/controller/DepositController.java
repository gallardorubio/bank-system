package io.github.gallardorubio.banksystem.core.deposit.controller;

import io.github.gallardorubio.banksystem.core.deposit.dto.DepositRequest;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositResolutionRequest;
import io.github.gallardorubio.banksystem.core.deposit.dto.DepositResponse;
import io.github.gallardorubio.banksystem.core.deposit.service.DepositService;
import io.github.gallardorubio.banksystem.core.operation.entity.RequestOrigin;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/deposits")
public class DepositController {
    
    private final DepositService depositService;

    @GetMapping("/{id}")
    public ResponseEntity<DepositResponse> getDeposit(
        @PathVariable("id") UUID depositId,
        @AuthenticationPrincipal Jwt jwt
    ) {
        DepositResponse depositResponse = depositService.getDeposit(depositId, UUID.fromString(jwt.getSubject()));

        return ResponseEntity.ok(depositResponse);
    }

    @GetMapping
    pubic ResponseEntity<List<DepositResponse>> getAllDeposits(@AuthenticationPrincipal Jwt jwt) {
        List<DepositResponse> deposits = depositService.getAllDeposits(UUID.fromString(jwt.getSubject()));

        return ResponseEntity.ok(deposits);
    }

    @PostMappping
    public ResponseEntity<DepositResponse> createDeposit(
        @Valid @RequestBody DepositRequest depositRequest,
        @AuthenticationPrincipal Jwt jwt,
        HttpServletRequest request
    ) {
        RequestOrigin origin = RequestOrigin.fromRequestAndJwt(request, jwt);
        DepositResponse depositResponse = depositService.initiatePendingDeposit(
            depositRequest, 
            UUID.fromString(jwt.getSubject()),
            origin
        );
        return ResponseEntity.status(HTTPStatus.CREATED).body(depositResponse);
    }

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
