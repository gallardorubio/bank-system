package io.github.gallardorubio.banksystem.core.loan.dao;

import io.github.gallardorubio.banksystem.core.loan.entity.LoanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface LoanRepository extends JpaRepository<LoanEntity, UUID> {

    @Query("SELECT l FROM LoanEntity l WHERE l.status = 'COMPLETED' AND l.nextInstallmentDate <= :now")
    List<LoanEntity> findDueLoans(@Param("now") Instant now);

}
