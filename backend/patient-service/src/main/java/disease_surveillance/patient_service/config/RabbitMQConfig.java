package disease_surveillance.patient_service.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ── Exchange ──────────────────────────────────────────────────────────────
    // TopicExchange allows routing by pattern matching on the routing key.
    // e.g. a consumer can subscribe to "patient.#" to receive all patient events.

    @Bean
    public TopicExchange patientExchange() {
        return new TopicExchange(RabbitMQConstants.PATIENT_EXCHANGE);
    }

    // ── Queues ────────────────────────────────────────────────────────────────
    // durable(true) means the queue survives a RabbitMQ broker restart.

    @Bean
    public Queue patientCreatedQueue() {
        return QueueBuilder.durable(RabbitMQConstants.PATIENT_CREATED_QUEUE).build();
    }

    @Bean
    public Queue patientUpdatedQueue() {
        return QueueBuilder.durable(RabbitMQConstants.PATIENT_UPDATED_QUEUE).build();
    }

    @Bean
    public Queue patientDeletedQueue() {
        return QueueBuilder.durable(RabbitMQConstants.PATIENT_DELETED_QUEUE).build();
    }

    // ── Bindings ──────────────────────────────────────────────────────────────
    // Each binding tells the exchange: "when you see this routing key, put the
    // message in this queue."

    @Bean
    public Binding patientCreatedBinding() {
        return BindingBuilder
                .bind(patientCreatedQueue())
                .to(patientExchange())
                .with(RabbitMQConstants.PATIENT_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding patientUpdatedBinding() {
        return BindingBuilder
                .bind(patientUpdatedQueue())
                .to(patientExchange())
                .with(RabbitMQConstants.PATIENT_UPDATED_ROUTING_KEY);
    }

    @Bean
    public Binding patientDeletedBinding() {
        return BindingBuilder
                .bind(patientDeletedQueue())
                .to(patientExchange())
                .with(RabbitMQConstants.PATIENT_DELETED_ROUTING_KEY);
    }

    // ── Message Converter ─────────────────────────────────────────────────────
    // Tells RabbitTemplate to serialize/deserialize messages as JSON
    // instead of Java byte streams, so other services (even non-Java) can read them.

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}