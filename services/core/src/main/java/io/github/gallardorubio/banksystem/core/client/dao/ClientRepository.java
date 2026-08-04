package io.github.gallardorubio.banksystem.core.client.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import io.github.gallardorubio.banksystem.core.client.entity.ClientEntity;

import java.util.Optional;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<ClientEntity, UUID> {

    Optional<ClientEntity> findById(UUID id);

}