package com.project.freelance.freelancing_platform.service.impl;

import com.project.freelance.freelancing_platform.dto.payment.PaymentOrderResponse;
import com.project.freelance.freelancing_platform.dto.payment.PaymentVerificationResponse;
import com.project.freelance.freelancing_platform.model.Payment;
import com.project.freelance.freelancing_platform.proposal.Proposal;
import com.project.freelance.freelancing_platform.proposal.ProposalRepository;
import com.project.freelance.freelancing_platform.repository.PaymentRepository;
import com.project.freelance.freelancing_platform.service.RazorpayService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RazorpayServiceImpl implements RazorpayService {

    private final RazorpayClient razorpayClient;
    private final PaymentRepository paymentRepository;

    @Value("${razorpay.key_id}")
    private String razorpayKeyId;

    @Value("${razorpay.key_secret}")
    private String razorpayKeySecret;

    @Override
    @Transactional
    public PaymentOrderResponse createOrder(BigDecimal amount, String currency,
            Payment.ReferenceType referenceType,
            String referenceId, Long userId, String userEmail) {
        try {
            // Frontend sends amount in paise already, so use directly (no conversion
            // needed)
            int amountInPaise = amount.intValue();

            // Ensure currency is not null or empty, default to INR
            String finalCurrency = (currency == null || currency.trim().isEmpty()) ? "INR" : currency.trim();

            // Create Razorpay order
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", finalCurrency);
            orderRequest.put("receipt", generateReceiptId(referenceType, referenceId));

            Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            log.info("Created Razorpay order: {} for amount: {}", razorpayOrder.get("id"), amount);

            // Save payment record in database (amount stored as received from frontend - in
            // paise)
            Payment payment = Payment.builder()
                    .userId(userId)
                    .referenceType(referenceType)
                    .referenceId(referenceId)
                    .razorpayOrderId(razorpayOrder.get("id"))
                    .amount(amount) // Store amount in paise as received from frontend
                    .currency(finalCurrency)
                    .status(Payment.PaymentStatus.CREATED)
                    .build();

            paymentRepository.save(payment);

            // Return order details for frontend
            return PaymentOrderResponse.builder()
                    .orderId(razorpayOrder.get("id"))
                    .amount(amount)
                    .currency(currency)
                    .key(razorpayKeyId)
                    .name("Freelancing Platform")
                    .description(getPaymentDescription(referenceType, referenceId))
                    .prefill_email(userEmail)
                    .build();

        } catch (RazorpayException e) {
            log.error("Error creating Razorpay order", e);
            throw new RuntimeException("Failed to create payment order", e);
        }
    }

    @Override
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(razorpayKeySecret.getBytes(), "HmacSHA256");
            mac.init(secretKey);

            byte[] hash = mac.doFinal(payload.getBytes());
            StringBuilder hexString = new StringBuilder();

            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }

            String calculatedSignature = hexString.toString();
            return calculatedSignature.equals(signature);

        } catch (Exception e) {
            log.error("Error verifying Razorpay signature", e);
            return false;
        }
    }

    @Override
    @Transactional
    public PaymentVerificationResponse verifyPayment(String orderId, String paymentId, String signature) {
        try {
            // Find payment by order ID
            Optional<Payment> optionalPayment = paymentRepository.findByRazorpayOrderId(orderId);

            if (optionalPayment.isEmpty()) {
                log.error("Payment not found for order ID: {}", orderId);
                return PaymentVerificationResponse.builder()
                        .success(false)
                        .message("Payment not found")
                        .build();
            }

            Payment payment = optionalPayment.get();

            // Verify signature
            if (!verifySignature(orderId, paymentId, signature)) {
                log.error("Invalid signature for order ID: {}", orderId);
                payment.setStatus(Payment.PaymentStatus.FAILED);
                paymentRepository.save(payment);

                return PaymentVerificationResponse.builder()
                        .success(false)
                        .message("Invalid payment signature")
                        .status("FAILED")
                        .build();
            }

            // Update payment status
            payment.setRazorpayPaymentId(paymentId);
            payment.setStatus(Payment.PaymentStatus.PAID); // Use PAID status for verified payments
            payment.setUpdatedAt(LocalDateTime.now());
            Payment savedPayment = paymentRepository.save(payment);

            // Note: Order creation is now handled separately by OrderController
            // after payment verification. This decouples payment processing from order creation.

            log.info("Payment verified successfully for order: {}, payment: {}", orderId, paymentId);

            return PaymentVerificationResponse.builder()
                    .success(true)
                    .message("Payment verified successfully")
                    .paymentId(paymentId)
                    .status("SUCCESS")
                    .build();

        } catch (Exception e) {
            log.error("Error verifying payment", e);
            return PaymentVerificationResponse.builder()
                    .success(false)
                    .message("Payment verification failed: " + e.getMessage())
                    .build();
        }
    }

    private String generateReceiptId(Payment.ReferenceType referenceType, String referenceId) {
        return referenceType.name().toLowerCase() + "_"
                + referenceId.replaceAll("[^0-9]", "").substring(0, Math.min(8, referenceId.length()));
    }

    private String getPaymentDescription(Payment.ReferenceType referenceType, String referenceId) {
        if (referenceType == Payment.ReferenceType.PROPOSAL) {
            return "Payment for accepted proposal: " + referenceId;
        } else {
            return "Payment for gig purchase: " + referenceId;
        }
    }
}