package io.github.gallardorubio.banksystem.core.record.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.gallardorubio.banksystem.core.record.dto.BankAccountEntryResponse;
import io.github.gallardorubio.banksystem.core.record.service.BankAccountService;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/bank-accounts")
public class BankAccountController {

    private final BankAccountService bankAccountService;

    @GetMapping("/entries")
    public ResponseEntity<Page<BankAccountEntryResponse>> getAllBankAccountEntries(
        @PathVariable("bank_account_id") UUID bankAccountId,
        @AuthenticationPrincipal Jwt jwt,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<BankAccountEntryResponse> entries = bankAccountService.getAllBankAccountEntries(UUID.fromString(jwt.getSubject()), pageable);

        return ResponseEntity.ok(entries);
    }
    
}
