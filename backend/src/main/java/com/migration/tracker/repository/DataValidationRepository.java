package com.migration.tracker.repository;

import com.migration.tracker.entity.DataValidation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface DataValidationRepository extends JpaRepository<DataValidation, Long> {
    @Query("SELECT dv FROM DataValidation dv WHERE dv.module.project.id = :projectId")
    List<DataValidation> findByProjectId(@Param("projectId") Long projectId);
}
