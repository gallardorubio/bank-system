package io.github.gallardorubio.banksystem.core.loan.dao;

import io.github.gallardorubio.banksystem.core.loan.entity.LoanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LoanRepository extends JpaRepository<LoanEntity, UUID> {

}
