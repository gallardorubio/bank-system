package io.github.gallardorubio.banksystem.core.transfer.controller;

import io.github.gallardorubio.banksystem.core.operation.entity.RequestOrigin;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferRequest;
import io.github.gallardorubio.banksystem.core.transfer.dto.TransferResponse;
import io.github.gallardorubio.banksystem.core.transfer.service.TransferService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/transfers")
public class TransferController {

    private final TransferService transferService;

    @GetMapping("/{id}")
    public ResponseEntity<TransferResponse> getTransfer(
        @PathVariable("id") UUID transferId,
        @AuthenticationPrincipal Jwt jwt
    ) {
        TransferResponse transferResponse = transferService.getTransfer(transferId, UUID.fromString(jwt.getSubject()));

        return ResponseEntity.ok(transferResponse);
    }

    @GetMapping
    public ResponseEntity<List<TransferResponse>> getAllTransfers(@AuthenticationPrincipal Jwt jwt) {
        List<TransferResponse> transfers = transferService.getAllTransfers(UUID.fromString(jwt.getSubject()));

        return ResponseEntity.ok(transfers);
    }

    @PostMapping
    public ResponseEntity<TransferResponse> createTransfer(
        @Valid @RequestBody TransferRequest transferRequest,
        @AuthenticationPrincipal Jwt jwt,
        HttpServletRequest request
    ) {
        RequestOrigin origin = RequestOrigin.fromRequestAndJwt(request, jwt);
        TransferResponse transferResponse = transferService.initiatePendingTransfer(
            transferRequest, 
            UUID.fromString(jwt.getSubject()),
            origin
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(transferResponse);
    }
    
}