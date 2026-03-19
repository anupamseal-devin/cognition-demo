package com.migration.tracker.dto;

import com.migration.tracker.entity.enums.BlockerCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BlockerRequest {
    @NotNull
    private Long moduleId;
    @NotNull
    private BlockerCategory category;
    @NotBlank
    private String description;
    private String owner;
    @NotBlank
    private String status;
}
