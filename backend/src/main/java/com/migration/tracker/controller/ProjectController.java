package com.migration.tracker.controller;

import com.migration.tracker.dto.*;
import com.migration.tracker.entity.enums.ModuleStatus;
import com.migration.tracker.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping("/{id}/summary")
    public ResponseEntity<ExecSummaryResponse> getExecSummary(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getExecSummary(id));
    }

    @GetMapping("/{id}/modules")
    public ResponseEntity<List<ModuleResponse>> getModules(
            @PathVariable Long id,
            @RequestParam(required = false) String domain,
            @RequestParam(required = false) ModuleStatus status,
            @RequestParam(required = false) String owner) {
        return ResponseEntity.ok(projectService.getModules(id, domain, status, owner));
    }

    @GetMapping("/{id}/waves")
    public ResponseEntity<List<WaveResponse>> getWaves(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getWaves(id));
    }

    @GetMapping("/{id}/blockers")
    public ResponseEntity<List<BlockerResponse>> getBlockers(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getBlockers(id));
    }

    @GetMapping("/{id}/risks")
    public ResponseEntity<List<ExecSummaryResponse.RiskSummary>> getRisks(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getRisks(id));
    }

    @GetMapping("/{id}/defects")
    public ResponseEntity<DefectTrendResponse> getDefects(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getDefects(id));
    }

    @GetMapping("/{id}/dependencies")
    public ResponseEntity<DependencyResponse> getDependencies(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getDependencies(id));
    }

    @GetMapping("/{id}/cost")
    public ResponseEntity<List<ExecSummaryResponse.BudgetPoint>> getCost(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getCostTracking(id));
    }

    @GetMapping("/{id}/readiness")
    public ResponseEntity<ReadinessResponse> getReadiness(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getReadiness(id));
    }

    @GetMapping("/{id}/escalations")
    public ResponseEntity<List<EscalationResponse>> getEscalations(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getEscalations(id));
    }
}
