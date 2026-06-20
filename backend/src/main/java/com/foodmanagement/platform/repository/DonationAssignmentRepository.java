package com.foodmanagement.platform.repository;

import com.foodmanagement.platform.entity.DonationAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonationAssignmentRepository extends JpaRepository<DonationAssignment, Long> {
    Optional<DonationAssignment> findByDonationId(Long donationId);
    List<DonationAssignment> findByNgoId(Long ngoId);
    List<DonationAssignment> findByVolunteerId(Long volunteerId);
    Optional<DonationAssignment> findByQrCodeHash(String qrCodeHash);
}
