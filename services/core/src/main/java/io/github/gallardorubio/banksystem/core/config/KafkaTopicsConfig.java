package io.github.gallardorubio.banksystem.core.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicsConfig {

    @Bean
    public NewTopic operationPendingTopic() {
        return TopicBuilder.name("operation-pending").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic fraudDetectedTopic() {
        return TopicBuilder.name("fraud-detected").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic operationApprovedTopic() {
        return TopicBuilder.name("operation-approved").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic operationDeniedTopic() {
        return TopicBuilder.name("operation-denied").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic operationEscalatedTopic() {
        return TopicBuilder.name("operation-escalated").partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic clientBlockedTopic() {
        return TopicBuilder.name("client-blocked").partitions(1).replicas(1).build();
    }
    
}