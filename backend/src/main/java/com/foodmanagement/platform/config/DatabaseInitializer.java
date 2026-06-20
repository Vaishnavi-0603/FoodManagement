package com.foodmanagement.platform.config;

import com.foodmanagement.platform.entity.*;
import com.foodmanagement.platform.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NGORepository ngoRepository;

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Seed Roles
        if (roleRepository.count() == 0) {
            roleRepository.save(new Role(RoleEnum.ROLE_ADMIN));
            roleRepository.save(new Role(RoleEnum.ROLE_DONOR));
            roleRepository.save(new Role(RoleEnum.ROLE_NGO));
            roleRepository.save(new Role(RoleEnum.ROLE_VOLUNTEER));
        }

        Role adminRole = roleRepository.findByName(RoleEnum.ROLE_ADMIN).orElse(null);
        Role donorRole = roleRepository.findByName(RoleEnum.ROLE_DONOR).orElse(null);
        Role ngoRole = roleRepository.findByName(RoleEnum.ROLE_NGO).orElse(null);
        Role volunteerRole = roleRepository.findByName(RoleEnum.ROLE_VOLUNTEER).orElse(null);

        // 2. Seed Default Admin User
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@platform.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setPhone("1234567890");
            admin.setRole(adminRole);
            admin.setActive(true);
            userRepository.save(admin);
        }

        // 3. Seed Mock Donor
        if (!userRepository.existsByUsername("donor1")) {
            User donorUser = new User();
            donorUser.setUsername("donor1");
            donorUser.setEmail("donor1@platform.com");
            donorUser.setPassword(passwordEncoder.encode("password"));
            donorUser.setPhone("9876543210");
            donorUser.setRole(donorRole);
            donorUser.setActive(true);
            userRepository.save(donorUser);

            // Create a sample donation
            Donation donation = new Donation();
            donation.setDonor(donorUser);
            donation.setFoodName("Fresh Veg Salad & Buns");
            donation.setQuantity("10 Servings");
            donation.setFoodType("VEG");
            donation.setPrepTime(LocalDateTime.now().minusHours(2));
            donation.setExpiryTime(LocalDateTime.now().plusHours(4));
            donation.setPickupLocation("Manhattan Central Plaza, NY");
            donation.setLatitude(40.7128); // NY coordinates
            donation.setLongitude(-74.0060);
            donation.setStatus("AVAILABLE");
            donationRepository.save(donation);
        }

        // 4. Seed Mock Approved NGO
        if (!userRepository.existsByUsername("ngo_help")) {
            User ngoUser = new User();
            ngoUser.setUsername("ngo_help");
            ngoUser.setEmail("ngo@platform.com");
            ngoUser.setPassword(passwordEncoder.encode("password"));
            ngoUser.setPhone("5551112222");
            ngoUser.setRole(ngoRole);
            ngoUser.setActive(true);
            userRepository.save(ngoUser);

            NGO ngo = new NGO();
            ngo.setUser(ngoUser);
            ngo.setOrganizationName("City Food Rescue NGO");
            ngo.setRegistrationNumber("NGO-99881");
            ngo.setAddress("Lexington Ave, NYC");
            ngo.setContactPerson("Sarah Jenkins");
            ngo.setStatus("APPROVED");
            ngo.setLatitude(40.7188); // 0.7 km away from donor
            ngo.setLongitude(-74.0080);
            ngoRepository.save(ngo);
        }

        // 5. Seed Mock Pending NGO (for Admin approval demonstration)
        if (!userRepository.existsByUsername("ngo_new")) {
            User ngoUserPending = new User();
            ngoUserPending.setUsername("ngo_new");
            ngoUserPending.setEmail("pending_ngo@platform.com");
            ngoUserPending.setPassword(passwordEncoder.encode("password"));
            ngoUserPending.setPhone("5553334444");
            ngoUserPending.setRole(ngoRole);
            ngoUserPending.setActive(true);
            userRepository.save(ngoUserPending);

            NGO ngoPending = new NGO();
            ngoPending.setUser(ngoUserPending);
            ngoPending.setOrganizationName("Hope and Meals NGO");
            ngoPending.setRegistrationNumber("NGO-PEND-22");
            ngoPending.setAddress("Queens Blvd, NYC");
            ngoPending.setContactPerson("Michael Green");
            ngoPending.setStatus("PENDING");
            ngoPending.setLatitude(40.7282);
            ngoPending.setLongitude(-73.7949);
            ngoRepository.save(ngoPending);
        }

        // 6. Seed Mock Volunteer
        if (!userRepository.existsByUsername("volunteer1")) {
            User volUser = new User();
            volUser.setUsername("volunteer1");
            volUser.setEmail("volunteer@platform.com");
            volUser.setPassword(passwordEncoder.encode("password"));
            volUser.setPhone("9998887777");
            volUser.setRole(volunteerRole);
            volUser.setActive(true);
            userRepository.save(volUser);

            Volunteer volunteer = new Volunteer();
            volunteer.setUser(volUser);
            volunteer.setFullName("David Miller");
            volunteer.setAddress("Broadway, NYC");
            volunteer.setStatus("AVAILABLE");
            volunteer.setLatitude(40.7158); // 0.4 km away from donor
            volunteer.setLongitude(-74.0020);
            volunteerRepository.save(volunteer);
        }
    }
}
