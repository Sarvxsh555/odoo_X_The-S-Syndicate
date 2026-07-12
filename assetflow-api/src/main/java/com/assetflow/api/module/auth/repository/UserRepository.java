package com.assetflow.api.module.auth.repository;

import com.assetflow.api.module.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailAndDeletedFalse(String email);

    boolean existsByEmailAndDeletedFalse(String email);

    @Modifying
    @Query("UPDATE User u SET u.lastLoginAt = :now WHERE u.id = :userId")
    void updateLastLogin(Long userId, Instant now);
}
