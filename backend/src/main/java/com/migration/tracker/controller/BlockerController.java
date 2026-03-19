package com.migration.tracker.controller;

import com.migration.tracker.dto.BlockerRequest;
import com.migration.tracker.dto.BlockerResponse;
import com.migration.tracker.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/blockers")
@RequiredArgsConstructor
public class BlockerController {

    private final ProjectService projectService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DELIVERY_LEAD')")
    public ResponseEntity<BlockerResponse> createBlocker(@Valid @RequestBody BlockerRequest request) {
        return ResponseEntity.ok(projectService.createOrUpdateBlocker(request));
    }
}
