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
import io.github.gallardorubio.banksystem.core.client.dto.SecurityQuestionAnswersRequest;
import io.github.gallardorubio.banksystem.core.client.dto.SecurityQuestionResponse;
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
    @ResponseStatus(HttpStatus.CREATED)
    public void createClient(@Valid @RequestBody ClientRequest clientRequest) {
        clientService.createClient(clientRequest);
    }

    @GetMapping("/security-questions")
    public ResponseEntity<List<SecurityQuestionResponse>> getSecurityQuestionsCatalog() {
        return ResponseEntity.ok(clientService.getAllSecurityQuestions());
    }

    @GetMapping("/me/security-questions")
    public ResponseEntity<List<SecurityQuestionResponse>> getMySecurityQuestions(
        @AuthenticationPrincipal Jwt jwt
    ) {
        List<SecurityQuestionResponse> questions = clientService.getMySecurityQuestions(UUID.fromString(jwt.getSubject()));
        return ResponseEntity.ok(questions);
    }

    @PatchMapping("/unlock")
    public ResponseEntity<Void> unlockAccount(
        @AuthenticationPrincipal Jwt jwt,
        @Valid @RequestBody SecurityQuestionAnswersRequest securityAnswersRequest
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

    @DeleteMapping("/me/trusted-accounts/{id}")
    public ResponseEntity<Void> removeTrustedBankAccount(
        @AuthenticationPrincipal Jwt jwt,
        @PathVariable("id") UUID bankAccountId
    ) {
        clientService.removeTrustedBankAccount(UUID.fromString(jwt.getSubject()), bankAccountId);
        return ResponseEntity.ok().build();
    }

}
