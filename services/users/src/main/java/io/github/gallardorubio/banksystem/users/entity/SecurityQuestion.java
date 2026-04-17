package io.github.gallardorubio.banksystem.users.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Embeddable
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class SecurityQuestion {

    @Column(name = "question", nullable = false)
    private String question;

    @Column(name = "hashed_answer", nullable = false)
    private String hashedAnswer;
}