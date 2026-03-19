package com.migration.tracker.repository;

import com.migration.tracker.entity.Wave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface WaveRepository extends JpaRepository<Wave, Long> {
    List<Wave> findByProjectIdOrderByPlannedStartDateAsc(Long projectId);

    @Query("SELECT DISTINCT w FROM Wave w LEFT JOIN FETCH w.modules WHERE w.project.id = :projectId ORDER BY w.plannedStartDate ASC")
    List<Wave> findByProjectIdWithModules(@Param("projectId") Long projectId);
}
