package io.github.gallardorubio.banksystem.core.record.controller;

import io.github.gallardorubio.banksystem.core.record.dto.FinancialProfileResponse;
import io.github.gallardorubio.banksystem.core.record.service.AccountQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/v1/accounts")
public class AccountQueryController {

    private final AccountQueryService accountQueryService;

    @GetMapping("/{accountId}/financial-profile")
    public ResponseEntity<FinancialProfileResponse> getFinancialProfile(@PathVariable UUID accountId) {
        FinancialProfileResponse profile = accountQueryService.getFinancialProfile(accountId);
        return ResponseEntity.ok(profile);
    }
}