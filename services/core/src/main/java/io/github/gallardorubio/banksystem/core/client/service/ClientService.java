package io.github.gallardorubio.banksystem.core.client.service;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import java.util.List;
import java.util.UUID;

import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.gallardorubio.banksystem.core.client.dao.ClientRepository;
import io.github.gallardorubio.banksystem.core.client.dto.ClientAccountBlockEvent;
import io.github.gallardorubio.banksystem.core.client.dto.ClientPersonalUpdateRequest;
import io.github.gallardorubio.banksystem.core.client.dto.ClientRequest;
import io.github.gallardorubio.banksystem.core.client.dto.ClientResponse;
import io.github.gallardorubio.banksystem.core.client.dto.MfaSetupResponse;
import io.github.gallardorubio.banksystem.core.client.dto.SecurityAnswersRequest;
import io.github.gallardorubio.banksystem.core.client.dto.SecurityQuestion;
import io.github.gallardorubio.banksystem.core.client.dto.TrustedBankAccountResponse;
import io.github.gallardorubio.banksystem.core.client.entity.ClientAccountStatus;
import io.github.gallardorubio.banksystem.core.client.entity.ClientEntity;
import io.github.gallardorubio.banksystem.core.record.entity.BankAccountEntity;
import io.github.gallardorubio.banksystem.core.record.service.BankAccountService;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final BankAccountService bankAccountService;
    private final CognitoIdentityProviderClient cognitoClient;

    @Value("#{'${spring.security.oauth2.resourceserver.jwt.issuer-uri}'.substring('${spring.security.oauth2.resourceserver.jwt.issuer-uri}'.lastIndexOf('/') + 1)}")
    private String userPoolId;

    @Transactional
    public void createClient(ClientRequest clientRequest) {
        AdminCreateUserRequest cognitoRequest = AdminCreateUserRequest.builder()
                .userPoolId(userPoolId)
                .username(clientRequest.email())
                .userAttributes(
                        AttributeType.builder().name("email").value(clientRequest.email()).build(),
                        AttributeType.builder().name("email_verified").value("true").build()
                )
                .messageAction(MessageActionType.SUPPRESS)
                .build();

        AdminCreateUserResponse cognitoResponse = cognitoClient.adminCreateUser(cognitoRequest);

        String cognitoSub = cognitoResponse.user().attributes().stream()
                .filter(a -> a.name().equals("sub"))
                .findFirst()
                .map(AttributeType::value)
                .orElseThrow(() -> new IllegalStateException("Cognito SUB not generated"));

        AdminSetUserPasswordRequest setPasswordRequest = AdminSetUserPasswordRequest.builder()
            .userPoolId(userPoolId)
            .username(clientRequest.email())
            .password(clientRequest.password())
            .permanent(true)
            .build();

        cognitoClient.adminSetUserPassword(setPasswordRequest);

        UUID clientId = UUID.fromString(cognitoSub);

        AdminAddUserToGroupRequest groupRequest = AdminAddUserToGroupRequest.builder()
                .userPoolId(userPoolId)
                .username(clientRequest.email())
                .groupName("client")
                .build();

        cognitoClient.adminAddUserToGroup(groupRequest);

        ClientEntity clientEntity = ClientEntity.fromDto(clientId, clientRequest);

        BankAccountEntity bankAccountEntity = bankAccountService.createClientAccount(clientId, clientEntity.getName());

        clientEntity.setBankAccountId(bankAccountEntity.getId());

        clientRepository.save(clientEntity);
    }

    @Transactional
    public void resolveClientAccountBlocked(ClientAccountBlockEvent clientAccountBlockEvent) {
        ClientEntity clientEntity = clientRepository.findById(clientAccountBlockEvent.clientId())
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientAccountBlockEvent.clientId()));

        clientEntity.setAccountStatus(ClientAccountStatus.BLOCKED);
    }

    public List<SecurityQuestion> getAllSecurityQuestions(UUID clientId) {
        ClientEntity clientEntity = clientRepository.findById(clientId)
            .orElseThrow(() -> new RuntimeException("Client not found: " + clientId));

        return clientEntity.getSecurityQuestions();
    }

    @Transactional
    public void verifyAndUnlockClient(UUID clientId, SecurityAnswersRequest securityAnswersRequest) {
        ClientEntity clientEntity = clientRepository.findById(clientId)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientId));

        List<SecurityQuestion> savedQuestions = clientEntity.getSecurityQuestions();

        if (securityAnswersRequest.answers().size() != savedQuestions.size()) {
            throw new IllegalArgumentException("Invalid number of answers");
        }

        for (var userAns : securityAnswersRequest.answers()) {
            boolean matches = savedQuestions.stream().anyMatch(saved -> 
                saved.id().equals(userAns.questionId()) &&
                saved.answer().trim().equalsIgnoreCase(userAns.answer().trim())
            );

            if (!matches) {
                throw new SecurityException("Incorrect security answers");
            }
        }

        clientEntity.setAccountStatus(ClientAccountStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public ClientResponse getClientPersonal(UUID clientId) {
        ClientEntity clientEntity = clientRepository.findById(clientId)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientId));

        boolean mfaActive = isMfaEnabled(clientEntity.getEmail());
        return new ClientResponse(clientEntity, mfaActive);
    }

    @Transactional
    public ClientResponse updateClientPersonal(UUID clientId, ClientPersonalUpdateRequest clientPersonalUpdateRequest) {
        ClientEntity clientEntity = clientRepository.findById(clientId)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientId));

        boolean matchesSecurityAnswer = clientEntity.getSecurityQuestions().stream().anyMatch(saved ->
            saved.id().equals(clientPersonalUpdateRequest.questionId()) &&
            saved.answer().trim().equalsIgnoreCase(clientPersonalUpdateRequest.answer().trim())
        );

        if (!matchesSecurityAnswer) {
            throw new SecurityException("Incorrect security answer");
        }

        clientEntity.updateClientPersonalData(clientPersonalUpdateRequest);

        boolean mfaActive = isMfaEnabled(clientEntity.getEmail());

        return new ClientResponse(clientEntity, mfaActive);
    }

    public boolean isMfaEnabled(String email) {
        AdminGetUserRequest request = AdminGetUserRequest.builder()
                .userPoolId(userPoolId)
                .username(email)
                .build();

        AdminGetUserResponse response = cognitoClient.adminGetUser(request);
        
        return response.userMFASettingList() != null && 
            response.userMFASettingList().contains("SOFTWARE_TOKEN_MFA");
    }

    @Transactional
    public void addTrustedAccount(UUID clientId, UUID bankAccountId) {
        ClientEntity client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientId));
        
        client.addTrustedBankAccount(bankAccountId);
    }

    @Transactional(readOnly = true)
    public List<TrustedBankAccountResponse> getTrustedBankAccounts(UUID clientId) {
        ClientEntity clientEntity = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientId));

        List<UUID> trustedBankAccountIds = clientEntity.getTrustedBankAccountsId();
        if (trustedBankAccountIds == null || trustedBankAccountIds.isEmpty()) {
            return List.of();
        }

        return bankAccountService.getClientNamesByAccountIds(trustedBankAccountIds);
    }

    public MfaSetupResponse setupMfa(String accessToken) {
        AssociateSoftwareTokenRequest request = AssociateSoftwareTokenRequest.builder()
                .accessToken(accessToken)
                .build();

        AssociateSoftwareTokenResponse response = cognitoClient.associateSoftwareToken(request);
        return new MfaSetupResponse(response.secretCode());
    }

    public void enableMfa(String accessToken, String totpCode) {
        VerifySoftwareTokenRequest verifyRequest = VerifySoftwareTokenRequest.builder()
                .accessToken(accessToken)
                .userCode(totpCode)
                .build();

        VerifySoftwareTokenResponse verifyResponse = cognitoClient.verifySoftwareToken(verifyRequest);

        if (verifyResponse.status() != VerifySoftwareTokenResponseType.SUCCESS) {
            throw new IllegalArgumentException("Código TOTP inválido");
        }

        SetUserMfaPreferenceRequest preferenceRequest = SetUserMfaPreferenceRequest.builder()
                .accessToken(accessToken)
                .softwareTokenMfaSettings(SoftwareTokenMfaSettingsType.builder()
                        .enabled(true)
                        .preferredMfa(true)
                        .build())
                .build();

        cognitoClient.setUserMFAPreference(preferenceRequest);
    }

    public void disableMfa(String accessToken) {
        SetUserMfaPreferenceRequest preferenceRequest = SetUserMfaPreferenceRequest.builder()
                .accessToken(accessToken)
                .softwareTokenMfaSettings(SoftwareTokenMfaSettingsType.builder()
                        .enabled(false)
                        .preferredMfa(false)
                        .build())
                .build();

        cognitoClient.setUserMFAPreference(preferenceRequest);
    }    

}
