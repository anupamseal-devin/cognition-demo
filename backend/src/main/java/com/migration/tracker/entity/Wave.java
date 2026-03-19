package com.migration.tracker.entity;

import com.migration.tracker.entity.enums.RagStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "waves")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Wave {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private String name;

    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    private LocalDate actualStartDate;
    private LocalDate actualEndDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RagStatus ragStatus;

    @ManyToMany
    @JoinTable(
        name = "wave_modules",
        joinColumns = @JoinColumn(name = "wave_id"),
        inverseJoinColumns = @JoinColumn(name = "module_id")
    )
    @Builder.Default
    private List<Module> modules = new ArrayList<>();
}
