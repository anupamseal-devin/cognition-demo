package com.migration.tracker.repository;

import com.migration.tracker.entity.CutoverChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CutoverChecklistRepository extends JpaRepository<CutoverChecklist, Long> {
    List<CutoverChecklist> findByModuleId(Long moduleId);

    @Query("SELECT c FROM CutoverChecklist c WHERE c.module.project.id = :projectId")
    List<CutoverChecklist> findByProjectId(@Param("projectId") Long projectId);
}
