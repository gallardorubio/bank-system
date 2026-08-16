package io.github.gallardorubio.banksystem.core.loan.controller;

import io.github.gallardorubio.banksystem.core.loan.dto.LoanRequest;
import io.github.gallardorubio.banksystem.core.loan.dto.LoanResolutionRequest;
import io.github.gallardorubio.banksystem.core.loan.dto.LoanResponse;
import io.github.gallardorubio.banksystem.core.loan.service.LoanService;
import io.github.gallardorubio.banksystem.core.operation.dto.OperationRequestOrigin;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/loans")
public class LoanController {
    
    private final LoanService loanService;

    @GetMapping("/{id}")
    public ResponseEntity<LoanResponse> getLoan(
        @PathVariable("id") UUID loanId,
        @AuthenticationPrincipal Jwt jwt
    ) {
        LoanResponse loanResponse = loanService.getLoan(loanId, UUID.fromString(jwt.getSubject()));

        return ResponseEntity.ok(loanResponse);
    }

    @GetMapping
    public ResponseEntity<List<LoanResponse>> getAllLoans(@AuthenticationPrincipal Jwt jwt) {
        List<LoanResponse> loans = loanService.getAllLoans(UUID.fromString(jwt.getSubject()));

        return ResponseEntity.ok(loans);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LoanResponse createLoan(
        @Valid @RequestBody LoanRequest loanRequest,
        @AuthenticationPrincipal Jwt jwt,
        HttpServletRequest request
    ) {
        OperationRequestOrigin origin = OperationRequestOrigin.fromRequestAndJwt(request, jwt);
        LoanResponse loanResponse = loanService.initiatePendingLoan(
            loanRequest, 
            UUID.fromString(jwt.getSubject()),
            origin
        );

        return loanResponse;
    }

    @PreAuthorize("hasRole(@environment.getProperty('COGNITO_OPERATOR_ROLE'))")
    @PatchMapping("/{id}")
    public ResponseEntity<LoanResponse> resolveLoan(
        @PathVariable("id") UUID loanId,
        @Valid @RequestBody LoanResolutionRequest resolutionRequest
    )
    {
        LoanResponse loanResponse = loanService.resolveLoan(
            loanId, 
            resolutionRequest.action(), 
            resolutionRequest.reason()
        );

        return ResponseEntity.ok(loanResponse);        
    }

    @PreAuthorize("hasRole(@environment.getProperty('COGNITO_OPERATOR_ROLE'))")
    @GetMapping("/escalated")
    public ResponseEntity<List<LoanResponse>> getEscalatedLoans() {
        List<LoanResponse> loans = loanService.getEscalatedLoans();
        
        return ResponseEntity.ok(loans);
    }

}
