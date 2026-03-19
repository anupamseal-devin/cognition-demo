package com.migration.tracker.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "escalations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Escalation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 1000)
    private String description;

    private LocalDate raisedDate;
    private LocalDate resolvedDate;

    @Column(nullable = false)
    private Boolean slaBreached;
}
