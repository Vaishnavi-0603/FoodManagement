package com.foodmanagement.platform.controller;

import com.foodmanagement.platform.entity.Complaint;
import com.foodmanagement.platform.entity.User;
import com.foodmanagement.platform.repository.UserRepository;
import com.foodmanagement.platform.security.UserPrincipal;
import com.foodmanagement.platform.service.ComplaintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    @Autowired
    private ComplaintService complaintService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> createComplaint(@RequestBody Map<String, String> payload,
                                             @AuthenticationPrincipal UserPrincipal currentUser) {
        String title = payload.get("title");
        String description = payload.get("description");

        if (title == null || description == null) {
            return ResponseEntity.badRequest().body("Title and description are required");
        }

        User user = userRepository.findById(currentUser.getId()).orElseThrow();
        Complaint complaint = complaintService.createComplaint(user, title, description);
        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyComplaints(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(complaintService.getComplaintsByUser(currentUser.getId()));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resolveComplaint(@PathVariable Long id,
                                              @RequestBody Map<String, String> payload) {
        String feedback = payload.get("adminFeedback");
        if (feedback == null) {
            return ResponseEntity.badRequest().body("Admin feedback is required");
        }
        return ResponseEntity.ok(complaintService.resolveComplaint(id, feedback));
    }
}
