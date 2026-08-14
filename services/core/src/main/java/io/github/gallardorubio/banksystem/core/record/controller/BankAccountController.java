package io.github.gallardorubio.banksystem.core.record.controller;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import org.springdoc.core.converters.models.PageableAsQueryParam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.gallardorubio.banksystem.core.record.dto.BankAccountAnalyticsResponse;
import io.github.gallardorubio.banksystem.core.record.dto.BankAccountEntryResponse;
import io.github.gallardorubio.banksystem.core.record.dto.BankAccountResponse;
import io.github.gallardorubio.banksystem.core.record.service.BankAccountService;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/bank-accounts")
public class BankAccountController {

    private final BankAccountService bankAccountService;

    @GetMapping("/me")
    public ResponseEntity<BankAccountResponse> getMyBankAccount(
        @AuthenticationPrincipal Jwt jwt
    ) {
        BankAccountResponse account = bankAccountService.getBankAccountByClientId(UUID.fromString(jwt.getSubject()));
        
        return ResponseEntity.ok(account);
    }
    

    @PageableAsQueryParam
    @GetMapping("/me/entries")
    public ResponseEntity<Page<BankAccountEntryResponse>> getEntries(
        @AuthenticationPrincipal Jwt jwt,
        @RequestParam(required = false) String concept,
        @RequestParam(value = "target_client_name", required = false) String targetClientName,
        @RequestParam(value = "created_at", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdAt,
        @RequestParam(value = "target_bank_account_id", required = false) UUID targetBankAccountId,
        @RequestParam(required = false) BigDecimal amount,
        @Parameter(hidden = true) @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<BankAccountEntryResponse> entries = bankAccountService.getAllBankAccountEntriesFiltered(
            UUID.fromString(jwt.getSubject()), concept, targetClientName, createdAt, targetBankAccountId, amount, pageable
        );

        return ResponseEntity.ok(entries);
    }

    @PreAuthorize("hasRole('operator')")
    @GetMapping("/analytics")
    public ResponseEntity<BankAccountAnalyticsResponse> getAnalytics() {
        BankAccountAnalyticsResponse analytics = bankAccountService.getBankAnalytics();

        return ResponseEntity.ok(analytics);
    }

    @GetMapping(value = "/me/statement", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getMyBankAccountStatement(
        @AuthenticationPrincipal Jwt jwt,
        @RequestParam(value = "start_date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
        @RequestParam(value = "end_date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate
    ) {
        UUID bankAccountId = bankAccountService.getAccountIdByClientId(UUID.fromString(jwt.getSubject()));
        byte[] pdfBytes = bankAccountService.getBankAccountStatement(bankAccountId, startDate, endDate);

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=bank-account-statement-" + bankAccountId + ".pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdfBytes);
    }

    @PreAuthorize("hasRole('operator')")
    @GetMapping(value = "/{id}/statement", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getBankAccountStatement(
        @PathVariable("id") UUID bankAccountId,
        @RequestParam(value = "start_date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
        @RequestParam(value = "end_date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate
    ) {
        byte[] pdfBytes = bankAccountService.getBankAccountStatement(bankAccountId, startDate, endDate);

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=bank-account-statement-" + bankAccountId + ".pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdfBytes);
    }

}