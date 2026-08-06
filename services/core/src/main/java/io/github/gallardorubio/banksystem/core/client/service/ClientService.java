package io.github.gallardorubio.banksystem.core.client.service;

import lombok.RequiredArgsConstructor;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.gallardorubio.banksystem.core.client.dao.ClientRepository;
import io.github.gallardorubio.banksystem.core.client.dto.ClientAccountBlockEvent;
import io.github.gallardorubio.banksystem.core.client.dto.ClientPersonalUpdateRequest;
import io.github.gallardorubio.banksystem.core.client.dto.ClientRequest;
import io.github.gallardorubio.banksystem.core.client.dto.ClientResponse;
import io.github.gallardorubio.banksystem.core.client.dto.MfaSetupResponse;
import io.github.gallardorubio.banksystem.core.client.dto.SecurityQuestionAnswersRequest;
import io.github.gallardorubio.banksystem.core.client.dto.SecurityQuestionResponse;
import io.github.gallardorubio.banksystem.core.client.dto.SecurityQuestionAnswer;
import io.github.gallardorubio.banksystem.core.client.dto.TrustedBankAccountResponse;
import io.github.gallardorubio.banksystem.core.client.entity.ClientAccountStatus;
import io.github.gallardorubio.banksystem.core.client.entity.ClientEntity;
import io.github.gallardorubio.banksystem.core.client.entity.SecurityQuestionCatalog;
import io.github.gallardorubio.banksystem.core.config.BusinessException;
import io.github.gallardorubio.banksystem.core.record.entity.BankAccountEntity;
import io.github.gallardorubio.banksystem.core.record.service.BankAccountService;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;
    private final BankAccountService bankAccountService;
    private final CognitoIdentityProviderClient cognitoClient;
    private final PasswordEncoder passwordEncoder;

    @Value("#{'${spring.security.oauth2.resourceserver.jwt.issuer-uri}'.substring('${spring.security.oauth2.resourceserver.jwt.issuer-uri}'.lastIndexOf('/') + 1)}")
    private String userPoolId;

    @Transactional
    public void createClient(ClientRequest clientRequest) {
        if (clientRepository.existsByEmail(clientRequest.email())) {
            throw new BusinessException("El correo electrónico no es válido");
        }
        if (clientRepository.existsByTaxId(clientRequest.taxId())) {
            throw new BusinessException("La identificación fiscal no es válida");
        }

        List<SecurityQuestionAnswer> hashedAnswers = clientRequest.securityQuestionAnswers().stream()
                .map(q -> {
                    SecurityQuestionCatalog.fromId(q.questionId());
                    return new SecurityQuestionAnswer(
                            q.questionId(),
                            passwordEncoder.encode(q.answer().trim().toLowerCase())
                    );
                })
                .toList();

        UUID clientId;

        try {
            AdminCreateUserRequest cognitoRequest = AdminCreateUserRequest.builder()
                    .userPoolId(userPoolId)
                    .username(clientRequest.email())
                    .userAttributes(
                            AttributeType.builder().name("email").value(clientRequest.email()).build(),
                            AttributeType.builder().name("email_verified").value("true").build()
                    )
                    .messageAction(MessageActionType.SUPPRESS)
                    .build();

            AdminCreateUserResponse createUserResponse = cognitoClient.adminCreateUser(cognitoRequest);

            String cognitoSub = createUserResponse.user().attributes().stream()
                    .filter(attr -> "sub".equals(attr.name()))
                    .findFirst()
                    .map(AttributeType::value)
                    .orElseThrow(() -> new IllegalStateException("No se pudo obtener el 'sub' de Cognito"));

            clientId = UUID.fromString(cognitoSub);

            AdminSetUserPasswordRequest setPasswordRequest = AdminSetUserPasswordRequest.builder()
                .userPoolId(userPoolId)
                .username(clientRequest.email())
                .password(clientRequest.password())
                .permanent(true)
                .build();
            cognitoClient.adminSetUserPassword(setPasswordRequest);

            AdminAddUserToGroupRequest groupRequest = AdminAddUserToGroupRequest.builder()
                    .userPoolId(userPoolId)
                    .username(clientRequest.email())
                    .groupName("client")
                    .build();
            cognitoClient.adminAddUserToGroup(groupRequest);

        } catch (UsernameExistsException e) {
            throw new BusinessException("El correo electrónico no es válido");
        } catch (Exception e) {
            throw new IllegalArgumentException("Error registering user in Cognito: " + e.getMessage());
        }

        try {
            ClientRequest secureRequest = new ClientRequest(
                    clientRequest.name(), clientRequest.phone(), clientRequest.address(),
                    clientRequest.nationality(), clientRequest.birthDate(), clientRequest.email(),
                    clientRequest.taxId(), hashedAnswers, clientRequest.password()
            );

            ClientEntity clientEntity = ClientEntity.fromDto(clientId, secureRequest);
            BankAccountEntity bankAccountEntity = bankAccountService.createClientAccount(clientId, clientEntity.getName());
            clientEntity.setBankAccountId(bankAccountEntity.getId());

            clientRepository.saveAndFlush(clientEntity);

        } catch (Exception e) {
            rollbackCognitoUser(clientRequest.email());
            throw e;
        }
    }

    private void rollbackCognitoUser(String email) {
        try {
            AdminDeleteUserRequest deleteRequest = AdminDeleteUserRequest.builder()
                    .userPoolId(userPoolId)
                    .username(email)
                    .build();
            cognitoClient.adminDeleteUser(deleteRequest);
        } catch (Exception ex) {
            System.err.println("Failed to rollback Cognito user creation for: " + email + " Error: " + ex.getMessage());
        }
    }

    @Transactional
    public void resolveClientAccountBlocked(ClientAccountBlockEvent clientAccountBlockEvent) {
        ClientEntity clientEntity = clientRepository.findById(clientAccountBlockEvent.clientId())
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientAccountBlockEvent.clientId()));

        clientEntity.setAccountStatus(ClientAccountStatus.BLOCKED);
    }

    public List<SecurityQuestionResponse> getAllSecurityQuestions() {
        return Arrays.stream(SecurityQuestionCatalog.values())
                .map(q -> new SecurityQuestionResponse(q.getId(), q.getQuestion()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SecurityQuestionResponse> getMySecurityQuestions(UUID clientId) {
        ClientEntity clientEntity = clientRepository.findById(clientId)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientId));

        return clientEntity.getSecurityQuestions().stream()
            .map(saved -> {
                SecurityQuestionCatalog catalogItem = SecurityQuestionCatalog.fromId(saved.questionId());
                return new SecurityQuestionResponse(catalogItem.getId(), catalogItem.getQuestion());
            })
            .toList();
    }

    @Transactional
    public void verifyAndUnlockClient(UUID clientId, SecurityQuestionAnswersRequest securityAnswersRequest) {
        ClientEntity clientEntity = clientRepository.findById(clientId)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientId));

        List<SecurityQuestionAnswer> savedQuestions = clientEntity.getSecurityQuestions();
        List<SecurityQuestionAnswersRequest.SecurityAnswer> providedAnswers = securityAnswersRequest.answers();

        if (providedAnswers.size() != savedQuestions.size()) {
            throw new BusinessException("Invalid number of answers");
        }

        for (var userAns : providedAnswers) {
            String rawUserAns = userAns.answer().trim().toLowerCase();
            
            boolean matches = savedQuestions.stream().anyMatch(saved -> 
                saved.questionId() == userAns.questionId() &&
                passwordEncoder.matches(rawUserAns, saved.answer())
            );

            if (!matches) {
                throw new BusinessException("Respuestas de seguridad incorrectas");
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

        String rawUserAns = clientPersonalUpdateRequest.answer().trim().toLowerCase();

        boolean matchesSecurityAnswer = clientEntity.getSecurityQuestions().stream().anyMatch(saved ->
            saved.questionId() == clientPersonalUpdateRequest.questionId() &&
            passwordEncoder.matches(rawUserAns, saved.answer())
        );

        if (!matchesSecurityAnswer) {
            throw new BusinessException("Respuestas de seguridad incorrectas");
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
            throw new BusinessException("Código TOTP inválido");
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
