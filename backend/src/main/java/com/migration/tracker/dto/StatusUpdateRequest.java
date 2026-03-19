package com.migration.tracker.dto;

import com.migration.tracker.entity.enums.ModuleStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotNull
    private ModuleStatus status;
}
