package io.github.gallardorubio.banksystem.core.clients.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import io.github.gallardorubio.banksystem.core.clients.entity.ClientEntity;

import java.util.Optional;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<ClientEntity, UUID> {

    Optional<ClientEntity> findById(UUID id);

}