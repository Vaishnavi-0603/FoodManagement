package com.foodmanagement.platform.controller;

import com.foodmanagement.platform.dto.DonationRequest;
import com.foodmanagement.platform.entity.*;
import com.foodmanagement.platform.exception.BadRequestException;
import com.foodmanagement.platform.exception.ResourceNotFoundException;
import com.foodmanagement.platform.repository.DonationAssignmentRepository;
import com.foodmanagement.platform.repository.DonationHistoryRepository;
import com.foodmanagement.platform.repository.DonationRepository;
import com.foodmanagement.platform.repository.UserRepository;
import com.foodmanagement.platform.security.UserPrincipal;
import com.foodmanagement.platform.service.DonationService;
import com.foodmanagement.platform.service.NGOService;
import com.foodmanagement.platform.service.VolunteerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    @Autowired
    private DonationService donationService;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private DonationAssignmentRepository assignmentRepository;

    @Autowired
    private DonationHistoryRepository historyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NGOService ngoService;

    @Autowired
    private VolunteerService volunteerService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @PostMapping
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<?> createDonation(@Valid @RequestBody DonationRequest request,
                                            @AuthenticationPrincipal UserPrincipal currentUser) {
        User donor = userRepository.findById(currentUser.getId()).orElseThrow();
        Donation donation = donationService.createDonation(donor, request, null);
        return ResponseEntity.ok(donation);
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<?> uploadImage(@PathVariable Long id,
                                         @RequestParam("file") MultipartFile file) {
        Donation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));

        if (file.isEmpty()) {
            throw new BadRequestException("Please select a valid image file");
        }

        try {
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + filename);
            Files.write(path, file.getBytes());

            donation.setImagePath("uploads/" + filename);
            donationRepository.save(donation);

            return ResponseEntity.ok(donation);
        } catch (IOException e) {
            throw new RuntimeException("Could not save food image file: " + e.getMessage());
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<?> getMyDonations(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(donationService.getDonationsByDonor(currentUser.getId()));
    }

    @GetMapping("/nearby")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<?> getNearbyAvailableDonations(@AuthenticationPrincipal UserPrincipal currentUser) {
        NGO ngo = ngoService.getNgoByUserId(currentUser.getId());
        return ResponseEntity.ok(donationService.getAvailableDonationsNearNgo(ngo));
    }

    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<?> acceptDonation(@PathVariable Long id,
                                            @AuthenticationPrincipal UserPrincipal currentUser) {
        NGO ngo = ngoService.getNgoByUserId(currentUser.getId());
        DonationAssignment assignment = donationService.acceptDonation(ngo, id);
        return ResponseEntity.ok(assignment);
    }

    @PostMapping("/assignments/{assignmentId}/assign")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<?> assignVolunteer(@PathVariable Long assignmentId,
                                             @RequestParam("volunteerId") Long volunteerId) {
        DonationAssignment assignment = donationService.assignVolunteer(assignmentId, volunteerId);
        return ResponseEntity.ok(assignment);
    }

    @PostMapping("/assignments/{assignmentId}/pickup")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<?> verifyPickup(@PathVariable Long assignmentId,
                                          @RequestParam("qrHash") String qrHash) {
        DonationAssignment assignment = donationService.verifyPickup(assignmentId, qrHash);
        return ResponseEntity.ok(assignment);
    }

    @PostMapping("/assignments/{assignmentId}/deliver")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<?> verifyDelivery(@PathVariable Long assignmentId,
                                            @RequestParam("qrHash") String qrHash) {
        DonationAssignment assignment = donationService.verifyDelivery(assignmentId, qrHash);
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<?> getDonationHistory(@PathVariable Long id) {
        return ResponseEntity.ok(historyRepository.findByDonationIdOrderByChangedAtDesc(id));
    }

    @GetMapping("/assignments/volunteer")
    @PreAuthorize("hasRole('VOLUNTEER')")
    public ResponseEntity<?> getVolunteerAssignments(@AuthenticationPrincipal UserPrincipal currentUser) {
        Volunteer volunteer = volunteerService.getVolunteerByUserId(currentUser.getId());
        List<DonationAssignment> list = assignmentRepository.findByVolunteerId(volunteer.getId());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/assignments/ngo")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<?> getNgoAssignments(@AuthenticationPrincipal UserPrincipal currentUser) {
        NGO ngo = ngoService.getNgoByUserId(currentUser.getId());
        List<DonationAssignment> list = assignmentRepository.findByNgoId(ngo.getId());
        return ResponseEntity.ok(list);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllDonations() {
        return ResponseEntity.ok(donationRepository.findAll());
    }
}
