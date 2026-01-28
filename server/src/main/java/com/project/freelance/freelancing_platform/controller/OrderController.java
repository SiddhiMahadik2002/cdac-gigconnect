package com.project.freelance.freelancing_platform.controller;

import com.project.freelance.freelancing_platform.dto.order.AcceptProposalRequest;
import com.project.freelance.freelancing_platform.dto.order.OrderResponse;
import com.project.freelance.freelancing_platform.dto.order.PurchaseGigRequest;
import com.project.freelance.freelancing_platform.dto.order.UpdateOrderStatusRequest;
import com.project.freelance.freelancing_platform.model.Order;
import com.project.freelance.freelancing_platform.model.User;
import com.project.freelance.freelancing_platform.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Orders", description = "Unified API for managing all types of orders (gig purchases and custom projects)")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    // GIG PURCHASE ENDPOINTS

    @PostMapping("/gig/{gigId}/purchase")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Purchase a gig", description = "Create an order by purchasing a gig directly. Payment must be completed first.", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Gig purchased successfully")
    @ApiResponse(responseCode = "400", description = "Invalid request or payment not found")
    @ApiResponse(responseCode = "403", description = "Access denied - CLIENT role required")
    public ResponseEntity<OrderResponse> purchaseGig(
            @PathVariable Long gigId,
            @Valid @RequestBody PurchaseGigRequest request) {

        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        log.info("Client {} purchasing gig {}", user.getUserId(), gigId);

        OrderResponse response = orderService.purchaseGig(gigId, user.getUserId(), request);
        return ResponseEntity.ok(response);
    }

    // PROPOSAL ACCEPTANCE ENDPOINTS

    @PostMapping("/proposal/{proposalId}/accept")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Accept proposal", description = "Accept a proposal and create an order. Payment must be completed first.", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Proposal accepted and order created")
    @ApiResponse(responseCode = "400", description = "Invalid request or payment not found")
    @ApiResponse(responseCode = "403", description = "Access denied - CLIENT role required")
    public ResponseEntity<OrderResponse> acceptProposal(
            @PathVariable Long proposalId,
            @Valid @RequestBody AcceptProposalRequest request) {

        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        log.info("Client {} accepting proposal {}", user.getUserId(), proposalId);

        OrderResponse response = orderService.acceptProposal(proposalId, user.getUserId(), request);
        return ResponseEntity.ok(response);
    }

    // ORDER RETRIEVAL ENDPOINTS

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('FREELANCER')")
    @Operation(summary = "Get order details", description = "Get detailed information about a specific order. Accessible by client and freelancer involved.", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Order details retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Order not found")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long orderId) {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        OrderResponse response = orderService.getOrder(orderId, user.getUserId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/payment/{paymentId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('FREELANCER')")
    @Operation(summary = "Get order by payment ID", description = "Get order details using payment ID. Accessible by client and freelancer involved.", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Order details retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied")
    @ApiResponse(responseCode = "404", description = "Order not found")
    public ResponseEntity<OrderResponse> getOrderByPaymentId(@PathVariable String paymentId) {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        OrderResponse response = orderService.getOrderByPaymentId(paymentId, user.getUserId());
        return ResponseEntity.ok(response);
    }

    // CLIENT ORDER MANAGEMENT

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Get my orders as client", description = "Get all orders placed by the authenticated client.", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Orders retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied - CLIENT role required")
    public ResponseEntity<Page<OrderResponse>> getMyClientOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {

        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        Pageable pageable = PageRequest.of(page, size);
        Page<OrderResponse> orders;

        if (status != null) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            orders = orderService.getClientOrdersByStatus(user.getUserId(), orderStatus, pageable);
        } else {
            orders = orderService.getClientOrders(user.getUserId(), pageable);
        }

        return ResponseEntity.ok(orders);
    }

    // FREELANCER ORDER MANAGEMENT

    @GetMapping("/my-work")
    @PreAuthorize("hasRole('FREELANCER')")
    @Operation(summary = "Get my work orders", description = "Get all orders assigned to the authenticated freelancer.", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Orders retrieved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied - FREELANCER role required")
    public ResponseEntity<Page<OrderResponse>> getMyFreelancerOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {

        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        Pageable pageable = PageRequest.of(page, size);
        Page<OrderResponse> orders;

        if (status != null) {
            Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            orders = orderService.getFreelancerOrdersByStatus(user.getUserId(), orderStatus, pageable);
        } else {
            orders = orderService.getFreelancerOrders(user.getUserId(), pageable);
        }

        return ResponseEntity.ok(orders);
    }

    // ORDER STATUS MANAGEMENT

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('CLIENT') or hasRole('FREELANCER')")
    @Operation(summary = "Update order status", description = "Update the status of an order. Permissions vary by user role and current status.", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Order status updated successfully")
    @ApiResponse(responseCode = "400", description = "Invalid status transition")
    @ApiResponse(responseCode = "403", description = "Access denied")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request) {

        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        log.info("User {} updating order {} status to {}", user.getUserId(), orderId, request.getStatus());

        OrderResponse response = orderService.updateOrderStatus(orderId, user.getUserId(), request);
        return ResponseEntity.ok(response);
    }

    // FREELANCER WORKFLOW SHORTCUTS

    @PutMapping("/{orderId}/start-work")
    @PreAuthorize("hasRole('FREELANCER')")
    @Operation(summary = "Start working on order", description = "Freelancer marks order as IN_PROGRESS to begin work.", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Order marked as in progress")
    @ApiResponse(responseCode = "403", description = "Access denied - FREELANCER role required")
    public ResponseEntity<OrderResponse> startWork(@PathVariable Long orderId) {
        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        OrderResponse response = orderService.startWork(orderId, user.getUserId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{orderId}/deliver")
    @PreAuthorize("hasRole('FREELANCER')")
    @Operation(summary = "Deliver completed work", description = "Freelancer submits completed work for client review.", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Work delivered successfully")
    @ApiResponse(responseCode = "403", description = "Access denied - FREELANCER role required")
    public ResponseEntity<OrderResponse> deliverWork(
            @PathVariable Long orderId,
            @RequestBody(required = false) String deliveryNotes) {

        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        OrderResponse response = orderService.deliverWork(orderId, user.getUserId(), deliveryNotes);
        return ResponseEntity.ok(response);
    }

    // CLIENT WORKFLOW SHORTCUTS

    @PutMapping("/{orderId}/approve")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Approve delivered work", description = "Client approves the delivered work and completes the order.", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Work approved successfully")
    @ApiResponse(responseCode = "403", description = "Access denied - CLIENT role required")
    public ResponseEntity<OrderResponse> approveWork(
            @PathVariable Long orderId,
            @RequestBody(required = false) String clientNotes) {

        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        OrderResponse response = orderService.approveWork(orderId, user.getUserId(), clientNotes);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{orderId}/request-revision")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Request work revision", description = "Client requests revisions to the delivered work.", security = @SecurityRequirement(name = "JWT"))
    @ApiResponse(responseCode = "200", description = "Revision requested successfully")
    @ApiResponse(responseCode = "403", description = "Access denied - CLIENT role required")
    public ResponseEntity<OrderResponse> requestRevision(
            @PathVariable Long orderId,
            @RequestBody String revisionNotes) {

        var principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) principal;

        OrderResponse response = orderService.requestRevision(orderId, user.getUserId(), revisionNotes);
        return ResponseEntity.ok(response);
    }

    // PUBLIC ENDPOINTS FOR BROWSING

    @GetMapping("/gig/{gigId}")
    @Operation(summary = "Get orders for a gig", description = "Get all orders for a specific gig. Public endpoint for viewing gig popularity.")
    @ApiResponse(responseCode = "200", description = "Gig orders retrieved successfully")
    public ResponseEntity<Page<OrderResponse>> getGigOrders(
            @PathVariable Long gigId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<OrderResponse> orders = orderService.getGigOrders(gigId, pageable);

        return ResponseEntity.ok(orders);
    }

    @GetMapping("/requirement/{requirementId}")
    @Operation(summary = "Get orders for a requirement", description = "Get all orders for a specific requirement. Shows accepted proposals.")
    @ApiResponse(responseCode = "200", description = "Requirement orders retrieved successfully")
    public ResponseEntity<Page<OrderResponse>> getRequirementOrders(
            @PathVariable Long requirementId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<OrderResponse> orders = orderService.getRequirementOrders(requirementId, pageable);

        return ResponseEntity.ok(orders);
    }
}