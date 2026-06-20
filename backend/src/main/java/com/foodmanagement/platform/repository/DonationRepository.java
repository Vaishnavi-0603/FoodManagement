package com.foodmanagement.platform.repository;

import com.foodmanagement.platform.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByDonorId(Long donorId);
    List<Donation> findByStatus(String status);
    List<Donation> findByStatusAndExpiryTimeAfter(String status, LocalDateTime time);

    // Find available, non-expired donations within specified radius (in kilometers)
    @Query("SELECT d FROM Donation d WHERE d.status = 'AVAILABLE' AND d.expiryTime > :now AND " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(d.latitude)) * cos(radians(d.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(d.latitude)))) < :distance")
    List<Donation> findAvailableDonationsWithinDistance(@Param("lat") Double lat, @Param("lng") Double lng, @Param("distance") Double distance, @Param("now") LocalDateTime now);
}
