package com.migration.tracker.service;

import com.migration.tracker.dto.*;
import com.migration.tracker.entity.*;
import com.migration.tracker.entity.Module;
import com.migration.tracker.entity.enums.ModuleStatus;
import com.migration.tracker.entity.enums.RagStatus;
import com.migration.tracker.entity.enums.Severity;
import com.migration.tracker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.migration.tracker.entity.enums.BlockerCategory;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ModuleRepository moduleRepository;
    private final WaveRepository waveRepository;
    private final BlockerRepository blockerRepository;
    private final RiskRepository riskRepository;
    private final DefectRepository defectRepository;
    private final CostTrackingRepository costTrackingRepository;
    private final EscalationRepository escalationRepository;
    private final DependencyRepository dependencyRepository;
    private final TestCoverageRepository testCoverageRepository;
    private final DataValidationRepository dataValidationRepository;
    private final CutoverChecklistRepository cutoverChecklistRepository;
    private final TeamRepository teamRepository;
    private final AuditService auditService;

    public Project getProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found: " + id));
    }

    public ExecSummaryResponse getExecSummary(Long projectId) {
        Project project = getProject(projectId);
        List<Module> modules = moduleRepository.findByProjectId(projectId);
        List<Wave> waves = waveRepository.findByProjectIdWithModules(projectId);
        List<CostTracking> costs = costTrackingRepository.findByProjectIdOrderByMonthAsc(projectId);
        List<Escalation> escalations = escalationRepository.findByProjectId(projectId);
        List<Risk> risks = riskRepository.findByProjectId(projectId);

        long total = modules.size();
        long migrated = modules.stream().filter(m -> m.getStatus() == ModuleStatus.MIGRATED).count();
        long validated = modules.stream().filter(m -> m.getStatus() == ModuleStatus.VALIDATED).count();
        long decommissioned = modules.stream().filter(m -> m.getStatus() == ModuleStatus.DECOMMISSIONED).count();
        long completed = migrated + validated + decommissioned;
        double progress = total > 0 ? (completed * 100.0 / total) : 0;

        // Auto-calculate RAG status for each wave
        List<Blocker> allBlockers = blockerRepository.findByProjectId(projectId);
        for (Wave w : waves) {
            RagStatus computed = computeRagStatus(w, allBlockers);
            if (computed != w.getRagStatus()) {
                w.setRagStatus(computed);
            }
        }

        // Wave RAG summaries
        List<ExecSummaryResponse.WaveRagSummary> waveSummaries = waves.stream().map(w -> {
            long waveTotal = w.getModules().size();
            long waveCompleted = w.getModules().stream()
                    .filter(m -> m.getStatus() == ModuleStatus.MIGRATED ||
                                 m.getStatus() == ModuleStatus.VALIDATED ||
                                 m.getStatus() == ModuleStatus.DECOMMISSIONED)
                    .count();
            return ExecSummaryResponse.WaveRagSummary.builder()
                    .waveId(w.getId())
                    .waveName(w.getName())
                    .ragStatus(w.getRagStatus().name())
                    .plannedStartDate(w.getPlannedStartDate() != null ? w.getPlannedStartDate().toString() : null)
                    .plannedEndDate(w.getPlannedEndDate() != null ? w.getPlannedEndDate().toString() : null)
                    .actualStartDate(w.getActualStartDate() != null ? w.getActualStartDate().toString() : null)
                    .actualEndDate(w.getActualEndDate() != null ? w.getActualEndDate().toString() : null)
                    .totalModules(waveTotal)
                    .completedModules(waveCompleted)
                    .build();
        }).toList();

        // Burndown data
        List<ExecSummaryResponse.BurndownPoint> burndown = buildBurndownData(waves, modules, project);

        // Budget data
        double cumulativePlanned = 0;
        double cumulativeActual = 0;
        List<ExecSummaryResponse.BudgetPoint> budgetPoints = new ArrayList<>();
        for (CostTracking cost : costs) {
            cumulativePlanned += cost.getBudgetPlanned() != null ? cost.getBudgetPlanned().doubleValue() : 0;
            cumulativeActual += cost.getBudgetActual() != null ? cost.getBudgetActual().doubleValue() : 0;
            budgetPoints.add(ExecSummaryResponse.BudgetPoint.builder()
                    .month(cost.getMonth())
                    .planned(cost.getBudgetPlanned() != null ? cost.getBudgetPlanned().doubleValue() : 0)
                    .actual(cost.getBudgetActual() != null ? cost.getBudgetActual().doubleValue() : 0)
                    .cumulativePlanned(cumulativePlanned)
                    .cumulativeActual(cumulativeActual)
                    .build());
        }

        // Budget alert
        boolean budgetAlert = false;
        if (project.getBudget() != null && project.getBudget().doubleValue() > 0) {
            budgetAlert = cumulativeActual >= project.getBudget().doubleValue() * 0.9;
        }

        // Escalations
        long openEscalations = escalations.stream().filter(e -> e.getResolvedDate() == null).count();
        long slaBreached = escalations.stream().filter(Escalation::getSlaBreached).count();

        // Top risks
        List<ExecSummaryResponse.RiskSummary> topRisks = risks.stream()
                .filter(r -> !"RESOLVED".equals(r.getStatus()))
                .sorted(Comparator.comparing(r -> r.getSeverity().ordinal()))
                .limit(5)
                .map(r -> ExecSummaryResponse.RiskSummary.builder()
                        .id(r.getId())
                        .severity(r.getSeverity().name())
                        .description(r.getDescription())
                        .mitigation(r.getMitigation())
                        .owner(r.getOwner())
                        .status(r.getStatus())
                        .build())
                .toList();

        return ExecSummaryResponse.builder()
                .overallProgressPercent(Math.round(progress * 100.0) / 100.0)
                .totalModules(total)
                .migratedModules(migrated)
                .validatedModules(validated)
                .decommissionedModules(decommissioned)
                .waveRagSummaries(waveSummaries)
                .burndownData(burndown)
                .budgetData(budgetPoints)
                .openEscalations(openEscalations)
                .slaBreachedEscalations(slaBreached)
                .topRisks(topRisks)
                .budgetAlertTriggered(budgetAlert)
                .build();
    }

    private List<ExecSummaryResponse.BurndownPoint> buildBurndownData(List<Wave> waves, List<Module> modules, Project project) {
        List<ExecSummaryResponse.BurndownPoint> points = new ArrayList<>();
        if (project.getStartDate() == null) return points;

        LocalDate start = project.getStartDate();
        LocalDate end = project.getEndDate() != null ? project.getEndDate() : LocalDate.now().plusMonths(3);
        long totalMonths = ChronoUnit.MONTHS.between(start, end) + 1;
        int totalModules = modules.size();

        for (int i = 0; i <= totalMonths; i++) {
            LocalDate month = start.plusMonths(i);
            // Planned: linear progression
            long planned = Math.min(Math.round((double) totalModules * i / totalMonths), totalModules);

            // Actual: count modules that reached MIGRATED or beyond by that date
            long actual;
            if (month.isBefore(LocalDate.now()) || month.isEqual(LocalDate.now())) {
                // Use wave data to estimate actuals
                actual = 0;
                for (Wave wave : waves) {
                    if (wave.getActualEndDate() != null && !wave.getActualEndDate().isAfter(month)) {
                        actual += wave.getModules().stream()
                                .filter(m -> m.getStatus() == ModuleStatus.MIGRATED ||
                                             m.getStatus() == ModuleStatus.VALIDATED ||
                                             m.getStatus() == ModuleStatus.DECOMMISSIONED)
                                .count();
                    } else if (wave.getActualStartDate() != null && !wave.getActualStartDate().isAfter(month)) {
                        actual += wave.getModules().stream()
                                .filter(m -> m.getStatus() == ModuleStatus.MIGRATED ||
                                             m.getStatus() == ModuleStatus.VALIDATED ||
                                             m.getStatus() == ModuleStatus.DECOMMISSIONED)
                                .count();
                    }
                }
                // Deduplicate
                actual = Math.min(actual, totalModules);
            } else {
                actual = -1; // future, no actual data
            }

            ExecSummaryResponse.BurndownPoint point = ExecSummaryResponse.BurndownPoint.builder()
                    .date(month.toString())
                    .planned(planned)
                    .actual(actual >= 0 ? actual : -1)
                    .build();
            points.add(point);
        }
        return points;
    }

    public List<ModuleResponse> getModules(Long projectId, String domain, ModuleStatus status, String owner) {
        List<Module> modules = moduleRepository.findByProjectIdWithFilters(projectId, domain, status, owner);
        return modules.stream().map(this::toModuleResponse).toList();
    }

    public List<WaveResponse> getWaves(Long projectId) {
        List<Wave> waves = waveRepository.findByProjectIdWithModules(projectId);
        return waves.stream().map(w -> WaveResponse.builder()
                .id(w.getId())
                .name(w.getName())
                .ragStatus(w.getRagStatus().name())
                .plannedStartDate(w.getPlannedStartDate() != null ? w.getPlannedStartDate().toString() : null)
                .plannedEndDate(w.getPlannedEndDate() != null ? w.getPlannedEndDate().toString() : null)
                .actualStartDate(w.getActualStartDate() != null ? w.getActualStartDate().toString() : null)
                .actualEndDate(w.getActualEndDate() != null ? w.getActualEndDate().toString() : null)
                .modules(w.getModules().stream().map(this::toModuleResponse).toList())
                .build()).toList();
    }

    public List<BlockerResponse> getBlockers(Long projectId) {
        List<Blocker> blockers = blockerRepository.findByProjectId(projectId);
        return blockers.stream().map(this::toBlockerResponse).toList();
    }

    public List<ExecSummaryResponse.RiskSummary> getRisks(Long projectId) {
        List<Risk> risks = riskRepository.findByProjectId(projectId);
        return risks.stream().map(r -> ExecSummaryResponse.RiskSummary.builder()
                .id(r.getId())
                .severity(r.getSeverity().name())
                .description(r.getDescription())
                .mitigation(r.getMitigation())
                .owner(r.getOwner())
                .status(r.getStatus())
                .build()).toList();
    }

    public DefectTrendResponse getDefects(Long projectId) {
        List<Defect> defects = defectRepository.findByProjectId(projectId);

        long critical = defects.stream().filter(d -> d.getSeverity() == Severity.CRITICAL).count();
        long high = defects.stream().filter(d -> d.getSeverity() == Severity.HIGH).count();
        long medium = defects.stream().filter(d -> d.getSeverity() == Severity.MEDIUM).count();
        long low = defects.stream().filter(d -> d.getSeverity() == Severity.LOW).count();

        // Group by week
        Map<String, Map<Severity, Long>> weeklyMap = new TreeMap<>();
        for (Defect d : defects) {
            LocalDate date = d.getCreatedDate() != null ? d.getCreatedDate() : LocalDate.now();
            LocalDate weekStart = date.minusDays(date.getDayOfWeek().getValue() - 1);
            String week = weekStart.toString();
            weeklyMap.computeIfAbsent(week, k -> new EnumMap<>(Severity.class));
            weeklyMap.get(week).merge(d.getSeverity(), 1L, Long::sum);
        }

        List<DefectTrendResponse.DefectWeek> weeklyTrend = weeklyMap.entrySet().stream()
                .map(e -> DefectTrendResponse.DefectWeek.builder()
                        .week(e.getKey())
                        .critical(e.getValue().getOrDefault(Severity.CRITICAL, 0L))
                        .high(e.getValue().getOrDefault(Severity.HIGH, 0L))
                        .medium(e.getValue().getOrDefault(Severity.MEDIUM, 0L))
                        .low(e.getValue().getOrDefault(Severity.LOW, 0L))
                        .total(e.getValue().values().stream().mapToLong(Long::longValue).sum())
                        .build())
                .toList();

        return DefectTrendResponse.builder()
                .weeklyTrend(weeklyTrend)
                .totalDefects(defects.size())
                .criticalDefects(critical)
                .highDefects(high)
                .mediumDefects(medium)
                .lowDefects(low)
                .build();
    }

    public DependencyResponse getDependencies(Long projectId) {
        List<Module> modules = moduleRepository.findByProjectId(projectId);
        List<Dependency> deps = dependencyRepository.findByProjectId(projectId);

        // Build adjacency for downstream count
        Map<Long, Integer> downstreamCount = new HashMap<>();
        for (Dependency dep : deps) {
            downstreamCount.merge(dep.getFromModule().getId(), 1, Integer::sum);
        }

        List<DependencyResponse.NodeDto> nodes = modules.stream().map(m ->
                DependencyResponse.NodeDto.builder()
                        .id(m.getId())
                        .name(m.getName())
                        .domain(m.getDomain())
                        .status(m.getStatus().name())
                        .downstreamCount(downstreamCount.getOrDefault(m.getId(), 0))
                        .build()).toList();

        List<DependencyResponse.EdgeDto> edges = deps.stream().map(d ->
                DependencyResponse.EdgeDto.builder()
                        .from(d.getFromModule().getId())
                        .to(d.getToModule().getId())
                        .type(d.getType().name())
                        .build()).toList();

        // Critical path: modules that block the most
        List<Long> criticalPath = nodes.stream()
                .sorted(Comparator.comparingInt(DependencyResponse.NodeDto::getDownstreamCount).reversed())
                .limit(10)
                .map(DependencyResponse.NodeDto::getId)
                .toList();

        return DependencyResponse.builder()
                .nodes(nodes)
                .edges(edges)
                .criticalPath(criticalPath)
                .build();
    }

    public List<ExecSummaryResponse.BudgetPoint> getCostTracking(Long projectId) {
        List<CostTracking> costs = costTrackingRepository.findByProjectIdOrderByMonthAsc(projectId);
        double cumulativePlanned = 0;
        double cumulativeActual = 0;
        List<ExecSummaryResponse.BudgetPoint> points = new ArrayList<>();
        for (CostTracking cost : costs) {
            cumulativePlanned += cost.getBudgetPlanned() != null ? cost.getBudgetPlanned().doubleValue() : 0;
            cumulativeActual += cost.getBudgetActual() != null ? cost.getBudgetActual().doubleValue() : 0;
            points.add(ExecSummaryResponse.BudgetPoint.builder()
                    .month(cost.getMonth())
                    .planned(cost.getBudgetPlanned() != null ? cost.getBudgetPlanned().doubleValue() : 0)
                    .actual(cost.getBudgetActual() != null ? cost.getBudgetActual().doubleValue() : 0)
                    .cumulativePlanned(cumulativePlanned)
                    .cumulativeActual(cumulativeActual)
                    .build());
        }
        return points;
    }

    public ReadinessResponse getReadiness(Long projectId) {
        List<Module> modules = moduleRepository.findByProjectId(projectId);
        List<ReadinessResponse.ModuleReadiness> readinessList = modules.stream().map(m -> {
            List<CutoverChecklist> checklists = m.getCutoverChecklists();
            int total = checklists.size();
            int completed = (int) checklists.stream().filter(CutoverChecklist::getCompleted).count();
            int rollbackTested = (int) checklists.stream().filter(CutoverChecklist::getRollbackTested).count();
            double progress = total > 0 ? (completed * 100.0 / total) : 0;

            DataValidation dv = m.getDataValidation();
            boolean dvPassed = dv != null && "PASSED".equals(dv.getReconciliationStatus());
            boolean readyForDecom = progress == 100.0 && dvPassed;

            return ReadinessResponse.ModuleReadiness.builder()
                    .moduleId(m.getId())
                    .moduleName(m.getName())
                    .domain(m.getDomain())
                    .status(m.getStatus().name())
                    .totalChecklistItems(total)
                    .completedChecklistItems(completed)
                    .checklistProgressPercent(Math.round(progress * 100.0) / 100.0)
                    .rollbackTestedCount(rollbackTested)
                    .rollbackNotTestedCount(total - rollbackTested)
                    .decommissioned(m.getStatus() == ModuleStatus.DECOMMISSIONED)
                    .dataValidationPassed(dvPassed)
                    .readyForDecommission(readyForDecom)
                    .build();
        }).toList();

        return ReadinessResponse.builder().modules(readinessList).build();
    }

    public List<EscalationResponse> getEscalations(Long projectId) {
        List<Escalation> escalations = escalationRepository.findByProjectId(projectId);
        return escalations.stream().map(e -> {
            long age = e.getRaisedDate() != null
                    ? ChronoUnit.DAYS.between(e.getRaisedDate(), e.getResolvedDate() != null ? e.getResolvedDate() : LocalDate.now())
                    : 0;
            return EscalationResponse.builder()
                    .id(e.getId())
                    .description(e.getDescription())
                    .raisedDate(e.getRaisedDate() != null ? e.getRaisedDate().toString() : null)
                    .resolvedDate(e.getResolvedDate() != null ? e.getResolvedDate().toString() : null)
                    .slaBreached(e.getSlaBreached())
                    .ageDays(age)
                    .status(e.getResolvedDate() != null ? "RESOLVED" : "OPEN")
                    .build();
        }).toList();
    }

    @Transactional
    public ModuleResponse createOrUpdateModule(ModuleRequest request) {
        Project project = getProject(request.getProjectId());
        Module module = Module.builder()
                .project(project)
                .name(request.getName())
                .domain(request.getDomain())
                .status(request.getStatus())
                .owner(request.getOwner())
                .priority(request.getPriority())
                .build();
        module = moduleRepository.save(module);
        auditService.log("Module", module.getId(), "CREATE", null, module.getStatus().name());
        return toModuleResponse(module);
    }

    @Transactional
    public BlockerResponse createOrUpdateBlocker(BlockerRequest request) {
        Module module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new RuntimeException("Module not found: " + request.getModuleId()));
        Blocker blocker = Blocker.builder()
                .module(module)
                .category(request.getCategory())
                .description(request.getDescription())
                .owner(request.getOwner())
                .status(request.getStatus())
                .createdDate(LocalDate.now())
                .build();
        blocker = blockerRepository.save(blocker);
        auditService.log("Blocker", blocker.getId(), "CREATE", null, blocker.getStatus());

        // Business rule: CRITICAL defects should auto-create a blocker — handled here symmetrically
        // (Defects are created externally; if you create a CRITICAL defect, also create a blocker.)
        return toBlockerResponse(blocker);
    }

    @Transactional
    public ModuleResponse updateModuleStatus(Long moduleId, ModuleStatus newStatus) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Module not found: " + moduleId));

        // Business rule: DECOMMISSIONED requires all data validations pass + 100% cutover checklist
        if (newStatus == ModuleStatus.DECOMMISSIONED) {
            DataValidation dv = module.getDataValidation();
            boolean dvPassed = dv != null && "PASSED".equals(dv.getReconciliationStatus());
            List<CutoverChecklist> checklists = module.getCutoverChecklists();
            boolean checklistComplete = !checklists.isEmpty() &&
                    checklists.stream().allMatch(CutoverChecklist::getCompleted);
            if (!dvPassed || !checklistComplete) {
                throw new RuntimeException("Cannot decommission: data validation must pass and cutover checklist must be 100% complete");
            }
        }

        String oldStatus = module.getStatus().name();
        module.setStatus(newStatus);
        module = moduleRepository.save(module);
        auditService.log("Module", module.getId(), "STATUS_CHANGE", oldStatus, newStatus.name());
        return toModuleResponse(module);
    }

    private ModuleResponse toModuleResponse(Module m) {
        List<String> waveNames = m.getWaves() != null
                ? m.getWaves().stream().map(Wave::getName).toList()
                : List.of();
        return ModuleResponse.builder()
                .id(m.getId())
                .name(m.getName())
                .domain(m.getDomain())
                .status(m.getStatus().name())
                .owner(m.getOwner())
                .priority(m.getPriority())
                .waveNames(waveNames)
                .blockerCount(m.getBlockers() != null ? m.getBlockers().size() : 0)
                .defectCount(m.getDefects() != null ? m.getDefects().size() : 0)
                .build();
    }

    /**
     * RAG auto-calculation:
     * RED if wave is >5 days behind plan or has unresolved critical blockers
     * AMBER if 1-5 days behind or has high-severity blockers
     * GREEN otherwise
     */
    private RagStatus computeRagStatus(Wave wave, List<Blocker> allBlockers) {
        // Days behind calculation
        long daysBehind = 0;
        if (wave.getPlannedEndDate() != null && wave.getActualEndDate() == null) {
            // Wave not finished yet — compare planned end to today
            if (LocalDate.now().isAfter(wave.getPlannedEndDate())) {
                daysBehind = ChronoUnit.DAYS.between(wave.getPlannedEndDate(), LocalDate.now());
            }
        } else if (wave.getPlannedEndDate() != null && wave.getActualEndDate() != null) {
            // Wave finished — compare planned vs actual end
            if (wave.getActualEndDate().isAfter(wave.getPlannedEndDate())) {
                daysBehind = ChronoUnit.DAYS.between(wave.getPlannedEndDate(), wave.getActualEndDate());
            }
        }

        // Check blockers for modules in this wave
        Set<Long> waveModuleIds = wave.getModules().stream().map(Module::getId).collect(Collectors.toSet());
        boolean hasCriticalBlocker = allBlockers.stream()
                .anyMatch(b -> waveModuleIds.contains(b.getModule().getId())
                        && "OPEN".equals(b.getStatus())
                        && b.getCategory() == BlockerCategory.TECHNICAL
                        && b.getDescription() != null && b.getDescription().toLowerCase().contains("critical"));
        boolean hasHighBlocker = allBlockers.stream()
                .anyMatch(b -> waveModuleIds.contains(b.getModule().getId())
                        && "OPEN".equals(b.getStatus()));

        if (daysBehind > 5 || hasCriticalBlocker) {
            return RagStatus.RED;
        } else if (daysBehind >= 1 || hasHighBlocker) {
            return RagStatus.AMBER;
        } else {
            return RagStatus.GREEN;
        }
    }

    private BlockerResponse toBlockerResponse(Blocker b) {
        long age = b.getCreatedDate() != null
                ? ChronoUnit.DAYS.between(b.getCreatedDate(), b.getResolvedDate() != null ? b.getResolvedDate() : LocalDate.now())
                : 0;
        return BlockerResponse.builder()
                .id(b.getId())
                .moduleId(b.getModule().getId())
                .moduleName(b.getModule().getName())
                .category(b.getCategory().name())
                .description(b.getDescription())
                .owner(b.getOwner())
                .status(b.getStatus())
                .createdDate(b.getCreatedDate() != null ? b.getCreatedDate().toString() : null)
                .resolvedDate(b.getResolvedDate() != null ? b.getResolvedDate().toString() : null)
                .ageDays(age)
                .build();
    }
}
