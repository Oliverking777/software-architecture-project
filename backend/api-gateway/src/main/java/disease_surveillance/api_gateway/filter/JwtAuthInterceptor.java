package disease_surveillance.api_gateway.filter;

import disease_surveillance.api_gateway.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthInterceptor extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    private static final String[] PUBLIC_PATHS = {
            "/auth-service/login",
            "/auth-service/register",
            "/actuator/prometheus",
            "/actuator/health",
            "/actuator"
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // Step 1: Allow public routes through
        for (String publicPath : PUBLIC_PATHS) {
            if (path.contains(publicPath)) {
                filterChain.doFilter(request, response);
                return;
            }
        }

        // Step 2: Check Authorization header
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendError(response, "Missing or invalid Authorization header");
            return;
        }

        // Step 3: Validate token
        String token = authHeader.substring(7);

        try {
            if (jwtUtil.isTokenExpired(token)) {
                sendError(response, "Token has expired");
                return;
            }
        } catch (Exception e) {
            sendError(response, "Invalid token");
            return;
        }

        // Step 4: Valid — pass through
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
