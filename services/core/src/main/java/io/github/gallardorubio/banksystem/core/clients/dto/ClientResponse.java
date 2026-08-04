package io.github.gallardorubio.banksystem.core.clients.dto;

import java.time.LocalDate;

import io.github.gallardorubio.banksystem.core.clients.entity.ClientEntity;

public record ClientResponse(
    String name,
    String phone,
    String address,
    String nationality,
    LocalDate birthDate,
    String email,
    String taxId,
    boolean mfaEnabled
) {
    public ClientResponse(ClientEntity entity, boolean mfaEnabled) {
        this(
            entity.getName(),
            entity.getPhone(),
            entity.getAddress(),
            entity.getNationality(),
            entity.getBirthDate(),
            entity.getEmail(),
            entity.getTaxId(),
            mfaEnabled
        );
    }
}