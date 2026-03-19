package com.migration.tracker.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ReadinessResponse {
    private List<ModuleReadiness> modules;

    @Data @Builder
    public static class ModuleReadiness {
        private Long moduleId;
        private String moduleName;
        private String domain;
        private String status;
        private int totalChecklistItems;
        private int completedChecklistItems;
        private double checklistProgressPercent;
        private int rollbackTestedCount;
        private int rollbackNotTestedCount;
        private boolean decommissioned;
        private boolean dataValidationPassed;
        private boolean readyForDecommission;
    }
}
