package com.foodmanagement.platform.service;

import com.foodmanagement.platform.entity.Volunteer;
import com.foodmanagement.platform.exception.ResourceNotFoundException;
import com.foodmanagement.platform.repository.VolunteerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VolunteerService {

    @Autowired
    private VolunteerRepository volunteerRepository;

    public List<Volunteer> getAllVolunteers() {
        return volunteerRepository.findAll();
    }

    public List<Volunteer> getAvailableVolunteersNear(Double lat, Double lng) {
        return volunteerRepository.findVolunteersWithinDistance(lat, lng, 15.0); // 15km lookup radius
    }

    public Volunteer getVolunteerByUserId(Long userId) {
        return volunteerRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer profile not found for user: " + userId));
    }
}
