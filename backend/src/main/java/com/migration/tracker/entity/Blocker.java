package com.migration.tracker.entity;

import com.migration.tracker.entity.enums.BlockerCategory;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "blockers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Blocker {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BlockerCategory category;

    @Column(nullable = false, length = 1000)
    private String description;

    private String owner;

    @Column(nullable = false)
    private String status;

    private LocalDate createdDate;
    private LocalDate resolvedDate;
}
