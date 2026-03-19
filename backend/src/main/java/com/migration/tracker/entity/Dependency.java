package com.migration.tracker.entity;

import com.migration.tracker.entity.enums.DependencyType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dependencies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Dependency {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_module_id", nullable = false)
    private Module fromModule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_module_id", nullable = false)
    private Module toModule;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DependencyType type;
}
