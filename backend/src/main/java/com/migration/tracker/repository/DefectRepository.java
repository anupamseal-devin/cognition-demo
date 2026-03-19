package com.migration.tracker.repository;

import com.migration.tracker.entity.Defect;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DefectRepository extends JpaRepository<Defect, Long> {
    @Query("SELECT d FROM Defect d WHERE d.module.project.id = :projectId")
    List<Defect> findByProjectId(@Param("projectId") Long projectId);

    List<Defect> findByModuleId(Long moduleId);
}
