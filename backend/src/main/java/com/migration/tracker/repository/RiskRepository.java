package com.migration.tracker.repository;

import com.migration.tracker.entity.Risk;
import com.migration.tracker.entity.enums.Severity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RiskRepository extends JpaRepository<Risk, Long> {
    List<Risk> findByProjectId(Long projectId);
    List<Risk> findByProjectIdAndSeverityAndStatusNot(Long projectId, Severity severity, String status);
    List<Risk> findTop5ByProjectIdAndStatusNotOrderBySeverityAsc(Long projectId, String status);
}
