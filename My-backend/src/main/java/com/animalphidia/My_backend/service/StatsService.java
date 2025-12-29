package com.animalphidia.My_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class StatsService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Map<String, Object> getDashboardStats() {
        try {
            String sql = "SELECT * FROM admin_dashboard_stats";
            Map<String, Object> stats = jdbcTemplate.queryForMap(sql);

            // Convert all values to proper types
            Map<String, Object> result = new HashMap<>();

            // User stats
            result.put("totalUsers", convertToLong(stats.get("total_users")));
            result.put("activeUsers", convertToLong(stats.get("active_users")));

            // Animal stats
            result.put("totalAnimals", convertToLong(stats.get("total_animals")));
            result.put("activeAnimals", convertToLong(stats.get("active_animals")));
            result.put("verifiedAnimals", convertToLong(stats.get("verified_animals")));

            // Daily activity
            result.put("newAnimalsToday", convertToLong(stats.get("new_animals_today")));
            result.put("newUsersToday", convertToLong(stats.get("new_users_today")));

            // Conservation stats
            result.put("endangeredCount", convertToLong(stats.get("endangered_count")));
            result.put("protectedCount", convertToLong(stats.get("protected_count")));

            // User roles
            result.put("adminCount", convertToLong(stats.get("admin_count")));
            result.put("moderatorCount", convertToLong(stats.get("moderator_count")));
            result.put("contributorCount", convertToLong(stats.get("contributor_count")));

            // Last updated
            result.put("lastUpdated", stats.get("last_updated"));

            return result;

        } catch (Exception e) {
            // If view doesn't work, return basic stats
            return getFallbackStats();
        }
    }

    private Map<String, Object> getFallbackStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            // Get total animals
            Long totalAnimals = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM animals", Long.class);
            stats.put("totalAnimals", totalAnimals != null ? totalAnimals : 0);

            // Get total users
            Long totalUsers = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM users", Long.class);
            stats.put("totalUsers", totalUsers != null ? totalUsers : 0);

            // Get verified animals
            Long verifiedAnimals = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM animals WHERE is_verified = 1 OR verified = 1", Long.class);
            stats.put("verifiedAnimals", verifiedAnimals != null ? verifiedAnimals : 0);

            // Get active users
            Long activeUsers = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE account_status = 1", Long.class);
            stats.put("activeUsers", activeUsers != null ? activeUsers : 0);

            // Add placeholder values for other fields
            stats.put("activeAnimals", totalAnimals != null ? totalAnimals : 0);
            stats.put("newAnimalsToday", 0L);
            stats.put("newUsersToday", 0L);
            stats.put("endangeredCount", 0L);
            stats.put("protectedCount", 0L);
            stats.put("adminCount", 0L);
            stats.put("moderatorCount", 0L);
            stats.put("contributorCount", 0L);
            stats.put("lastUpdated", java.time.LocalDateTime.now().toString());

        } catch (Exception e) {
            // Return empty stats if everything fails
            stats.put("totalAnimals", 0L);
            stats.put("totalUsers", 0L);
            stats.put("verifiedAnimals", 0L);
            stats.put("activeUsers", 0L);
            stats.put("activeAnimals", 0L);
            stats.put("newAnimalsToday", 0L);
            stats.put("newUsersToday", 0L);
            stats.put("endangeredCount", 0L);
            stats.put("protectedCount", 0L);
            stats.put("adminCount", 0L);
            stats.put("moderatorCount", 0L);
            stats.put("contributorCount", 0L);
            stats.put("lastUpdated", java.time.LocalDateTime.now().toString());
        }

        return stats;
    }

    private Long convertToLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return 0L;
        }
    }
}
