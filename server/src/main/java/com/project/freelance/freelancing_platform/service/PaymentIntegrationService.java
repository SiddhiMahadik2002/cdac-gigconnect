package com.project.freelance.freelancing_platform.service;

import com.project.freelance.freelancing_platform.dto.payment.PaymentOrderResponse;
import java.util.UUID;

public interface PaymentIntegrationService {

    /**
     * Create payment order for proposal acceptance
     */
    PaymentOrderResponse createProposalPaymentOrder(Long proposalId, Long clientId);

    /**
     * Create payment order for gig purchase
     */
    PaymentOrderResponse createGigPaymentOrder(Long gigId, Long clientId);

    /**
     * Handle successful payment completion (called after payment verification)
     */
    void handleSuccessfulPayment(UUID paymentId);
}