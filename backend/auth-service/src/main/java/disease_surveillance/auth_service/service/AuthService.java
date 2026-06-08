package disease_surveillance.auth_service.service;
import java.util.UUID;

import disease_surveillance.auth_service.dto.ApiResponse;
import disease_surveillance.auth_service.dto.UserDto;

public interface AuthService {

    ApiResponse<UserDto.ResponseUser> register(UserDto.CreateUserRequest request);

    ApiResponse<UserDto.LoginResponse> login(UserDto.LoginRequest request);

    ApiResponse<UserDto.ResponseUser> findById(UUID id);

    ApiResponse<UserDto.ResponseUser> findByEmail(String email);
}
