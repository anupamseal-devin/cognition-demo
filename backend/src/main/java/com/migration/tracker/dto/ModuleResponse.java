package com.migration.tracker.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ModuleResponse {
    private Long id;
    private String name;
    private String domain;
    private String status;
    private String owner;
    private Integer priority;
    private List<String> waveNames;
    private Integer blockerCount;
    private Integer defectCount;
}
