package com.foodmanagement.platform.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        if (mailSender == null) {
            logger.warn("JavaMailSender is not configured. Simulating email delivery to: {}. Subject: {}", to, subject);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            logger.info("Email notification sent to {}", to);
        } catch (Exception e) {
            logger.error("Error sending email to {}: {}. Workflow will continue using logs fallback.", to, e.getMessage());
        }
    }

    public void sendDonationAlertToNgo(String ngoEmail, String ngoName, String foodName, String distance) {
        String subject = "Surplus Food Available Near You!";
        String body = String.format("Dear %s,\n\n" +
                "A new food donation (%s) has been posted within %s km of your location.\n" +
                "Please log in to the platform to view details and accept the donation.\n\n" +
                "Best regards,\n" +
                "Food Waste Reduction Platform Team", ngoName, foodName, distance);
        sendEmail(ngoEmail, subject, body);
    }

    public void sendStatusUpdateToDonor(String donorEmail, String donorName, String foodName, String status) {
        String subject = "Donation Status Update - " + foodName;
        String body = String.format("Dear %s,\n\n" +
                "The status of your donation (%s) has been updated to: %s.\n\n" +
                "Thank you for your generosity!\n\n" +
                "Best regards,\n" +
                "Food Waste Reduction Platform Team", donorName, foodName, status);
        sendEmail(donorEmail, subject, body);
    }

    public void sendAssignmentToVolunteer(String volunteerEmail, String volunteerName, String foodName, String pickupAddr) {
        String subject = "New Food Pickup Assignment!";
        String body = String.format("Dear %s,\n\n" +
                "You have been assigned to pick up a food donation (%s).\n" +
                "Pickup Location: %s\n" +
                "Please log in to your dashboard to view the routing map and QR verification codes.\n\n" +
                "Best regards,\n" +
                "Food Waste Reduction Platform Team", volunteerName, foodName, pickupAddr);
        sendEmail(volunteerEmail, subject, body);
    }
}
