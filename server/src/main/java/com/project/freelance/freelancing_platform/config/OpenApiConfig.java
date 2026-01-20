package com.project.freelance.freelancing_platform.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springdoc.core.models.GroupedOpenApi;

@OpenAPIDefinition(info = @Info(title = "Freelancing Platform API", version = "v1"))
@Configuration
public class OpenApiConfig {

    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("freelancing-platform")
                .pathsToMatch("/api/**")
                .build();
    }
}
