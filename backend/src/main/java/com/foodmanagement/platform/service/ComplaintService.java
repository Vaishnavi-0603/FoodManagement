package com.foodmanagement.platform.service;

import com.foodmanagement.platform.entity.Complaint;
import com.foodmanagement.platform.entity.User;
import com.foodmanagement.platform.exception.ResourceNotFoundException;
import com.foodmanagement.platform.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplaintService {

    @Autowired
    private ComplaintRepository complaintRepository;

    public Complaint createComplaint(User user, String title, String description) {
        Complaint complaint = new Complaint();
        complaint.setUser(user);
        complaint.setTitle(title);
        complaint.setDescription(description);
        complaint.setStatus("PENDING");
        return complaintRepository.save(complaint);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    public List<Complaint> getComplaintsByUser(Long userId) {
        return complaintRepository.findByUserId(userId);
    }

    @Transactional
    public Complaint resolveComplaint(Long id, String adminFeedback) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found with id: " + id));

        complaint.setStatus("RESOLVED");
        complaint.setResolvedAt(LocalDateTime.now());
        complaint.setAdminFeedback(adminFeedback);

        return complaintRepository.save(complaint);
    }
}
