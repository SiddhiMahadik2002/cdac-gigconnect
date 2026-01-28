package com.project.freelance.freelancing_platform.service;

import com.project.freelance.freelancing_platform.dto.order.AcceptProposalRequest;
import com.project.freelance.freelancing_platform.dto.order.OrderResponse;
import com.project.freelance.freelancing_platform.dto.order.PurchaseGigRequest;
import com.project.freelance.freelancing_platform.dto.order.UpdateOrderStatusRequest;
import com.project.freelance.freelancing_platform.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    // Purchase a gig directly
    OrderResponse purchaseGig(Long gigId, Long clientId, PurchaseGigRequest request);

    // Accept a proposal and create order
    OrderResponse acceptProposal(Long proposalId, Long clientId, AcceptProposalRequest request);

    // Get order details
    OrderResponse getOrder(Long orderId, Long userId);

    // Get order by payment ID
    OrderResponse getOrderByPaymentId(String paymentId, Long userId);

    // Get client orders
    Page<OrderResponse> getClientOrders(Long clientId, Pageable pageable);

    // Get client orders by status
    Page<OrderResponse> getClientOrdersByStatus(Long clientId, Order.OrderStatus status, Pageable pageable);

    // Get freelancer orders
    Page<OrderResponse> getFreelancerOrders(Long freelancerId, Pageable pageable);

    // Get freelancer orders by status
    Page<OrderResponse> getFreelancerOrdersByStatus(Long freelancerId, Order.OrderStatus status, Pageable pageable);

    // Get orders for a specific gig
    Page<OrderResponse> getGigOrders(Long gigId, Pageable pageable);

    // Get orders for a specific requirement
    Page<OrderResponse> getRequirementOrders(Long requirementId, Pageable pageable);

    // Update order status
    OrderResponse updateOrderStatus(Long orderId, Long userId, UpdateOrderStatusRequest request);

    // Helper methods for common status transitions
    OrderResponse startWork(Long orderId, Long freelancerId);

    OrderResponse deliverWork(Long orderId, Long freelancerId, String deliveryNotes);

    OrderResponse approveWork(Long orderId, Long clientId, String clientNotes);

    OrderResponse requestRevision(Long orderId, Long clientId, String revisionNotes);
}