package com.foodmanagement.platform.controller;

import com.foodmanagement.platform.entity.NGO;
import com.foodmanagement.platform.security.UserPrincipal;
import com.foodmanagement.platform.service.NGOService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ngos")
public class NGOController {

    @Autowired
    private NGOService ngoService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllNgos() {
        return ResponseEntity.ok(ngoService.getAllNgos());
    }

    @GetMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getNgosByStatus(@RequestParam("status") String status) {
        return ResponseEntity.ok(ngoService.getNgosByStatus(status));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveNgo(@PathVariable Long id) {
        return ResponseEntity.ok(ngoService.updateNgoStatus(id, "APPROVED"));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectNgo(@PathVariable Long id) {
        return ResponseEntity.ok(ngoService.updateNgoStatus(id, "REJECTED"));
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('NGO')")
    public ResponseEntity<?> getNgoProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        NGO ngo = ngoService.getNgoByUserId(currentUser.getId());
        return ResponseEntity.ok(ngo);
    }
}
