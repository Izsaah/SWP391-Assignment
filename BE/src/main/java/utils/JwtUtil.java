package utils;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import model.dto.UserAccountDTO;
import model.dto.RoleDTO;

/**
 * Utility class for generating and validating JWT tokens.
 */
public class JwtUtil {

    private static final String SECRET_KEY
            = "DEVKEYWILLCHANGELATERIMTOOLAZYTODOANOTHERFILEREADIMPORTBECAUSEWEDONTHAVETHEDAMNFRAMEWORKFORIT";
    private static final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    // Token validity = 1 hour
    private static final long EXPIRATION_MS = 1000 * 60 * 60;

    private static final String CLAIM_ROLES = "roles";

    /**
     * ✅ Generate token directly from UserAccountDTO
     */
    public static String generateToken(UserAccountDTO user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }
        List<String> roles = new ArrayList<>();

        if (user.getRoles() != null) {
            for (RoleDTO role : user.getRoles()) {
                roles.add(role.getRoleName());
            }
        }

        return Jwts.builder()
                .setSubject(user.getUsername())
                .claim(CLAIM_ROLES, roles)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Still allow manual username + roles input
     */
    public static String generateToken(String username, List<String> roles) {
        return Jwts.builder()
                .setSubject(username)
                .claim(CLAIM_ROLES, roles)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public static Jws<Claims> validateToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
        } catch (JwtException e) {
            throw new AuthException("Invalid or expired token");
        }
    }

    public static String extractUsername(String token) {
        return validateToken(token).getBody().getSubject();
    }

    @SuppressWarnings("unchecked")
    public static List<String> extractRoles(String token) {
        return validateToken(token).getBody().get(CLAIM_ROLES, List.class);
    }

    public static String extractToken(jakarta.servlet.http.HttpServletRequest req) {
        String authHeader = req.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new AuthException("Missing or invalid Authorization header");
        }
        return authHeader.substring(7);
    }
}
