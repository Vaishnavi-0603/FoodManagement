package com.foodmanagement.platform.service;

import com.foodmanagement.platform.entity.NGO;
import com.foodmanagement.platform.entity.Notification;
import com.foodmanagement.platform.exception.ResourceNotFoundException;
import com.foodmanagement.platform.repository.NGORepository;
import com.foodmanagement.platform.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NGOService {

    @Autowired
    private NGORepository ngoRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    public List<NGO> getAllNgos() {
        return ngoRepository.findAll();
    }

    public List<NGO> getNgosByStatus(String status) {
        return ngoRepository.findByStatus(status);
    }

    public NGO getNgoById(Long id) {
        return ngoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NGO not found with id: " + id));
    }

    public NGO getNgoByUserId(Long userId) {
        return ngoRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("NGO profile not found for user: " + userId));
    }

    @Transactional
    public NGO updateNgoStatus(Long id, String status) {
        NGO ngo = getNgoById(id);
        ngo.setStatus(status.toUpperCase());
        NGO updatedNgo = ngoRepository.save(ngo);

        String subject = "APPROVED".equalsIgnoreCase(status) ? "NGO Account Approved!" : "NGO Application Update";
        String messageBody = "APPROVED".equalsIgnoreCase(status)
                ? "Your organization application has been approved. You can now log in and accept local donations."
                : "Your organization registration request has been rejected. Please verify documentation and submit again.";

        Notification notification = new Notification(ngo.getUser(), subject, messageBody);
        notificationRepository.save(notification);

        emailService.sendEmail(ngo.getUser().getEmail(), subject, messageBody);

        return updatedNgo;
    }
}
