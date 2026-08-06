package io.github.gallardorubio.banksystem.core.record.entity;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.UUID;

import jakarta.persistence.*;

import lombok.*;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Getter
@Entity
@Table(name = "account")
public class BankAccountEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "account_id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "client_id", nullable = false, updatable = false)
    private UUID clientId;

    @Column(name = "client_name", nullable = false, updatable = false)
    private String clientName;

    @Column(name = "currency", nullable = false, length = 3, updatable = false)
    @Builder.Default
    private String currency = "EUR";

    @Column(name = "balance", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    public static final UUID VAULT_ACCOUNT_ID = UUID.fromString("00000000-0000-0000-0000-000000000000");

    public static BankAccountEntity createForClient(UUID clientId, String clientName) {
        return BankAccountEntity.builder()
                .clientId(clientId)
                .clientName(clientName)
                .build();
    }

    public void deposit(BigDecimal amount) {
        this.balance = this.balance.add(amount);
    }

    public void withdraw(BigDecimal amount) {
        if (!this.id.equals(VAULT_ACCOUNT_ID) && this.balance.compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient funds in bank account: " + this.id);
        }
        
        this.balance = this.balance.subtract(amount);
    }
}