package io.github.gallardorubio.banksystem.users.service;

import io.github.gallardorubio.banksystem.users.dao.UserRepository;
import io.github.gallardorubio.banksystem.users.dto.UserRegistered;
import io.github.gallardorubio.banksystem.users.dto.UserRequest;
import io.github.gallardorubio.banksystem.users.entity.SecurityQuestion;
import io.github.gallardorubio.banksystem.users.entity.UserEntity;
import lombok.RequiredArgsConstructor;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher applicationEventPublisher;

    @Transactional
    public UUID initiateUserRegistration(UserRequest userRequest) {
        List<SecurityQuestion> hashedQuestions = userRequest.securityQuestions().stream()
            .map(sq -> new SecurityQuestion(
                sq.question(),
                passwordEncoder.encode(sq.answer())
            ))
            .toList();

        UserEntity userEntity = new UserEntity(
            userRequest.name(),
            userRequest.email(),
            passwordEncoder.encode(userRequest.password()),
            userRequest.role(),
            userRequest.taxId(),
            userRequest.phone(),
            userRequest.address(),
            userRequest.nationality(),
            userRequest.birthDate(),
            userRequest.birthPlace(),
            hashedQuestions
        );

        userRepository.save(userEntity);

        UserRegistered userRegistered = new UserRegistered(
            userEntity.getId()
        );

        applicationEventPublisher.publishEvent(userRegistered);

        return userEntity.getId();
    }

}