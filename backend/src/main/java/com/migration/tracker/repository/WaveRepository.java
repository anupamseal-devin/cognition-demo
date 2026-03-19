package com.migration.tracker.repository;

import com.migration.tracker.entity.Wave;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WaveRepository extends JpaRepository<Wave, Long> {
    List<Wave> findByProjectIdOrderByPlannedStartDateAsc(Long projectId);
}
