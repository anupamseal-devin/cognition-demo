package com.migration.tracker.dto;

import com.migration.tracker.entity.enums.ModuleStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ModuleRequest {
    @NotNull
    private Long projectId;
    @NotBlank
    private String name;
    @NotBlank
    private String domain;
    @NotNull
    private ModuleStatus status;
    private String owner;
    @NotNull
    private Integer priority;
}
