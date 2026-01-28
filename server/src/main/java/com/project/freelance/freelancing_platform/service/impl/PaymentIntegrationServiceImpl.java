package com.project.freelance.freelancing_platform.service.impl;

import com.project.freelance.freelancing_platform.dto.order.AcceptProposalRequest;
import com.project.freelance.freelancing_platform.dto.order.PurchaseGigRequest;
import com.project.freelance.freelancing_platform.dto.payment.PaymentOrderResponse;
import com.project.freelance.freelancing_platform.dto.order.OrderResponse;
import com.project.freelance.freelancing_platform.model.Client;
import com.project.freelance.freelancing_platform.model.Gig;
import com.project.freelance.freelancing_platform.model.Payment;
import com.project.freelance.freelancing_platform.model.User;
import com.project.freelance.freelancing_platform.proposal.Proposal;
import com.project.freelance.freelancing_platform.proposal.ProposalStatus;
import com.project.freelance.freelancing_platform.proposal.ProposalRepository;
import com.project.freelance.freelancing_platform.repository.GigRepository;
import com.project.freelance.freelancing_platform.repository.PaymentRepository;
import com.project.freelance.freelancing_platform.repository.UserRepository;
import com.project.freelance.freelancing_platform.requirement.Requirement;
import com.project.freelance.freelancing_platform.requirement.RequirementStatus;
import com.project.freelance.freelancing_platform.requirement.RequirementRepository;
import com.project.freelance.freelancing_platform.service.PaymentIntegrationService;
import com.project.freelance.freelancing_platform.service.RazorpayService;
import com.project.freelance.freelancing_platform.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentIntegrationServiceImpl implements PaymentIntegrationService {

    private final RazorpayService razorpayService;
    private final PaymentRepository paymentRepository;
    private final ProposalRepository proposalRepository;
    private final GigRepository gigRepository;
    private final RequirementRepository requirementRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;

    @Override
    @Transactional
    public PaymentOrderResponse createProposalPaymentOrder(Long proposalId, Long clientId) {
        // Find and validate proposal
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found"));

        Requirement requirement = proposal.getRequirement();

        // Verify client ownership
        if (!requirement.getClient().getClientId().equals(clientId)) {
            throw new SecurityException("Not authorized to pay for this proposal");
        }

        // Check if proposal is in correct status for payment
        if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new IllegalStateException("Proposal is not in PENDING status");
        }

        // Check if payment already exists for this proposal
        String proposalRefId = proposal.getId().toString();
        if (paymentRepository.findByReferenceTypeAndReferenceId(
                Payment.ReferenceType.PROPOSAL, proposalRefId).isPresent()) {
            throw new IllegalStateException("Payment already exists for this proposal");
        }

        // Get client user details
        User clientUser = userRepository.findById(requirement.getClient().getUser().getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Client user not found"));

        // Create payment order
        PaymentOrderResponse response = razorpayService.createOrder(
                proposal.getProposedPrice(),
                "INR",
                Payment.ReferenceType.PROPOSAL,
                proposalRefId,
                clientUser.getUserId(),
                clientUser.getEmail());

        log.info("Created payment order for proposal {}: {}", proposalId, response.getOrderId());
        return response;
    }

    @Override
    @Transactional
    public PaymentOrderResponse createGigPaymentOrder(Long gigId, Long clientId) {
        // Find and validate gig
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new IllegalArgumentException("Gig not found"));

        // Check if gig is active
        if (gig.getStatus() != Gig.Status.ACTIVE) {
            throw new IllegalStateException("Gig is not active");
        }

        // Get client user details
        User clientUser = userRepository.findById(clientId)
                .orElseThrow(() -> new IllegalArgumentException("Client not found"));

        // Use gig ID as reference ID
        String gigRefId = gigId.toString();

        // Create payment order
        PaymentOrderResponse response = razorpayService.createOrder(
                gig.getFixedPrice(),
                "INR",
                Payment.ReferenceType.GIG,
                gigRefId,
                clientUser.getUserId(),
                clientUser.getEmail());

        log.info("Created payment order for gig {}: {}", gigId, response.getOrderId());
        return response;
    }

    @Override
    public void handleSuccessfulPayment(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));

        if (payment.getStatus() != Payment.PaymentStatus.PAID) {
            log.warn("Attempting to handle non-paid payment: {}", paymentId);
            return;
        }

        if (payment.getReferenceType() == Payment.ReferenceType.PROPOSAL) {
            handleProposalPayment(payment);
        } else if (payment.getReferenceType() == Payment.ReferenceType.GIG) {
            handleGigPayment(payment);
        }
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    private void handleProposalPayment(Payment payment) {
        try {
            // Parse the reference ID back to Long
            Long proposalId = Long.parseLong(payment.getReferenceId());

            Proposal proposal = proposalRepository.findById(proposalId)
                    .orElseThrow(() -> new IllegalArgumentException("Proposal not found"));

            // Get the requirement to find the client
            Requirement requirement = proposal.getRequirement();
            Long clientId = requirement.getClient().getClientId();

            // Try to create unified order first
            boolean orderCreated = false;
            try {
                AcceptProposalRequest acceptRequest = new AcceptProposalRequest();
                acceptRequest.setPaymentId(payment.getRazorpayOrderId());
                acceptRequest.setClientNotes("Payment verified - proposal accepted automatically");

                OrderResponse orderResp = orderService.acceptProposal(proposalId, clientId, acceptRequest);
                orderCreated = true;
                log.info("Successfully created unified order for proposal: {} with payment: {} and order {}",
                        proposalId, payment.getRazorpayOrderId(), orderResp.getId());

                // Auto-start work: attempt to move order to IN_PROGRESS as freelancer
                try {
                    Long orderId = orderResp.getId();
                    Long freelancerId = proposal.getFreelancer().getFreelancerId();
                    orderService.startWork(orderId, freelancerId);
                    log.info("Auto-started work for order {} by freelancer {}", orderId, freelancerId);
                } catch (Exception e) {
                    log.warn("Failed to auto-start work for proposal order {}: {}", proposalId, e.getMessage());
                }
            } catch (Exception e) {
                log.warn(
                        "Failed to create unified order for proposal: {}, payment: {}, error: {}. Using fallback approach.",
                        proposalId, payment.getRazorpayOrderId(), e.getMessage());
            }

            // If order creation failed, do NOT mark the proposal accepted automatically.
            // Leaving the proposal in PENDING allows retry/inspection instead of marking it
            // accepted
            // without creating a corresponding order.
            if (!orderCreated) {
                log.warn(
                        "Order creation failed for proposal: {} with payment: {}. Leaving proposal PENDING for manual review or retry.",
                        proposalId, payment.getId());
            } else {
                // Order was created successfully via orderService.acceptProposal; ensure
                // requirement and other proposals are updated.
                requirement.setStatus(RequirementStatus.IN_PROGRESS);
                requirementRepository.save(requirement);

                List<Proposal> otherProposals = proposalRepository.findByRequirementId(requirement.getId());
                for (Proposal other : otherProposals) {
                    if (!other.getId().equals(proposal.getId()) &&
                            other.getStatus() == ProposalStatus.PENDING) {
                        other.setStatus(ProposalStatus.REJECTED);
                        other.setRejectionReason("Another freelancer was selected for this project");
                        proposalRepository.save(other);
                    }
                }
            }

            log.info("Successfully processed proposal payment for proposal: {}", proposal.getId());
        } catch (Exception e) {
            log.error("Failed to handle proposal payment for payment: {}, error: {}", payment.getId(), e.getMessage(),
                    e);
            // Don't re-throw the exception to avoid transaction rollback
        }
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    private void handleGigPayment(Payment payment) {
        try {
            // Parse the reference ID back to Long
            Long gigId = Long.parseLong(payment.getReferenceId());

            Gig gig = gigRepository.findById(gigId)
                    .orElseThrow(() -> new IllegalArgumentException("Gig not found"));

            // Get client ID from payment
            Long clientId = payment.getUserId();

            // Try to create unified order
            boolean orderCreated = false;
            try {
                PurchaseGigRequest purchaseRequest = new PurchaseGigRequest();
                purchaseRequest.setPaymentId(payment.getRazorpayOrderId());
                purchaseRequest.setClientNotes("Payment verified - gig purchased automatically");

                OrderResponse orderResp = orderService.purchaseGig(gigId, clientId, purchaseRequest);
                orderCreated = true;
                log.info("Successfully created unified order for gig: {} with payment: {} and order {}",
                        gigId, payment.getRazorpayOrderId(), orderResp.getId());

                // Auto-start work for gig purchase
                try {
                    Long orderId = orderResp.getId();
                    Long freelancerId = gig.getFreelancer().getFreelancerId();
                    orderService.startWork(orderId, freelancerId);
                    log.info("Auto-started work for gig order {} by freelancer {}", orderId, freelancerId);
                } catch (Exception e) {
                    log.warn("Failed to auto-start work for gig order {}: {}", gigId, e.getMessage());
                }
            } catch (Exception e) {
                log.warn(
                        "Failed to create unified order for gig: {}, payment: {}, error: {}. Continuing without order creation.",
                        gigId, payment.getRazorpayOrderId(), e.getMessage());
            }

            log.info("Successfully processed gig payment for reference: {}. Order created: {}",
                    payment.getReferenceId(), orderCreated);
        } catch (Exception e) {
            log.error("Failed to handle gig payment for payment: {}, error: {}", payment.getId(), e.getMessage(), e);
            // Don't re-throw the exception to avoid transaction rollback
        }
    }
}