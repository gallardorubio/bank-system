package io.github.gallardorubio.banksystem.record.entity;

import java.util.UUID;

import io.github.gallardorubio.banksystem.record.dto.*;

import java.io.Serializable;
import java.math.BigDecimal;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.*;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Entity
@Table(name = "account")
public class AccountEntity implements Serializable, DTO<Account> {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "account_id", nullable = false, updatable = false)
    private UUID id;

    @NotNull
    @Column(name = "owner_id", nullable = false, updatable = false)
    private UUID ownerId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false, updatable = false)
    private AccountType type;

    @NotNull
    @Size(min = 3, max = 3)
    @Column(name = "currency", nullable = false, length = 3, updatable = false)
    private String currency;

    @NotNull
    @Column(name = "balance", nullable = false, precision = 19, scale = 4)
    private BigDecimal balance;

    public AccountEntity(UUID ownerId, AccountType type, String currency) {
        this.ownerId = ownerId;
        this.type = type;
        this.balance = BigDecimal.ZERO;
        this.currency = currency;
    }

    public void apply(BigDecimal amount, Side side) {
        if (this.type == AccountType.ASSET || this.type == AccountType.EXPENSE) {
            this.balance = (side == Side.DEBIT) 
                ? this.balance.add(amount) 
                : this.balance.subtract(amount);
        } else {
            this.balance = (side == Side.CREDIT) 
                ? this.balance.add(amount) 
                : this.balance.subtract(amount);
        }
    }

    @Override
    public Account toDto() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'toDto'");
    }
    
}
