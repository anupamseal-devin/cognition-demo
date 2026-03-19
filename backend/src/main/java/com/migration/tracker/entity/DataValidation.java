package com.migration.tracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "data_validations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DataValidation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false, unique = true)
    private Module module;

    @Column(nullable = false)
    private String reconciliationStatus;

    @Column(nullable = false)
    private Long recordsCompared;

    @Column(nullable = false)
    private Long mismatchCount;
}
