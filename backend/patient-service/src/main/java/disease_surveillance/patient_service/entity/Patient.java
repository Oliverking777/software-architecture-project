package disease_surveillance.patient_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "patient_cases")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    private String patientCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender",nullable = false)
    private Gender  gender;

    @Column(name = "age",nullable = false)
    private Integer age;

    @Column(name = "symptoms",nullable = false)
    private String symptoms;

    @Column(name = "diagnosis",nullable = false)
    private String diagnosis;

    @Column(name = "disease",nullable = false)
    private String disease;

    @Column(name = "region",nullable = false)
    private  String region;

    @Column(name = "street")
    private String street;

    @Column(name = "reported_by")
    private String reportedBy;

    @Column(name = "report_date")
    private LocalDateTime reportDate;





}
