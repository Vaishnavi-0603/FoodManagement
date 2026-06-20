package com.foodmanagement.platform.repository;

import com.foodmanagement.platform.entity.User;
import com.foodmanagement.platform.entity.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerRepository extends JpaRepository<Volunteer, Long> {
    Optional<Volunteer> findByUser(User user);
    Optional<Volunteer> findByUserId(Long userId);
    List<Volunteer> findByStatus(String status);

    // Find available volunteers within a distance limit (in kilometers)
    @Query("SELECT v FROM Volunteer v WHERE v.status = 'AVAILABLE' AND v.user.isActive = true AND " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(v.latitude)) * cos(radians(v.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(v.latitude)))) < :distance")
    List<Volunteer> findVolunteersWithinDistance(@Param("lat") Double lat, @Param("lng") Double lng, @Param("distance") Double distance);
}
