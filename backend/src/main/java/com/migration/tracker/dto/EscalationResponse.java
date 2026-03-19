package com.migration.tracker.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EscalationResponse {
    private Long id;
    private String description;
    private String raisedDate;
    private String resolvedDate;
    private boolean slaBreached;
    private long ageDays;
    private String status;
}
