package io.github.gallardorubio.banksystem.core.fraud.controller;

import io.github.gallardorubio.banksystem.core.fraud.entity.FraudEntity;
import io.github.gallardorubio.banksystem.core.fraud.service.FraudService;
import lombok.RequiredArgsConstructor;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/fraud")
@RequiredArgsConstructor
public class FraudController {

    private final FraudService fraudService;

    @PreAuthorize("hasRole(@environment.getProperty('COGNITO_OPERATOR_ROLE'))")
    @GetMapping
    public ResponseEntity<Page<FraudEntity>> getFraudRecords(
        @ParameterObject @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<FraudEntity> records = fraudService.getAllFraudRecords(pageable);

        return ResponseEntity.ok(records);
    }
    
}