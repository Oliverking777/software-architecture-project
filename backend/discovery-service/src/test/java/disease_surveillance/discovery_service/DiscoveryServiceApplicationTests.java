package disease_surveillance.discovery_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.netflix.eureka.server.EurekaServerAutoConfiguration;

@SpringBootTest
@EnableAutoConfiguration(exclude = {EurekaServerAutoConfiguration.class})
class DiscoveryServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}