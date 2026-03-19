package com.migration.tracker.repository;

import com.migration.tracker.entity.Dependency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DependencyRepository extends JpaRepository<Dependency, Long> {
    @Query("SELECT d FROM Dependency d WHERE d.fromModule.project.id = :projectId OR d.toModule.project.id = :projectId")
    List<Dependency> findByProjectId(@Param("projectId") Long projectId);
}
