package com.migration.tracker.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ExecSummaryResponse {
    private double overallProgressPercent;
    private long totalModules;
    private long migratedModules;
    private long validatedModules;
    private long decommissionedModules;
    private List<WaveRagSummary> waveRagSummaries;
    private List<BurndownPoint> burndownData;
    private List<BudgetPoint> budgetData;
    private long openEscalations;
    private long slaBreachedEscalations;
    private List<RiskSummary> topRisks;
    private boolean budgetAlertTriggered;

    @Data @Builder
    public static class WaveRagSummary {
        private Long waveId;
        private String waveName;
        private String ragStatus;
        private String plannedStartDate;
        private String plannedEndDate;
        private String actualStartDate;
        private String actualEndDate;
        private long totalModules;
        private long completedModules;
    }

    @Data @Builder
    public static class BurndownPoint {
        private String date;
        private long planned;
        private long actual;
    }

    @Data @Builder
    public static class BudgetPoint {
        private String month;
        private double planned;
        private double actual;
        private double cumulativePlanned;
        private double cumulativeActual;
    }

    @Data @Builder
    public static class RiskSummary {
        private Long id;
        private String severity;
        private String description;
        private String mitigation;
        private String owner;
        private String status;
    }
}
