package disease_surveillance.api_gateway.filter;

import disease_surveillance.api_gateway.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthInterceptor extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthInterceptor.class);

    private final JwtUtil jwtUtil;

   private static final String[] PUBLIC_PATHS = {
        "/auth-service/login",
        "/auth-service/register",
        "/auth-service/api/v1/auth/login",
        "/auth-service/api/v1/auth/register",
        "/patient-service",
        "/disease-service",
        "/location-service",
        "/actuator/prometheus",
        "/actuator/health",
        "/actuator"
};

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Step 1: Allow CORS preflight requests through without any JWT check
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();

        // Step 2: Allow public routes through (using startsWith to avoid partial-path spoofing)
        for (String publicPath : PUBLIC_PATHS) {
            if (path.startsWith(publicPath)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        // Step 3: Check Authorization header
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header for path: {}", path);
            sendError(response, "Missing or invalid Authorization header");
            return;
        }

        // Step 4: Validate token
        String token = authHeader.substring(7);

        try {
            if (jwtUtil.isTokenExpired(token)) {
                log.warn("Expired JWT token for path: {}", path);
                sendError(response, "Token has expired");
                return;
            }
        } catch (Exception e) {
            log.warn("Invalid JWT token for path: {} — {}", path, e.getMessage());
            sendError(response, "Invalid token");
            return;
        }

        // Step 5: Valid — pass through
        filterChain.doFilter(request, response);
    }

    private void sendError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");
        response.getWriter().write(
                String.format("{\"status\":401,\"message\":\"%s\"}", message)
        );
    }
}
