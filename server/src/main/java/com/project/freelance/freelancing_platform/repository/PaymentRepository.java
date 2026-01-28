package com.project.freelance.freelancing_platform.repository;

import com.project.freelance.freelancing_platform.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    List<Payment> findByUserId(Long userId);

    List<Payment> findByUserIdAndStatus(Long userId, Payment.PaymentStatus status);

    Optional<Payment> findByReferenceTypeAndReferenceId(Payment.ReferenceType referenceType, String referenceId);
}