package com.foodmanagement.platform.repository;

import com.foodmanagement.platform.entity.DonationHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationHistoryRepository extends JpaRepository<DonationHistory, Long> {
    List<DonationHistory> findByDonationIdOrderByChangedAtDesc(Long donationId);
}
