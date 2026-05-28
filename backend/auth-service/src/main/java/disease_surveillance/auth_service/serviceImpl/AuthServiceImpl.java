package disease_surveillance.auth_service.serviceImpl;

import disease_surveillance.auth_service.dto.ApiResponse;
import disease_surveillance.auth_service.dto.UserDto;
import disease_surveillance.auth_service.entity.Role;
import disease_surveillance.auth_service.entity.User;
import disease_surveillance.auth_service.repository.UserRepository;
import disease_surveillance.auth_service.security.JwtUtil;
import disease_surveillance.auth_service.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public ApiResponse<UserDto.ResponseUser> register(UserDto.CreateUserRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        Role role;
        try {
            role = Role.valueOf(request.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + request.role());
        }

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(role)
                .build();

        User saved = userRepository.save(user);

        return ApiResponse.success("User registered successfully", toResponseUser(saved));
    }

    @Override
    public ApiResponse<UserDto.LoginResponse> login(UserDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        UserDto.LoginResponse loginResponse = new UserDto.LoginResponse(
                token,
                "Bearer",
                toResponseUser(user)
        );

        return ApiResponse.success("Login successful", loginResponse);
    }

    @Override
    public ApiResponse<UserDto.ResponseUser> findById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return ApiResponse.success("User retrieved", toResponseUser(user));
    }

    @Override
    public ApiResponse<UserDto.ResponseUser> findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return ApiResponse.success("User retrieved", toResponseUser(user));
    }

    // ──────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────

    private UserDto.ResponseUser toResponseUser(User user) {
        return new UserDto.ResponseUser(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null
        );
    }
}