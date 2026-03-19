package com.migration.tracker.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BlockerResponse {
    private Long id;
    private Long moduleId;
    private String moduleName;
    private String category;
    private String description;
    private String owner;
    private String status;
    private String createdDate;
    private String resolvedDate;
    private long ageDays;
}
