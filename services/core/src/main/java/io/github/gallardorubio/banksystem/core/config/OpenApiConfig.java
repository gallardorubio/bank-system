package io.github.gallardorubio.banksystem.core.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import org.springdoc.core.customizers.GlobalOpenApiCustomizer;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.ProblemDetail;

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
            io.swagger.v3.core.converter.ModelConverters.getInstance()
                    .read(ProblemDetail.class)
                    .forEach((name, schema) -> openApi.getComponents().addSchemas(name, schema));

            Content problemContent = new Content().addMediaType(
                    "application/problem+json",
                    new MediaType().schema(new Schema<>().$ref("#/components/schemas/ProblemDetail"))
            );

            if (openApi.getPaths() != null) {
                openApi.getPaths().values().forEach(path -> 
                    path.readOperations().forEach(op -> {
                        var r = op.getResponses();
                        r.addApiResponse("400", new ApiResponse().description("Bad Request").content(problemContent));
                        r.addApiResponse("401", new ApiResponse().description("Unauthorized").content(problemContent));
                        r.addApiResponse("403", new ApiResponse().description("Forbidden").content(problemContent));
                        r.addApiResponse("404", new ApiResponse().description("Not Found").content(problemContent));
                        r.addApiResponse("500", new ApiResponse().description("Internal Server Error").content(problemContent));
                    })
                );
            }
        };
    }
    
}