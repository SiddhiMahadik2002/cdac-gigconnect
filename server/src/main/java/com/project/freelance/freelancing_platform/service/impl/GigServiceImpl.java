package com.project.freelance.freelancing_platform.service.impl;

import com.project.freelance.freelancing_platform.dto.GigRequest;
import com.project.freelance.freelancing_platform.model.FreelancerProfile;
import com.project.freelance.freelancing_platform.model.Gig;
import com.project.freelance.freelancing_platform.repository.FreelancerProfileRepository;
import com.project.freelance.freelancing_platform.repository.GigRepository;
import com.project.freelance.freelancing_platform.service.GigService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class GigServiceImpl implements GigService {
    private final GigRepository gigRepository;
    private final FreelancerProfileRepository freelancerProfileRepository;
    private final EntityManager em;

    public GigServiceImpl(GigRepository gigRepository, FreelancerProfileRepository freelancerProfileRepository,
            EntityManager em) {
        this.gigRepository = gigRepository;
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.em = em;
    }

    @Override
    public Gig createGig(Long freelancerId, GigRequest req) {
        FreelancerProfile fp = freelancerProfileRepository.findById(freelancerId)
                .orElseThrow(() -> new IllegalArgumentException("Freelancer not found"));

        Gig g = new Gig();
        g.setFreelancer(fp);
        g.setTitle(req.title);
        g.setDescription(req.description);
        g.setFixedPrice(req.fixedPrice);
        g.setSkills(req.skills);
        if (req.status != null) {
            try {
                g.setStatus(Gig.Status.valueOf(req.status));
            } catch (Exception ignored) {
            }
        }
        return gigRepository.save(g);
    }

    @Override
    public Gig updateGig(Long freelancerId, Long gigId, GigRequest req) {
        Gig g = gigRepository.findById(gigId).orElseThrow(() -> new IllegalArgumentException("Gig not found"));
        if (g.getFreelancer() == null || !g.getFreelancer().getFreelancerId().equals(freelancerId)) {
            throw new SecurityException("Not allowed");
        }

        if (req.title != null)
            g.setTitle(req.title);
        if (req.description != null)
            g.setDescription(req.description);
        if (req.fixedPrice != null)
            g.setFixedPrice(req.fixedPrice);
        if (req.skills != null)
            g.setSkills(req.skills);
        if (req.status != null) {
            try {
                g.setStatus(Gig.Status.valueOf(req.status));
            } catch (Exception ignored) {
            }
        }
        g.setUpdatedAt(java.time.OffsetDateTime.now());
        return gigRepository.save(g);
    }

    @Override
    public void softDeleteGig(Long freelancerId, Long gigId) {
        Gig g = gigRepository.findById(gigId).orElseThrow(() -> new IllegalArgumentException("Gig not found"));
        if (g.getFreelancer() == null || !g.getFreelancer().getFreelancerId().equals(freelancerId)) {
            throw new SecurityException("Not allowed");
        }
        g.setDeleted(true);
        g.setUpdatedAt(java.time.OffsetDateTime.now());
        gigRepository.save(g);
    }

    @Override
    public Gig getGig(Long id) {
        return gigRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Gig not found"));
    }

    @Override
    public Page<Gig> searchGigs(String skill, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Gig> cq = cb.createQuery(Gig.class);
        Root<Gig> root = cq.from(Gig.class);

        List<Predicate> preds = new ArrayList<>();
        preds.add(cb.isFalse(root.get("deleted")));

        if (skill != null && !skill.isBlank()) {
            preds.add(cb.like(cb.lower(root.get("skills")), cb.literal("%" + skill.toLowerCase() + "%")));
        }

        if (minPrice != null) {
            preds.add(cb.greaterThanOrEqualTo(root.get("fixedPrice"), minPrice));
        }
        if (maxPrice != null) {
            preds.add(cb.lessThanOrEqualTo(root.get("fixedPrice"), maxPrice));
        }

        cq.where(preds.toArray(new Predicate[0]));
        // Simple ordering
        cq.orderBy(cb.desc(root.get("createdAt")));

        List<Gig> list = em.createQuery(cq)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        // total count
        CriteriaQuery<Long> countQ = cb.createQuery(Long.class);
        Root<Gig> countRoot = countQ.from(Gig.class);
        countQ.select(cb.count(countRoot)).where(preds.toArray(new Predicate[0]));
        Long total = em.createQuery(countQ).getSingleResult();

        return new PageImpl<>(list, pageable, total);
    }
}
