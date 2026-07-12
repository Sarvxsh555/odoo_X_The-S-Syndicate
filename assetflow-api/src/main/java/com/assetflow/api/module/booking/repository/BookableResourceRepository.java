package com.assetflow.api.module.booking.repository;

import com.assetflow.api.module.booking.entity.BookableResource;
import com.assetflow.api.module.booking.entity.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookableResourceRepository extends JpaRepository<BookableResource, Long> {
    List<BookableResource> findByDeletedFalseAndActiveTrue();
    List<BookableResource> findByTypeAndDeletedFalseAndActiveTrue(ResourceType type);
    Optional<BookableResource> findByIdAndDeletedFalse(Long id);
}
