package io.github.gallardorubio.banksystem.core.client.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.github.gallardorubio.banksystem.core.client.dto.ClientPersonalUpdateRequest;
import io.github.gallardorubio.banksystem.core.client.dto.ClientRequest;
import io.github.gallardorubio.banksystem.core.client.dto.ClientResponse;
import io.github.gallardorubio.banksystem.core.client.dto.MfaSetupResponse;
import io.github.gallardorubio.banksystem.core.client.dto.MfaVerifyRequest;
import io.github.gallardorubio.banksystem.core.client.dto.SecurityAnswersRequest;
import io.github.gallardorubio.banksystem.core.client.dto.SecurityQuestion;
import io.github.gallardorubio.banksystem.core.client.dto.TrustedBankAccountResponse;
import io.github.gallardorubio.banksystem.core.client.service.ClientService;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;



@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/clients")
public class ClientController {

    private final ClientService clientService;

    @PostMapping
    public ResponseEntity<Void> createClient(@Valid @RequestBody ClientRequest clientRequest) {
        clientService.createClient(clientRequest);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/security-questions")
    public ResponseEntity<List<SecurityQuestion>> getSecurityQuestions(
        @AuthenticationPrincipal Jwt jwt
    ) {
        List<SecurityQuestion> questions = clientService.getAllSecurityQuestions(UUID.fromString(jwt.getSubject()));

        return ResponseEntity.ok(questions);
    }

    @PatchMapping("/unlock")
    public ResponseEntity<Void> unlockAccount(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody SecurityAnswersRequest securityAnswersRequest
    ) {
        clientService.verifyAndUnlockClient(UUID.fromString(jwt.getSubject()), securityAnswersRequest);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<ClientResponse> getClientPersonal(@AuthenticationPrincipal Jwt jwt) {
        ClientResponse clientResponse = clientService.getClientPersonal(UUID.fromString(jwt.getSubject()));

        return ResponseEntity.ok(clientResponse);
    }

    @PatchMapping("/me")
    public ResponseEntity<ClientResponse> updateClientPersonal(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ClientPersonalUpdateRequest clientPersonalUpdateRequest) {
        
        ClientResponse updatedClient = clientService.updateClientPersonal(
            UUID.fromString(jwt.getSubject()), 
            clientPersonalUpdateRequest
        );
        
        return ResponseEntity.ok(updatedClient);
    }

    @GetMapping("/me/trusted-accounts")
    public ResponseEntity<List<TrustedBankAccountResponse>> getTrustedBankAccounts(
        @AuthenticationPrincipal Jwt jwt
    ) {
        List<TrustedBankAccountResponse> trustedAccounts = clientService.getTrustedBankAccounts(
            UUID.fromString(jwt.getSubject())
        );
        return ResponseEntity.ok(trustedAccounts);
    }

    @PostMapping("/me/mfa/setup")
    public ResponseEntity<MfaSetupResponse> setupMfa(
        @AuthenticationPrincipal Jwt jwt
    ) {
        MfaSetupResponse setup = clientService.setupMfa(jwt.getTokenValue());
        return ResponseEntity.ok(setup);
    }

    @PostMapping("/me/mfa/enable")
    public ResponseEntity<Void> enableMfa(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody MfaVerifyRequest request
    ) {
        clientService.enableMfa(jwt.getTokenValue(), request.totpCode());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/me/mfa/disable")
    public ResponseEntity<Void> disableMfa(
        @AuthenticationPrincipal Jwt jwt
    ) {
        clientService.disableMfa(jwt.getTokenValue());
        return ResponseEntity.ok().build();
    }

}
