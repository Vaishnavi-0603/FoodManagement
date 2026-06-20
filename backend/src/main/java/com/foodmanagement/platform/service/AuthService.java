package com.foodmanagement.platform.service;

import com.foodmanagement.platform.dto.JwtAuthenticationResponse;
import com.foodmanagement.platform.dto.LoginRequest;
import com.foodmanagement.platform.dto.SignUpRequest;
import com.foodmanagement.platform.entity.*;
import com.foodmanagement.platform.exception.BadRequestException;
import com.foodmanagement.platform.repository.NGORepository;
import com.foodmanagement.platform.repository.RoleRepository;
import com.foodmanagement.platform.repository.UserRepository;
import com.foodmanagement.platform.repository.VolunteerRepository;
import com.foodmanagement.platform.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private NGORepository ngoRepository;

    @Autowired
    private VolunteerRepository volunteerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public JwtAuthenticationResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(loginRequest.getUsernameOrEmail())
                .orElseGet(() -> userRepository.findByEmail(loginRequest.getUsernameOrEmail()).orElseThrow());

        return new JwtAuthenticationResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), user.getRole().getName().name());
    }

    @Transactional
    public User registerUser(SignUpRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new BadRequestException("Email Address already in use!");
        }

        // Create user profile
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setPhone(signUpRequest.getPhone());

        // Resolve role
        String roleStr = signUpRequest.getRole().toUpperCase();
        RoleEnum roleEnum = switch (roleStr) {
            case "ADMIN" -> RoleEnum.ROLE_ADMIN;
            case "DONOR" -> RoleEnum.ROLE_DONOR;
            case "NGO" -> RoleEnum.ROLE_NGO;
            case "VOLUNTEER" -> RoleEnum.ROLE_VOLUNTEER;
            default -> throw new BadRequestException("Invalid user role specified");
        };

        Role userRole = roleRepository.findByName(roleEnum)
                .orElseThrow(() -> new BadRequestException("User Role not found."));
        user.setRole(userRole);

        // Save base user
        User savedUser = userRepository.save(user);

        // Role specific profile setup
        if (roleEnum == RoleEnum.ROLE_NGO) {
            if (signUpRequest.getOrganizationName() == null || signUpRequest.getRegistrationNumber() == null) {
                throw new BadRequestException("Organization name and registration number are required for NGOs");
            }
            NGO ngo = new NGO();
            ngo.setUser(savedUser);
            ngo.setOrganizationName(signUpRequest.getOrganizationName());
            ngo.setRegistrationNumber(signUpRequest.getRegistrationNumber());
            ngo.setContactPerson(signUpRequest.getContactPerson() != null ? signUpRequest.getContactPerson() : signUpRequest.getUsername());
            ngo.setAddress(signUpRequest.getAddress() != null ? signUpRequest.getAddress() : "Remote");
            ngo.setLatitude(signUpRequest.getLatitude() != null ? signUpRequest.getLatitude() : 40.7128);
            ngo.setLongitude(signUpRequest.getLongitude() != null ? signUpRequest.getLongitude() : -74.0060);
            ngo.setStatus("PENDING"); // NGOs require admin approval
            ngoRepository.save(ngo);
        } else if (roleEnum == RoleEnum.ROLE_VOLUNTEER) {
            Volunteer volunteer = new Volunteer();
            volunteer.setUser(savedUser);
            volunteer.setFullName(signUpRequest.getFullName() != null ? signUpRequest.getFullName() : signUpRequest.getUsername());
            volunteer.setAddress(signUpRequest.getAddress() != null ? signUpRequest.getAddress() : "Remote");
            volunteer.setStatus("AVAILABLE");
            volunteer.setLatitude(signUpRequest.getLatitude() != null ? signUpRequest.getLatitude() : 40.7128);
            volunteer.setLongitude(signUpRequest.getLongitude() != null ? signUpRequest.getLongitude() : -74.0060);
            volunteerRepository.save(volunteer);
        }

        return savedUser;
    }
}
