package disease_surveillance.auth_service.repository;

import disease_surveillance.auth_service.entity.User;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,UUID> {

    Optional<User> findByEmail(String email);
}
