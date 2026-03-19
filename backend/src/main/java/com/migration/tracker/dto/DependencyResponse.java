package com.migration.tracker.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DependencyResponse {
    private List<NodeDto> nodes;
    private List<EdgeDto> edges;
    private List<Long> criticalPath;

    @Data @Builder
    public static class NodeDto {
        private Long id;
        private String name;
        private String domain;
        private String status;
        private int downstreamCount;
    }

    @Data @Builder
    public static class EdgeDto {
        private Long from;
        private Long to;
        private String type;
    }
}
