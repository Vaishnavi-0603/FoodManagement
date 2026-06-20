package com.foodmanagement.platform.service;

import com.foodmanagement.platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private NGORepository ngoRepository;

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", userRepository.count());
        stats.put("totalDonations", donationRepository.count());
        stats.put("activeNgos", ngoRepository.findByStatus("APPROVED").size());
        stats.put("pendingNgos", ngoRepository.findByStatus("PENDING").size());
        stats.put("activeVolunteers", volunteerRepository.count());
        stats.put("totalComplaints", complaintRepository.count());
        stats.put("pendingComplaints", complaintRepository.findByStatus("PENDING").size());

        // Donation Status Distribution
        stats.put("availableDonations", donationRepository.findByStatus("AVAILABLE").size());
        stats.put("acceptedDonations", donationRepository.findByStatus("ACCEPTED").size());
        stats.put("pickedUpDonations", donationRepository.findByStatus("PICKED_UP").size());
        stats.put("deliveredDonations", donationRepository.findByStatus("DELIVERED").size());
        stats.put("expiredDonations", donationRepository.findByStatus("EXPIRED").size());

        return stats;
    }
}
