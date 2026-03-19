package com.migration.tracker.repository;

import com.migration.tracker.entity.Escalation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EscalationRepository extends JpaRepository<Escalation, Long> {
    List<Escalation> findByProjectId(Long projectId);
    long countByProjectIdAndResolvedDateIsNull(Long projectId);
    List<Escalation> findByProjectIdAndSlaBreachedTrue(Long projectId);
}
