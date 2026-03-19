package com.migration.tracker.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DefectTrendResponse {
    private List<DefectWeek> weeklyTrend;
    private long totalDefects;
    private long criticalDefects;
    private long highDefects;
    private long mediumDefects;
    private long lowDefects;

    @Data @Builder
    public static class DefectWeek {
        private String week;
        private long critical;
        private long high;
        private long medium;
        private long low;
        private long total;
    }
}
