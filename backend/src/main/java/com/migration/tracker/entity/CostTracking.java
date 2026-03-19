package com.migration.tracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cost_trackings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CostTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "\"MONTH\"", nullable = false)
    private String month;

    @Column(precision = 15, scale = 2)
    private BigDecimal budgetPlanned;

    @Column(precision = 15, scale = 2)
    private BigDecimal budgetActual;

    private Integer headcountPlanned;
    private Integer headcountActual;
}
