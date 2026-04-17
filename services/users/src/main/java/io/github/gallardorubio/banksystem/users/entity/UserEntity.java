package io.github.gallardorubio.banksystem.users.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Entity
@Table(name = "users", schema = "identity")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountStatus status;

    @Column(name = "tax_id", nullable = false, unique = true)
    private String taxId;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String nationality;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "birth_place", nullable = false)
    private String birthPlace;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_security_questions", joinColumns = @JoinColumn(name = "user_id"))
    private List<SecurityQuestion> securityQuestions = new ArrayList<>();

    public UserEntity(String name, String email, String password, Role role, 
                      String taxId, String phone, String address, String nationality, 
                      LocalDate birthDate, String birthPlace, List<SecurityQuestion> securityQuestions) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.taxId = taxId;
        this.phone = phone;
        this.address = address;
        this.nationality = nationality;
        this.birthDate = birthDate;
        this.birthPlace = birthPlace;
        this.securityQuestions = securityQuestions;
        this.status = AccountStatus.ACTIVE;
    }

    public void blockAccount() {
        this.status = AccountStatus.BLOCKED;
    }

    public void unlockAccount() {
        this.status = AccountStatus.ACTIVE;
    }
}