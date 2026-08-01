package io.github.gallardorubio.banksystem.core.operation.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.gallardorubio.banksystem.core.operation.dto.OperationResponse;
import io.github.gallardorubio.banksystem.core.operation.service.OperationService;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/operations")
public class OperationController {

    private final OperationService operationService;

    @GetMapping("/{id}")
    public ResponseEntity<OperationResponse> getOperation(
        @PathVariable("id") String operationId,
        @AuthenticationPrincipal Jwt jwt
    ) {
        OperationResponse response = operationService.getOperation(operationId, UUID.fromString(jwt.getSubject()));
        
        return ResponseEntity.ok(response);
    }

}
