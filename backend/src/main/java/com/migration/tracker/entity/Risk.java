package com.migration.tracker.entity;

import com.migration.tracker.entity.enums.Severity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "risks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Risk {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(length = 1000)
    private String mitigation;

    private String owner;

    @Column(nullable = false)
    private String status;
}
