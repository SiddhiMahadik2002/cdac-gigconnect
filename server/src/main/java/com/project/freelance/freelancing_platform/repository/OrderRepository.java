package com.project.freelance.freelancing_platform.repository;

import com.project.freelance.freelancing_platform.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Find order by payment ID
    Optional<Order> findByPaymentId(String paymentId);

    // Find order by proposal ID
    @Query("SELECT o FROM Order o WHERE o.proposal.id = :proposalId")
    Optional<Order> findByProposalId(@Param("proposalId") Long proposalId);

    // Find orders by client
    @Query("SELECT o FROM Order o WHERE o.client.clientId = :clientId ORDER BY o.createdAt DESC")
    Page<Order> findByClientId(@Param("clientId") Long clientId, Pageable pageable);

    // Find orders by client and status
    @Query("SELECT o FROM Order o WHERE o.client.clientId = :clientId AND o.status = :status ORDER BY o.createdAt DESC")
    Page<Order> findByClientIdAndStatus(@Param("clientId") Long clientId, @Param("status") Order.OrderStatus status,
            Pageable pageable);

    // Find orders by freelancer
    @Query("SELECT o FROM Order o WHERE o.freelancer.freelancerId = :freelancerId ORDER BY o.createdAt DESC")
    Page<Order> findByFreelancerId(@Param("freelancerId") Long freelancerId, Pageable pageable);

    // Find orders by freelancer and status
    @Query("SELECT o FROM Order o WHERE o.freelancer.freelancerId = :freelancerId AND o.status = :status ORDER BY o.createdAt DESC")
    Page<Order> findByFreelancerIdAndStatus(@Param("freelancerId") Long freelancerId,
            @Param("status") Order.OrderStatus status, Pageable pageable);

    // Find orders for a specific gig
    @Query("SELECT o FROM Order o WHERE o.gig.id = :gigId ORDER BY o.createdAt DESC")
    Page<Order> findByGigId(@Param("gigId") Long gigId, Pageable pageable);

    // Find orders for a specific requirement
    @Query("SELECT o FROM Order o WHERE o.requirement.id = :requirementId ORDER BY o.createdAt DESC")
    Page<Order> findByRequirementId(@Param("requirementId") Long requirementId, Pageable pageable);

    // Check if order belongs to user (client or freelancer)
    @Query("SELECT o FROM Order o WHERE o.id = :orderId AND (o.client.clientId = :userId OR o.freelancer.freelancerId = :userId)")
    Optional<Order> findByIdAndUserId(@Param("orderId") Long orderId, @Param("userId") Long userId);

    // Count orders by status for analytics
    long countByStatus(Order.OrderStatus status);

    // Count orders by freelancer and status
    @Query("SELECT COUNT(o) FROM Order o WHERE o.freelancer.freelancerId = :freelancerId AND o.status = :status")
    long countByFreelancerIdAndStatus(@Param("freelancerId") Long freelancerId,
            @Param("status") Order.OrderStatus status);

    // Count orders by client and status
    @Query("SELECT COUNT(o) FROM Order o WHERE o.client.clientId = :clientId AND o.status = :status")
    long countByClientIdAndStatus(@Param("clientId") Long clientId, @Param("status") Order.OrderStatus status);
}