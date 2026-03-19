package com.migration.tracker.repository;

import com.migration.tracker.entity.CostTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CostTrackingRepository extends JpaRepository<CostTracking, Long> {
    List<CostTracking> findByProjectIdOrderByMonthAsc(Long projectId);
}
