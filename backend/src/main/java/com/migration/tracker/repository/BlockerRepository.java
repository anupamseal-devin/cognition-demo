package com.migration.tracker.repository;

import com.migration.tracker.entity.Blocker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface BlockerRepository extends JpaRepository<Blocker, Long> {
    @Query("SELECT b FROM Blocker b WHERE b.module.project.id = :projectId")
    List<Blocker> findByProjectId(@Param("projectId") Long projectId);

    List<Blocker> findByModuleId(Long moduleId);
}
