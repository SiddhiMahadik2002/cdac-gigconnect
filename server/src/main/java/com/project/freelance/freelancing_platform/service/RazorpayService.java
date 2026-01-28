package com.project.freelance.freelancing_platform.service;

import com.project.freelance.freelancing_platform.dto.payment.PaymentOrderResponse;
import com.project.freelance.freelancing_platform.dto.payment.PaymentVerificationResponse;
import com.project.freelance.freelancing_platform.model.Payment;

import java.math.BigDecimal;
import java.util.UUID;

public interface RazorpayService {

    /**
     * Create a Razorpay order for payment
     */
    PaymentOrderResponse createOrder(BigDecimal amount, String currency,
            Payment.ReferenceType referenceType,
            String referenceId, Long userId, String userEmail);

    /**
     * Verify Razorpay payment signature
     */
    boolean verifySignature(String orderId, String paymentId, String signature);

    /**
     * Process payment verification and update status
     */
    PaymentVerificationResponse verifyPayment(String orderId, String paymentId, String signature);
}