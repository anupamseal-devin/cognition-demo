package com.migration.tracker.repository;

import com.migration.tracker.entity.TestCoverage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TestCoverageRepository extends JpaRepository<TestCoverage, Long> {
    @Query("SELECT tc FROM TestCoverage tc WHERE tc.module.project.id = :projectId")
    List<TestCoverage> findByProjectId(@Param("projectId") Long projectId);
}
