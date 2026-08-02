package io.github.gallardorubio.banksystem.core.record.controller;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.gallardorubio.banksystem.core.record.dto.BankAccountAnalyticsResponse;
import io.github.gallardorubio.banksystem.core.record.dto.BankAccountEntryResponse;
import io.github.gallardorubio.banksystem.core.record.service.BankAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/bank-accounts")
public class BankAccountController {

    private final BankAccountService bankAccountService;

    @GetMapping("/me/entries")
    public ResponseEntity<Page<BankAccountEntryResponse>> getEntries(
        @AuthenticationPrincipal Jwt jwt,
        @RequestParam(required = false) String concept,
        @RequestParam(value = "target_client_name", required = false) String targetClientName,
        @RequestParam(value = "created_at", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdAt,
        @RequestParam(value = "target_bank_account_id", required = false) UUID targetBankAccountId,
        @RequestParam(required = false) BigDecimal amount,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<BankAccountEntryResponse> entries = bankAccountService.getAllBankAccountEntriesFiltered(
            UUID.fromString(jwt.getSubject()), concept, targetClientName, createdAt, targetBankAccountId, amount, pageable
        );

        return ResponseEntity.ok(entries);
    }

    @GetMapping("/me/balance")
    public ResponseEntity<BigDecimal> getBalance(
        @AuthenticationPrincipal Jwt jwt
    ) {
        BigDecimal balance = bankAccountService.getBankAccountBalance(UUID.fromString(jwt.getSubject()));
        return ResponseEntity.ok(balance);
    }

    @GetMapping("/analytics")
    public ResponseEntity<BankAccountAnalyticsResponse> getAnalytics(
        @AuthenticationPrincipal Jwt jwt
    ) {
        List<String> groups = jwt.getClaimAsStringList("cognito:groups");
        if(groups == null || !groups.contains("operator")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
  
        BankAccountAnalyticsResponse analytics = bankAccountService.getBankAnalytics();

        return ResponseEntity.ok(analytics);
    }

}