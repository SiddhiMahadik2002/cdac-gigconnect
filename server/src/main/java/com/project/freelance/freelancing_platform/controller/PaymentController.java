package com.project.freelance.freelancing_platform.controller;

import com.project.freelance.freelancing_platform.dto.payment.CreateOrderRequest;
import com.project.freelance.freelancing_platform.dto.payment.PaymentOrderResponse;
import com.project.freelance.freelancing_platform.dto.payment.PaymentVerificationResponse;
import com.project.freelance.freelancing_platform.dto.payment.VerifyPaymentRequest;
import com.project.freelance.freelancing_platform.service.PaymentIntegrationService;
import com.project.freelance.freelancing_platform.service.RazorpayService;
import com.project.freelance.freelancing_platform.repository.PaymentRepository;
import com.project.freelance.freelancing_platform.model.Payment;
import com.project.freelance.freelancing_platform.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment Management", description = "APIs for managing Razorpay payments")
public class PaymentController {

    private final RazorpayService razorpayService;
    private final PaymentIntegrationService paymentIntegrationService;
    private final PaymentRepository paymentRepository;

    @PostMapping("/create-order")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Create Razorpay order for payment", description = "Creates a Razorpay order for gig purchase or proposal acceptance. Only clients can create payment orders.", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Order created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request data")
    @ApiResponse(responseCode = "403", description = "Access denied - CLIENT role required")
    public ResponseEntity<PaymentOrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {

        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        log.info("Creating payment order for user: {}, amount: {}, reference: {}:{}",
                user.getUserId(), request.getAmount(), request.getReferenceType(), request.getReferenceId());

        PaymentOrderResponse response = razorpayService.createOrder(
                request.getAmount(),
                request.getCurrency(),
                request.getReferenceType(),
                request.getReferenceId(),
                user.getUserId(),
                user.getEmail());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Verify Razorpay payment", description = "Verifies the payment signature and updates payment status. Triggers business logic updates.", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Payment verification completed")
    @ApiResponse(responseCode = "400", description = "Invalid verification data")
    @ApiResponse(responseCode = "403", description = "Access denied - CLIENT role required")
    public ResponseEntity<PaymentVerificationResponse> verifyPayment(
            @Valid @RequestBody VerifyPaymentRequest request) {

        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        log.info("Verifying payment for user: {}, order: {}, payment: {}",
                user.getUserId(), request.getOrderId(), request.getPaymentId());

        PaymentVerificationResponse response = razorpayService.verifyPayment(
                request.getOrderId(),
                request.getPaymentId(),
                request.getSignature());

        // If payment is successful, trigger business logic
        if (response.isSuccess()) {
            Optional<Payment> payment = paymentRepository.findByRazorpayOrderId(request.getOrderId());
            if (payment.isPresent()) {
                paymentIntegrationService.handleSuccessfulPayment(payment.get().getId());
            }
            log.info("Payment verified successfully for order: {}", request.getOrderId());
        } else {
            log.warn("Payment verification failed for order: {}, reason: {}",
                    request.getOrderId(), response.getMessage());
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/proposals/{proposalId}/create-order")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Create payment order for proposal acceptance", description = "Creates a Razorpay order to pay for accepting a specific proposal", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Order created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid proposal or unauthorized")
    @ApiResponse(responseCode = "403", description = "Access denied - CLIENT role required")
    public ResponseEntity<PaymentOrderResponse> createProposalPaymentOrder(
            @PathVariable Long proposalId) {

        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        log.info("Creating proposal payment order for proposal: {} by user: {}", proposalId, user.getUserId());

        PaymentOrderResponse response = paymentIntegrationService.createProposalPaymentOrder(proposalId,
                user.getUserId());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/gigs/{gigId}/create-order")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Create payment order for gig purchase", description = "Creates a Razorpay order to purchase a specific gig", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Order created successfully")
    @ApiResponse(responseCode = "400", description = "Invalid gig or already purchased")
    @ApiResponse(responseCode = "403", description = "Access denied - CLIENT role required")
    public ResponseEntity<PaymentOrderResponse> createGigPaymentOrder(
            @PathVariable Long gigId) {

        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        log.info("Creating gig payment order for gig: {} by user: {}", gigId, user.getUserId());

        PaymentOrderResponse response = paymentIntegrationService.createGigPaymentOrder(gigId, user.getUserId());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders/{orderId}")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Get payment details by order ID", description = "Retrieves payment information for a specific Razorpay order ID", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Payment details retrieved")
    @ApiResponse(responseCode = "404", description = "Payment not found")
    @ApiResponse(responseCode = "403", description = "Access denied - CLIENT role required")
    public ResponseEntity<String> getPaymentDetails(
            @PathVariable String orderId) {

        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        log.info("Getting payment details for order: {} by user: {}", orderId, user.getUserId());

        // This can be implemented to return payment details if needed
        return ResponseEntity.ok("Payment details endpoint - to be implemented based on requirements");
    }
}