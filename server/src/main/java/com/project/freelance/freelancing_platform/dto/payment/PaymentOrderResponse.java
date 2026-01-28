package com.project.freelance.freelancing_platform.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponse {

    private String orderId;
    private BigDecimal amount;
    private String currency;
    private String key;
    private String name;
    private String description;
    private String prefill_email;
    private String prefill_contact;
}