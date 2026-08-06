package io.github.gallardorubio.banksystem.core.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.responses.ApiResponse;
import org.springdoc.core.customizers.GlobalOpenApiCustomizer;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Bank System Core API REST",
        version = "0.0.1",
        description = "Documentación de la API REST del Core Bancario"
    ),
    security = @SecurityRequirement(name = "BearerAuth")
)
@SecurityScheme(
    name = "BearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT",
    description = "Introduce tu token JWT"
)
public class OpenApiConfig {

    @Bean
    public GlobalOpenApiCustomizer globalResponseCustomizer() {
        return openApi -> {
            if (openApi.getPaths() != null) {
                openApi.getPaths().forEach((pathKey, pathItem) -> 
                    pathItem.readOperations().forEach(op -> {
                        var r = op.getResponses();

                        r.addApiResponse("401", new ApiResponse().description("Invalid JWT token"));
                        r.addApiResponse("403", new ApiResponse().description("Insufficient permissions or blocked client account"));
                        r.addApiResponse("500", new ApiResponse().description("Unhandled internal server error"));

                        boolean hasInputs = (op.getParameters() != null && !op.getParameters().isEmpty()) 
                                || op.getRequestBody() != null;
                        if (hasInputs) {
                            r.addApiResponse("400", new ApiResponse().description("Invalid input parameters or request body"));
                        }

                        if (pathKey.contains("{")) {
                            r.addApiResponse("404", new ApiResponse().description("Requested resource not found"));
                        }
                    })
                );
            }
        };
    }

}