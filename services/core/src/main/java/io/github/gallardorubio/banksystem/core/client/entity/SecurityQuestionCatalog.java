package io.github.gallardorubio.banksystem.core.client.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum SecurityQuestionCatalog {
    Q1(1, "¿Cuál es el nombre de tu primera mascota?"),
    Q2(2, "¿En qué ciudad nacieron tus padres?"),
    Q3(3, "¿Cuál es el nombre de tu colegio de la infancia?"),
    Q4(4, "¿Cuál es tu película favorita?"),
    Q5(5, "¿Cuál es el segundo apellido de tu madre?");

    private final int id;
    private final String question;

    public static SecurityQuestionCatalog fromId(int id) {
        for (SecurityQuestionCatalog q : values()) {
            if (q.id == id) return q;
        }
        throw new IllegalArgumentException("Invalid question ID: " + id);
    }
}