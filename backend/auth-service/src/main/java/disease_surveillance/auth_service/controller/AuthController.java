package disease_surveillance.auth_service.controller;

import disease_surveillance.auth_service.dto.ApiResponse;
import disease_surveillance.auth_service.dto.UserDto;
import disease_surveillance.auth_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth-service")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto.ResponseUser>> register(
            @Valid @RequestBody UserDto.CreateUserRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDto.LoginResponse>> login(
            @Valid @RequestBody UserDto.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDto.ResponseUser>> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(authService.findById(id));
    }

    @GetMapping("/users/email/{email}")
    public ResponseEntity<ApiResponse<UserDto.ResponseUser>> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(authService.findByEmail(email));
    }
}
