package io.github.gallardorubio.banksystem.core.operation.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.gallardorubio.banksystem.core.operation.dto.OperationEntryResponse;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationResponse;
import io.github.gallardorubio.banksystem.core.operation.service.OperationService;
import io.swagger.v3.oas.annotations.Hidden;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springdoc.core.converters.models.PageableAsQueryParam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestParam;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/operations")
public class OperationController {

    private final OperationService operationService;

    @GetMapping("/{id}")
    public ResponseEntity<OperationResponse> getOperation(
        @PathVariable("id") UUID operationId,
        @AuthenticationPrincipal Jwt jwt
    ) {
        OperationResponse response = operationService.getOperation(operationId, UUID.fromString(jwt.getSubject()));
        
        return ResponseEntity.ok(response);
    }

    @GetMapping(value ="/{id}/statement", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getOperationStatement(
        @PathVariable("id") UUID operationId,
        @AuthenticationPrincipal Jwt jwt
    ) {
        byte[] pdfBytes = operationService.getOperationStatement(operationId, UUID.fromString(jwt.getSubject()));
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=operation-" + operationId + ".pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdfBytes);
    }

    @PageableAsQueryParam
    @GetMapping("/me")
    public ResponseEntity<Page<OperationEntryResponse>> getMyOperations(
        @AuthenticationPrincipal Jwt jwt,
        @RequestParam(required = false) String concept,
        @RequestParam(value = "target_client_name", required = false) String targetClientName,
        @RequestParam(value = "created_at", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdAt,
        @RequestParam(value = "target_bank_account_id", required = false) UUID targetBankAccountId,
        @RequestParam(required = false) BigDecimal amount,
        @Parameter(hidden = true) @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<OperationEntryResponse> operations = operationService.getAllOperationsFiltered(
            UUID.fromString(jwt.getSubject()), concept, targetClientName, createdAt, targetBankAccountId, amount, pageable
        );

        return ResponseEntity.ok(operations);
    }

    @Hidden
    @PreAuthorize("hasAuthority('SCOPE_' + @environment.getProperty('COGNITO_AGENTIC_SCOPE'))")
    @GetMapping("/clients/{clientId}")
    public ResponseEntity<List<OperationResponse>> getAllClientOperations(@PathVariable("clientId") UUID clientId) {
        List<OperationResponse> operations = operationService.getAllClientOperations(clientId);

        return ResponseEntity.ok(operations);
    }    

}
