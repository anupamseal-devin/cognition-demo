package com.migration.tracker.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cutover_checklists")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CutoverChecklist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(nullable = false)
    private String item;

    @Column(nullable = false)
    private Boolean completed;

    @Column(nullable = false)
    private Boolean rollbackTested;
}
