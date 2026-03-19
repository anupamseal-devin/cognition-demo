package com.migration.tracker.repository;

import com.migration.tracker.entity.Module;
import com.migration.tracker.entity.enums.ModuleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ModuleRepository extends JpaRepository<Module, Long> {
    List<Module> findByProjectId(Long projectId);

    @Query("SELECT m FROM Module m WHERE m.project.id = :projectId AND (:domain IS NULL OR m.domain = :domain) AND (:status IS NULL OR m.status = :status) AND (:owner IS NULL OR m.owner = :owner)")
    List<Module> findByProjectIdWithFilters(@Param("projectId") Long projectId, @Param("domain") String domain, @Param("status") ModuleStatus status, @Param("owner") String owner);

    long countByProjectIdAndStatus(Long projectId, ModuleStatus status);

    long countByProjectId(Long projectId);
}
