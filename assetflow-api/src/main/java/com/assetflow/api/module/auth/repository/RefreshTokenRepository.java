package com.assetflow.api.module.auth.repository;

import com.assetflow.api.module.auth.entity.RefreshToken;
import com.assetflow.api.module.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenAndRevokedFalse(String token);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.revoked = TRUE WHERE rt.user = :user")
    void revokeAllUserTokens(User user);
}
