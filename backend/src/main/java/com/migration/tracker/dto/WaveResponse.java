package com.migration.tracker.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class WaveResponse {
    private Long id;
    private String name;
    private String ragStatus;
    private String plannedStartDate;
    private String plannedEndDate;
    private String actualStartDate;
    private String actualEndDate;
    private List<ModuleResponse> modules;
}
