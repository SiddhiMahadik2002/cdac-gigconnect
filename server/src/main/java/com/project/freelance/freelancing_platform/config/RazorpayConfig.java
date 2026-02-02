package com.project.freelance.freelancing_platform.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Slf4j
public class RazorpayConfig {

    @Value("${razorpay.key_id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key_secret:}")
    private String razorpayKeySecret;

    @Bean
    public RazorpayClient razorpayClient() {
        if (razorpayKeyId == null || razorpayKeyId.isBlank() || razorpayKeySecret == null
                || razorpayKeySecret.isBlank()) {
            log.warn("Razorpay keys not set; skipping Razorpay client initialization");
            return null;
        }
        try {
            log.info("Initializing Razorpay client with key: {}", razorpayKeyId);
            return new RazorpayClient(razorpayKeyId, razorpayKeySecret);
        } catch (RazorpayException e) {
            log.error("Failed to initialize Razorpay client", e);
            throw new RuntimeException("Failed to initialize Razorpay client", e);
        }
    }
}