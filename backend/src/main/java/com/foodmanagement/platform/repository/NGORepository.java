package com.foodmanagement.platform.repository;

import com.foodmanagement.platform.entity.NGO;
import com.foodmanagement.platform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NGORepository extends JpaRepository<NGO, Long> {
    Optional<NGO> findByUser(User user);
    Optional<NGO> findByUserId(Long userId);
    List<NGO> findByStatus(String status);

    // Haversine formula to find NGOs within specified distance (in kilometers)
    @Query("SELECT n FROM NGO n WHERE n.status = 'APPROVED' AND " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(n.latitude)) * cos(radians(n.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(n.latitude)))) < :distance")
    List<NGO> findNgosWithinDistance(@Param("lat") Double lat, @Param("lng") Double lng, @Param("distance") Double distance);
}
