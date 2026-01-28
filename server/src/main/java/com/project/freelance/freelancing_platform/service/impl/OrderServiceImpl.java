package com.project.freelance.freelancing_platform.service.impl;

import com.project.freelance.freelancing_platform.dto.order.AcceptProposalRequest;
import com.project.freelance.freelancing_platform.dto.order.OrderResponse;
import com.project.freelance.freelancing_platform.dto.order.PurchaseGigRequest;
import com.project.freelance.freelancing_platform.dto.order.UpdateOrderStatusRequest;
import com.project.freelance.freelancing_platform.model.*;
import com.project.freelance.freelancing_platform.proposal.Proposal;
import com.project.freelance.freelancing_platform.proposal.ProposalRepository;
import com.project.freelance.freelancing_platform.proposal.ProposalStatus;
import com.project.freelance.freelancing_platform.repository.*;
import com.project.freelance.freelancing_platform.requirement.Requirement;
import com.project.freelance.freelancing_platform.requirement.RequirementRepository;
import com.project.freelance.freelancing_platform.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final GigRepository gigRepository;
    private final ProposalRepository proposalRepository;
    private final PaymentRepository paymentRepository;
    private final ClientRepository clientRepository;
    private final FreelancerProfileRepository freelancerRepository;
    private final RequirementRepository requirementRepository;

    @Override
    public OrderResponse purchaseGig(Long gigId, Long clientId, PurchaseGigRequest request) {
        // Validate gig exists and is active
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> new RuntimeException("Gig not found"));

        if (gig.getStatus() != Gig.Status.ACTIVE) {
            throw new RuntimeException("Gig is not available for purchase");
        }

        // Validate client exists
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client not found"));

        // Validate payment exists and is successful
        var paymentOpt = paymentRepository.findByRazorpayOrderId(request.getPaymentId());
        if (paymentOpt.isEmpty()) {
            paymentOpt = paymentRepository.findByRazorpayPaymentId(request.getPaymentId());
        }
        Payment payment = paymentOpt.orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != Payment.PaymentStatus.PAID) {
            throw new RuntimeException("Payment not completed");
        }

        // Verify payment amount matches gig price (accept rupees or paise)
        BigDecimal gigPrice = gig.getFixedPrice();
        BigDecimal paymentAmount = payment.getAmount();
        boolean amountMatchesGig = paymentAmount.compareTo(gigPrice) == 0
                || paymentAmount.compareTo(gigPrice.multiply(BigDecimal.valueOf(100))) == 0;
        if (!amountMatchesGig) {
            throw new RuntimeException("Payment amount doesn't match gig price");
        }

        // Create order
        Order order = Order.builder()
                .orderType(Order.OrderType.GIG_PURCHASE)
                .orderSource(Order.OrderSource.DIRECT_GIG)
                .client(client)
                .freelancer(gig.getFreelancer())
                .gig(gig)
                .paymentId(request.getPaymentId())
                .amount(gig.getFixedPrice())
                .title(gig.getTitle())
                .description(gig.getDescription())
                .status(Order.OrderStatus.CONFIRMED)
                .clientNotes(request.getClientNotes())
                .build();

        order = orderRepository.save(order);
        log.info("Created gig purchase order {} for client {} and gig {}", order.getId(), clientId, gigId);

        return mapToOrderResponse(order);
    }

    @Override
    public OrderResponse acceptProposal(Long proposalId, Long clientId, AcceptProposalRequest request) {
        // Validate proposal exists and is pending
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new RuntimeException("Proposal not found"));

        // Handle already accepted or in-progress proposals (idempotency)
        if (proposal.getStatus() == ProposalStatus.ACCEPTED || proposal.getStatus() == ProposalStatus.IN_PROGRESS) {
            // Try to find existing order for this proposal
            var existingOrder = orderRepository.findByProposalId(proposalId);
            if (existingOrder.isPresent()) {
                log.info("Proposal {} already processed with existing order {} (status={})", proposalId,
                        existingOrder.get().getId(), proposal.getStatus());
                return mapToOrderResponse(existingOrder.get());
            }
            // No order found but proposal is already in ACCEPTED/IN_PROGRESS state —
            // continue to create order
            log.warn("Proposal {} is {} but no order exists; creating order to reconcile state", proposalId,
                    proposal.getStatus());
        } else if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new RuntimeException(
                    "Proposal is not available for acceptance. Current status: " + proposal.getStatus());
        }

        // Validate client owns the requirement
        Requirement requirement = proposal.getRequirement();
        if (!requirement.getClient().getClientId().equals(clientId)) {
            throw new RuntimeException("You can only accept proposals for your own requirements");
        }

        // Validate payment exists and is successful
        var paymentOpt = paymentRepository.findByRazorpayOrderId(request.getPaymentId());
        if (paymentOpt.isEmpty()) {
            paymentOpt = paymentRepository.findByRazorpayPaymentId(request.getPaymentId());
        }
        Payment payment = paymentOpt.orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != Payment.PaymentStatus.PAID) {
            throw new RuntimeException("Payment not completed");
        }

        // Verify payment amount matches proposal price (accept rupees or paise)
        BigDecimal proposalPrice = proposal.getProposedPrice();
        BigDecimal paymentAmountProp = payment.getAmount();
        boolean amountMatchesProposal = paymentAmountProp.compareTo(proposalPrice) == 0
                || paymentAmountProp.compareTo(proposalPrice.multiply(BigDecimal.valueOf(100))) == 0;
        if (!amountMatchesProposal) {
            throw new RuntimeException("Payment amount doesn't match proposal price");
        }

        // Update proposal status (only if not already accepted)
        if (proposal.getStatus() != ProposalStatus.ACCEPTED) {
            proposal.setStatus(ProposalStatus.ACCEPTED);
            proposalRepository.save(proposal);

            // Reject other proposals for the same requirement
            proposalRepository.rejectOtherProposalsForRequirement(requirement.getId(), proposalId);
        }

        // Create order
        Order order = Order.builder()
                .orderType(Order.OrderType.CUSTOM_PROJECT)
                .orderSource(Order.OrderSource.ACCEPTED_PROPOSAL)
                .client(requirement.getClient())
                .freelancer(proposal.getFreelancer())
                .requirement(requirement)
                .proposal(proposal)
                .paymentId(request.getPaymentId())
                .amount(proposal.getProposedPrice())
                .title(requirement.getTitle())
                .description(requirement.getDescription())
                .status(Order.OrderStatus.CONFIRMED)
                .clientNotes(request.getClientNotes())
                .build();

        order = orderRepository.save(order);
        log.info("Created order {} from accepted proposal {} for requirement {}", order.getId(), proposalId,
                requirement.getId());

        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long orderId, Long userId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found or access denied"));

        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByPaymentId(String paymentId, Long userId) {
        Order order = orderRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        // Check if user has access to this order
        if (!order.getClient().getClientId().equals(userId)
                && !order.getFreelancer().getFreelancerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return mapToOrderResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getClientOrders(Long clientId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByClientId(clientId, pageable);
        return orders.map(this::mapToOrderResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getClientOrdersByStatus(Long clientId, Order.OrderStatus status, Pageable pageable) {
        Page<Order> orders = orderRepository.findByClientIdAndStatus(clientId, status, pageable);
        return orders.map(this::mapToOrderResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getFreelancerOrders(Long freelancerId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByFreelancerId(freelancerId, pageable);
        return orders.map(this::mapToOrderResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getFreelancerOrdersByStatus(Long freelancerId, Order.OrderStatus status,
            Pageable pageable) {
        Page<Order> orders = orderRepository.findByFreelancerIdAndStatus(freelancerId, status, pageable);
        return orders.map(this::mapToOrderResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getGigOrders(Long gigId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByGigId(gigId, pageable);
        return orders.map(this::mapToOrderResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getRequirementOrders(Long requirementId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByRequirementId(requirementId, pageable);
        return orders.map(this::mapToOrderResponse);
    }

    @Override
    public OrderResponse updateOrderStatus(Long orderId, Long userId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found or access denied"));

        Order.OrderStatus currentStatus = order.getStatus();
        Order.OrderStatus newStatus = request.getStatus();

        // Validate status transition and user permissions
        validateStatusTransition(order, currentStatus, newStatus, userId);

        // Update order based on status
        updateOrderForStatus(order, newStatus, request);

        order = orderRepository.save(order);
        log.info("Updated order {} status from {} to {}", orderId, currentStatus, newStatus);

        // Update related entities if necessary
        updateRelatedEntitiesForStatusChange(order, newStatus);

        return mapToOrderResponse(order);
    }

    @Override
    public OrderResponse startWork(Long orderId, Long freelancerId) {
        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(Order.OrderStatus.IN_PROGRESS)
                .build();
        return updateOrderStatus(orderId, freelancerId, request);
    }

    @Override
    public OrderResponse deliverWork(Long orderId, Long freelancerId, String deliveryNotes) {
        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(Order.OrderStatus.SUBMITTED_FOR_REVIEW)
                .deliveryNotes(deliveryNotes)
                .deliveryDate(OffsetDateTime.now())
                .build();
        return updateOrderStatus(orderId, freelancerId, request);
    }

    @Override
    public OrderResponse approveWork(Long orderId, Long clientId, String clientNotes) {
        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(Order.OrderStatus.COMPLETED)
                .clientNotes(clientNotes)
                .build();
        return updateOrderStatus(orderId, clientId, request);
    }

    @Override
    public OrderResponse requestRevision(Long orderId, Long clientId, String revisionNotes) {
        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(Order.OrderStatus.REVISION_REQUESTED)
                .revisionNotes(revisionNotes)
                .build();
        return updateOrderStatus(orderId, clientId, request);
    }

    private void validateStatusTransition(Order order, Order.OrderStatus currentStatus, Order.OrderStatus newStatus,
            Long userId) {
        boolean isClient = order.getClient().getClientId().equals(userId);
        boolean isFreelancer = order.getFreelancer().getFreelancerId().equals(userId);

        // Define allowed transitions and user permissions
        switch (newStatus) {
            case IN_PROGRESS:
                if (!isFreelancer || currentStatus != Order.OrderStatus.CONFIRMED) {
                    throw new RuntimeException("Only freelancer can start work on confirmed orders");
                }
                break;

            case SUBMITTED_FOR_REVIEW:
                if (!isFreelancer || currentStatus != Order.OrderStatus.IN_PROGRESS) {
                    throw new RuntimeException("Only freelancer can submit work for review when it's in progress");
                }
                break;

            case COMPLETED:
                if (!isClient || (currentStatus != Order.OrderStatus.SUBMITTED_FOR_REVIEW
                        && currentStatus != Order.OrderStatus.DELIVERED)) {
                    throw new RuntimeException("Only client can approve work that was submitted for review");
                }
                break;

            case REVISION_REQUESTED:
                if (!isClient || (currentStatus != Order.OrderStatus.SUBMITTED_FOR_REVIEW
                        && currentStatus != Order.OrderStatus.DELIVERED)) {
                    throw new RuntimeException("Only client can request revisions on submitted work");
                }
                break;

            case CANCELLED:
                if (currentStatus != Order.OrderStatus.CONFIRMED) {
                    throw new RuntimeException("Order can only be cancelled when confirmed");
                }
                break;

            default:
                throw new RuntimeException("Invalid status transition");
        }
    }

    private void updateOrderForStatus(Order order, Order.OrderStatus newStatus, UpdateOrderStatusRequest request) {
        order.setStatus(newStatus);

        switch (newStatus) {
            case IN_PROGRESS:
                order.setStartedAt(OffsetDateTime.now());
                break;

            case SUBMITTED_FOR_REVIEW:
                order.setDeliveredAt(OffsetDateTime.now());
                order.setDeliveryDate(
                        request.getDeliveryDate() != null ? request.getDeliveryDate() : OffsetDateTime.now());
                if (request.getDeliveryNotes() != null) {
                    order.setDeliveryNotes(request.getDeliveryNotes());
                }
                break;

            case COMPLETED:
                order.setCompletedAt(OffsetDateTime.now());
                if (request.getClientNotes() != null) {
                    order.setClientNotes(request.getClientNotes());
                }
                break;

            case REVISION_REQUESTED:
                if (request.getRevisionNotes() != null) {
                    order.setRevisionNotes(request.getRevisionNotes());
                }
                // Reset delivered status
                order.setDeliveredAt(null);
                order.setStatus(Order.OrderStatus.IN_PROGRESS); // Back to in progress for revisions
                break;
        }
    }

    private void updateRelatedEntitiesForStatusChange(Order order, Order.OrderStatus newStatus) {
        // Update proposal status if this is a custom project
        if (order.isCustomProject() && order.getProposal() != null) {
            Proposal proposal = order.getProposal();
            switch (newStatus) {
                case IN_PROGRESS:
                    proposal.setStatus(ProposalStatus.IN_PROGRESS);
                    break;
                case COMPLETED:
                    proposal.setStatus(ProposalStatus.COMPLETED);
                    proposal.setCompletedAt(OffsetDateTime.now());
                    break;
            }
            proposalRepository.save(proposal);
        }
    }

    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse.OrderResponseBuilder builder = OrderResponse.builder()
                .id(order.getId())
                .orderType(order.getOrderType())
                .orderSource(order.getOrderSource())
                .title(order.getTitle())
                .description(order.getDescription())
                .amount(order.getAmount())
                .paymentId(order.getPaymentId())
                .status(order.getStatus())
                .clientId(order.getClient().getClientId())
                .clientName(
                        order.getClient().getUser().getFirstName() + " " + order.getClient().getUser().getLastName())
                .clientEmail(order.getClient().getUser().getEmail())
                .freelancerId(order.getFreelancer().getFreelancerId())
                .freelancerName(order.getFreelancer().getUser().getFirstName() + " "
                        + order.getFreelancer().getUser().getLastName())
                .freelancerEmail(order.getFreelancer().getUser().getEmail())
                .deliveryNotes(order.getDeliveryNotes())
                .clientNotes(order.getClientNotes())
                .revisionNotes(order.getRevisionNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .startedAt(order.getStartedAt())
                .deliveredAt(order.getDeliveredAt())
                .completedAt(order.getCompletedAt())
                .deliveryDate(order.getDeliveryDate());

        // Add gig info if it's a gig purchase
        if (order.isGigPurchase() && order.getGig() != null) {
            builder.gigId(order.getGig().getId())
                    .gigTitle(order.getGig().getTitle());
        }

        // Add requirement/proposal info if it's a custom project
        if (order.isCustomProject()) {
            if (order.getRequirement() != null) {
                builder.requirementId(order.getRequirement().getId())
                        .requirementTitle(order.getRequirement().getTitle());
            }
            if (order.getProposal() != null) {
                builder.proposalId(order.getProposal().getId());
            }
        }

        return builder.build();
    }
}