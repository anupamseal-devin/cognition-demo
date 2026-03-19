package com.migration.tracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "test_coverages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TestCoverage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false, unique = true)
    private Module module;

    @Column(nullable = false)
    private Double legacyCoveragePercent;

    @Column(nullable = false)
    private Double newCoveragePercent;

    @Column(nullable = false)
    private Double regressionPassRatePercent;
}
