package disease_surveillance.test_service;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
    @GetMapping("/test-service/test")
    public  String test() {
        return "Test service is working!";
    }
}
