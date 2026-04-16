package io.github.gallardorubio.banksystem.core.loan.controller;

import io.github.gallardorubio.banksystem.core.loan.dto.LoanRequest;
import io.github.gallardorubio.banksystem.core.loan.dto.LoanResolutionRequest;
import io.github.gallardorubio.banksystem.core.loan.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/loans")
public class LoanController {
    
    private final LoanService loanService;

    @PostMapping
    public ResponseEntity<UUID> createLoan(@Valid @RequestBody LoanRequest loanRequest) {
        UUID loanId = loanService.initiatePendingLoan(loanRequest);

        return ResponseEntity.status(202).body(loanId);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Void> approveLoan(@PathVariable("id") UUID loanId) {
        loanService.processApprovedLoan(loanId);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/deny")
    public ResponseEntity<Void> denyLoan(@PathVariable("id") UUID loanId, 
                                     @Valid @RequestBody LoanResolutionRequest loanResolutionRequest) {
        loanService.processDeniedLoan(loanId, loanResolutionRequest.reason());

        return ResponseEntity.noContent().build();
    }

}
