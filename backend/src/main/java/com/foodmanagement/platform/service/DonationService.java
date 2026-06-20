package com.foodmanagement.platform.service;

import com.foodmanagement.platform.dto.DonationRequest;
import com.foodmanagement.platform.entity.*;
import com.foodmanagement.platform.exception.BadRequestException;
import com.foodmanagement.platform.exception.ResourceNotFoundException;
import com.foodmanagement.platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DonationService {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private DonationAssignmentRepository assignmentRepository;

    @Autowired
    private DonationHistoryRepository historyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NGORepository ngoRepository;

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private QRService qrService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Transactional
    public Donation createDonation(User donor, DonationRequest request, String imagePath) {
        Donation donation = new Donation();
        donation.setDonor(donor);
        donation.setFoodName(request.getFoodName());
        donation.setQuantity(request.getQuantity());
        donation.setFoodType(request.getFoodType());
        donation.setPrepTime(request.getPrepTime());
        donation.setExpiryTime(request.getExpiryTime());
        donation.setPickupLocation(request.getPickupLocation());
        donation.setLatitude(request.getLatitude());
        donation.setLongitude(request.getLongitude());
        donation.setImagePath(imagePath);
        donation.setStatus("AVAILABLE");

        Donation savedDonation = donationRepository.save(donation);

        // Record history log
        historyRepository.save(new DonationHistory(savedDonation, "AVAILABLE", donor, "Donation listing created."));

        // Match and notify nearby NGOs (within 10 km)
        List<NGO> nearbyNgos = ngoRepository.findNgosWithinDistance(request.getLatitude(), request.getLongitude(), 10.0);
        for (NGO ngo : nearbyNgos) {
            // Send in-app notification
            Notification notification = new Notification(ngo.getUser(), 
                    "New Food Donation Available Nearby!", 
                    String.format("'%s' is available for pickup at '%s'. Check dashboard maps.", 
                            savedDonation.getFoodName(), savedDonation.getPickupLocation()));
            notificationRepository.save(notification);

            // Send Email alert
            emailService.sendDonationAlertToNgo(
                    ngo.getUser().getEmail(), 
                    ngo.getOrganizationName(), 
                    savedDonation.getFoodName(), 
                    "10"
            );
        }

        return savedDonation;
    }

    public List<Donation> getDonationsByDonor(Long donorId) {
        return donationRepository.findByDonorId(donorId);
    }

    public List<Donation> getAvailableDonationsNearNgo(NGO ngo) {
        return donationRepository.findAvailableDonationsWithinDistance(
                ngo.getLatitude(), 
                ngo.getLongitude(), 
                15.0, // search radius 15km
                LocalDateTime.now()
        );
    }

    @Transactional
    public DonationAssignment acceptDonation(NGO ngo, Long donationId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));

        if (!"AVAILABLE".equals(donation.getStatus())) {
            throw new BadRequestException("Donation is already accepted or completed.");
        }

        donation.setStatus("ACCEPTED");
        donationRepository.save(donation);

        // Create assignment record
        DonationAssignment assignment = new DonationAssignment();
        assignment.setDonation(donation);
        assignment.setNgo(ngo);
        assignment.setStatus("ACCEPTED");
        assignment.setAssignedAt(LocalDateTime.now());

        // Generate QR code details for pickup verification
        String qrHash = qrService.generateQRCodeHash();
        String qrPath = qrService.generateQRCodeImage(qrHash);
        assignment.setQrCodeHash(qrHash);
        assignment.setQrCodeImagePath(qrPath);

        DonationAssignment savedAssignment = assignmentRepository.save(assignment);

        // Log history
        historyRepository.save(new DonationHistory(donation, "ACCEPTED", ngo.getUser(), "Donation accepted by NGO " + ngo.getOrganizationName()));

        // Notify Donor
        Notification notification = new Notification(donation.getDonor(), 
                "Your Donation was Accepted!", 
                String.format("NGO '%s' has accepted your donation of '%s'. A volunteer will pick it up soon.", 
                        ngo.getOrganizationName(), donation.getFoodName()));
        notificationRepository.save(notification);

        emailService.sendStatusUpdateToDonor(
                donation.getDonor().getEmail(), 
                donation.getDonor().getUsername(), 
                donation.getFoodName(), 
                "ACCEPTED"
        );

        return savedAssignment;
    }

    @Transactional
    public DonationAssignment assignVolunteer(Long assignmentId, Long volunteerId) {
        DonationAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        Volunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found"));

        if (!"AVAILABLE".equals(volunteer.getStatus())) {
            throw new BadRequestException("Volunteer is currently busy or unavailable.");
        }

        assignment.setVolunteer(volunteer);
        assignment.setStatus("ASSIGNED");
        assignmentRepository.save(assignment);

        // Set volunteer busy
        volunteer.setStatus("BUSY");
        volunteerRepository.save(volunteer);

        Donation donation = assignment.getDonation();
        donation.setStatus("ACCEPTED"); // keeping it accepted, wait, status remains accepted until picked up
        donationRepository.save(donation);

        // History log
        historyRepository.save(new DonationHistory(donation, "ACCEPTED", assignment.getNgo().getUser(), "Volunteer " + volunteer.getFullName() + " assigned."));

        // Notify Donor & Volunteer
        emailService.sendAssignmentToVolunteer(
                volunteer.getUser().getEmail(),
                volunteer.getFullName(),
                donation.getFoodName(),
                donation.getPickupLocation()
        );

        Notification vNotification = new Notification(volunteer.getUser(), 
                "New Delivery Task Assigned!", 
                String.format("You are assigned to pick up '%s' from '%s'.", 
                        donation.getFoodName(), donation.getPickupLocation()));
        notificationRepository.save(vNotification);

        return assignment;
    }

    @Transactional
    public DonationAssignment verifyPickup(Long assignmentId, String scannedHash) {
        DonationAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getQrCodeHash().equals(scannedHash)) {
            throw new BadRequestException("Invalid QR Code verification token!");
        }

        assignment.setStatus("PICKED_UP");
        assignment.setPickedUpAt(LocalDateTime.now());
        assignmentRepository.save(assignment);

        Donation donation = assignment.getDonation();
        donation.setStatus("PICKED_UP");
        donationRepository.save(donation);

        // Log history
        historyRepository.save(new DonationHistory(donation, "PICKED_UP", assignment.getVolunteer().getUser(), "Food picked up by volunteer."));

        // In-app notifications
        Notification donorNotif = new Notification(donation.getDonor(), "Food Picked Up!", "Volunteer has picked up your donation.");
        Notification ngoNotif = new Notification(assignment.getNgo().getUser(), "Food Picked Up!", "Volunteer is on the way for delivery.");
        notificationRepository.save(donorNotif);
        notificationRepository.save(ngoNotif);

        // Email updates
        emailService.sendStatusUpdateToDonor(donation.getDonor().getEmail(), donation.getDonor().getUsername(), donation.getFoodName(), "PICKED_UP");

        return assignment;
    }

    @Transactional
    public DonationAssignment verifyDelivery(Long assignmentId, String scannedHash) {
        DonationAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getQrCodeHash().equals(scannedHash)) {
            throw new BadRequestException("Invalid QR Code verification token!");
        }

        assignment.setStatus("DELIVERED");
        assignment.setDeliveredAt(LocalDateTime.now());
        assignmentRepository.save(assignment);

        Donation donation = assignment.getDonation();
        donation.setStatus("DELIVERED");
        donationRepository.save(donation);

        // Reset volunteer status to available
        Volunteer volunteer = assignment.getVolunteer();
        if (volunteer != null) {
            volunteer.setStatus("AVAILABLE");
            volunteerRepository.save(volunteer);
        }

        // Log history
        historyRepository.save(new DonationHistory(donation, "DELIVERED", assignment.getVolunteer().getUser(), "Food delivered to NGO successfully."));

        // Notifications
        Notification donorNotif = new Notification(donation.getDonor(), "Delivery Complete!", "Thank you! Your donation was successfully delivered to the NGO.");
        Notification ngoNotif = new Notification(assignment.getNgo().getUser(), "Delivery Received!", "Volunteer has delivered the food to your center.");
        notificationRepository.save(donorNotif);
        notificationRepository.save(ngoNotif);

        // Email updates
        emailService.sendStatusUpdateToDonor(donation.getDonor().getEmail(), donation.getDonor().getUsername(), donation.getFoodName(), "DELIVERED");

        return assignment;
    }

    // Cron job running every 15 minutes to flag expired items and alert
    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void checkFoodExpirations() {
        LocalDateTime now = LocalDateTime.now();
        
        // 1. Process items that have fully expired
        List<Donation> activeDonations = donationRepository.findByStatus("AVAILABLE");
        for (Donation donation : activeDonations) {
            if (donation.getExpiryTime().isBefore(now)) {
                donation.setStatus("EXPIRED");
                donationRepository.save(donation);
                historyRepository.save(new DonationHistory(donation, "EXPIRED", donation.getDonor(), "System flagged food as expired."));
                
                Notification notif = new Notification(donation.getDonor(), "Listing Expired", "Your food donation listing of '" + donation.getFoodName() + "' has expired.");
                notificationRepository.save(notif);
            } else if (donation.getExpiryTime().isBefore(now.plusHours(1))) {
                // Warning notification 1 hour before expiry
                Notification warn = new Notification(donation.getDonor(), "Listing Expiring Soon!", "Your food donation of '" + donation.getFoodName() + "' is expiring within 1 hour!");
                notificationRepository.save(warn);
            }
        }
    }
}
