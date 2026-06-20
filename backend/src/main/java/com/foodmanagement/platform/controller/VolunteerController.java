package com.foodmanagement.platform.controller;

import com.foodmanagement.platform.entity.Volunteer;
import com.foodmanagement.platform.security.UserPrincipal;
import com.foodmanagement.platform.service.VolunteerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/volunteers")
public class VolunteerController {

    @Autowired
    private VolunteerService volunteerService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'NGO')")
    public ResponseEntity<?> getAllVolunteers() {
        return ResponseEntity.ok(volunteerService.getAllVolunteers());
    }

    @GetMapping("/nearby")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<?> getNearbyAvailableVolunteers(@RequestParam("lat") Double lat,
                                                          @RequestParam("lng") Double lng) {
        return ResponseEntity.ok(volunteerService.getAvailableVolunteersNear(lat, lng));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<?> getVolunteerProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        Volunteer volunteer = volunteerService.getVolunteerByUserId(currentUser.getId());
        return ResponseEntity.ok(volunteer);
    }
}
