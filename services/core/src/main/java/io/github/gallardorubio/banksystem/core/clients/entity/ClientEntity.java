package io.github.gallardorubio.banksystem.core.clients.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import io.github.gallardorubio.banksystem.core.clients.dto.ClientPersonalUpdateRequest;
import io.github.gallardorubio.banksystem.core.clients.dto.ClientRequest;
import io.github.gallardorubio.banksystem.core.clients.dto.SecurityQuestion;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@AllArgsConstructor
@Setter
@Builder
@Entity
@Table(name = "client", schema = "core")
public class ClientEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phone")
    private String phone;

    @Column(name = "address")
    private String address;

    @Column(name = "nationality")
    private String nationality;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "tax_id", nullable = false, unique = true)
    private String taxId;

    @Column(name = "bank_account_id", nullable = true, unique = true)
    private UUID bankAccountId;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    private ClientAccountStatus accountStatus;

    @Column(name = "trusted_bank_accounts_id", nullable = true)
    @Builder.Default
    private List<UUID> trustedBankAccountsId = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "security_questions", nullable = false)
    @Builder.Default
    private List<SecurityQuestion> securityQuestions = new ArrayList<>();

    public static ClientEntity fromDto(UUID clientId, ClientRequest clientRequest) {
        return ClientEntity.builder()
                .id(clientId)
                .name(clientRequest.name())
                .phone(clientRequest.phone())
                .address(clientRequest.address())
                .nationality(clientRequest.nationality())
                .birthDate(clientRequest.birthDate())
                .email(clientRequest.email())
                .taxId(clientRequest.taxId())
                .accountStatus(ClientAccountStatus.ACTIVE)
                .securityQuestions(clientRequest.securityQuestions())
                .build();
    }

    public void updateClientPersonalData(ClientPersonalUpdateRequest dto) {
        if (dto.name() != null && !dto.name().isBlank()) {
            this.name = dto.name();
        }
        if (dto.phone() != null && !dto.phone().isBlank()) {
            this.phone = dto.phone();
        }
        if (dto.address() != null && !dto.address().isBlank()) {
            this.address = dto.address();
        }
        if (dto.nationality() != null && !dto.nationality().isBlank()) {
            this.nationality = dto.nationality();
        }
        if (dto.birthDate() != null) {
            this.birthDate = dto.birthDate();
        }
        if (dto.email() != null && !dto.email().isBlank()) {
            this.email = dto.email();
        }
    }

    public void addTrustedBankAccount(UUID bankAccountId) {
    if (this.trustedBankAccountsId == null) {
        this.trustedBankAccountsId = new ArrayList<>();
    }
    if (!this.trustedBankAccountsId.contains(bankAccountId)) {
        this.trustedBankAccountsId.add(bankAccountId);
    }
}

}
