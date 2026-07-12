package com.assetflow.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.assetflow.api")
@EnableJpaRepositories(basePackages = "com.assetflow.api.module")
@EntityScan(basePackages = "com.assetflow.api.module")
@EnableJpaAuditing(auditorAwareRef = "auditorAwareImpl")
@EnableCaching
@EnableAsync
@EnableScheduling
@ConfigurationPropertiesScan(basePackages = "com.assetflow.api")
public class AssetflowApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(AssetflowApiApplication.class, args);
    }
}
