-- ============================================================
-- DSAS — Disease Surveillance and Alert System
-- Script d'initialisation des bases de données
-- Principe : chaque service possède sa propre base isolée
-- Les services communiquent via REST API et RabbitMQ UNIQUEMENT
-- ============================================================


-- ── Création des bases ──────────────────────────────────────
CREATE DATABASE dsas_auth;
CREATE DATABASE dsas_diseases;
CREATE DATABASE dsas_locations;
CREATE DATABASE dsas_patients;
CREATE DATABASE dsas_analytics;
CREATE DATABASE dsas_alerts;
CREATE DATABASE dsas_reports;

GRANT ALL PRIVILEGES ON DATABASE dsas_auth      TO dsas_user;
GRANT ALL PRIVILEGES ON DATABASE dsas_diseases  TO dsas_user;
GRANT ALL PRIVILEGES ON DATABASE dsas_locations TO dsas_user;
GRANT ALL PRIVILEGES ON DATABASE dsas_patients  TO dsas_user;
GRANT ALL PRIVILEGES ON DATABASE dsas_analytics TO dsas_user;
GRANT ALL PRIVILEGES ON DATABASE dsas_alerts    TO dsas_user;
GRANT ALL PRIVILEGES ON DATABASE dsas_reports   TO dsas_user;


-- ============================================================
-- BASE : dsas_auth  (appartient à auth-service)
-- ============================================================
\connect dsas_auth

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id            BIGSERIAL     PRIMARY KEY,
    full_name     VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    role          VARCHAR(20)   NOT NULL
                  CHECK (role IN ('ADMIN', 'HEALTH_WORKER', 'ANALYST')),
    active        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

INSERT INTO users (full_name, email, password_hash, role) VALUES
    ('Administrateur', 'admin@dsas.gov',
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
     'ADMIN');


-- ============================================================
-- BASE : dsas_diseases  (appartient à disease-service)
-- ============================================================
\connect dsas_diseases

DROP TABLE IF EXISTS diseases;

CREATE TABLE diseases (
    id              BIGSERIAL    PRIMARY KEY,
    name            VARCHAR(255) NOT NULL UNIQUE,
    description     TEXT,
    threshold_limit INT          NOT NULL DEFAULT 10,
    updated_at      TIMESTAMP,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_diseases_name ON diseases(name);

-- Restore test data
INSERT INTO diseases (name, description, threshold_limit) VALUES
    ('Cholera',   'Infection intestinale aiguë causée par Vibrio cholerae', 10),
    ('Malaria',   'Maladie parasitaire transmise par les moustiques',        50),
    ('Dengue',    'Maladie virale transmise par le moustique Aedes aegypti', 20),
    ('Mpox',      'Maladie virale zoonotique causée par le virus Mpox',       5),
    ('Typhoïde',  'Infection bactérienne causée par Salmonella typhi',       15);


-- ============================================================
-- BASE : dsas_locations  (appartient à location-service)
-- ============================================================
\connect dsas_locations

CREATE TABLE locations (
    id        BIGSERIAL    PRIMARY KEY,        -- ← BIGSERIAL to match Long + IDENTITY
    region    VARCHAR(100) NOT NULL,
    district  VARCHAR(100),
    latitude  DECIMAL(9,6),
    longitude DECIMAL(9,6),
    UNIQUE(region, district)
);

CREATE INDEX idx_locations_region ON locations(region);

-- Données de test
INSERT INTO locations (region, district, latitude, longitude) VALUES
    ('Littoral',  'Douala 1',  4.0483, 9.7043),
    ('Littoral',  'Douala 2',  4.0500, 9.7200),
    ('Centre',    'Yaoundé 1', 3.8480, 11.5021),
    ('Centre',    'Yaoundé 2', 3.8700, 11.5200),
    ('Nord',      'Garoua',    9.3019, 13.3986),
    ('Ouest',     'Bafoussam', 5.4781, 10.4176),
    ('Sud-Ouest', 'Buea',      4.1527, 9.2416);


-- ============================================================
-- BASE : dsas_patients  (appartient à patient-service)
-- ============================================================
\connect dsas_patients

DROP TABLE IF EXISTS patient_cases;
DROP TABLE IF EXISTS patients;

CREATE TABLE patients (
    id            BIGSERIAL     PRIMARY KEY,
    patient_code  VARCHAR(20)   NOT NULL UNIQUE,
    gender        VARCHAR(10)   NOT NULL CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    age           INT           NOT NULL CHECK (age > 0 AND age < 150),
    symptoms      TEXT          NOT NULL,
    diagnosis     TEXT          NOT NULL,
    disease       VARCHAR(255)  NOT NULL,
    region        VARCHAR(100)  NOT NULL,
    street        VARCHAR(255),
    reported_by   VARCHAR(255),
    report_date   TIMESTAMP
);

CREATE INDEX idx_cases_disease  ON patient_cases(disease_id);
CREATE INDEX idx_cases_location ON patient_cases(location_id);
CREATE INDEX idx_cases_date     ON patient_cases(report_date);
CREATE INDEX idx_cases_reported ON patient_cases(reported_by);


-- ============================================================
-- BASE : dsas_analytics  (appartient à analytics-service)
-- ============================================================
\connect dsas_analytics

-- Copies dénormalisées pour les calculs — alimentées par RabbitMQ
-- analytics-service ne lit PAS dsas_patients directement
CREATE TABLE case_events (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_code VARCHAR(20)  NOT NULL,
    disease_name VARCHAR(100) NOT NULL,
    region       VARCHAR(100) NOT NULL,
    district     VARCHAR(100),
    age          INT,
    gender       VARCHAR(10),
    report_date  DATE         NOT NULL,
    received_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Résultats agrégés par maladie + région + période
CREATE TABLE case_aggregates (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_name VARCHAR(100) NOT NULL,
    region       VARCHAR(100) NOT NULL,
    period_start DATE         NOT NULL,
    period_end   DATE         NOT NULL,
    case_count   INT          NOT NULL DEFAULT 0,
    threshold    INT          NOT NULL DEFAULT 10,
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE(disease_name, region, period_start, period_end)
);

CREATE INDEX idx_events_disease ON case_events(disease_name);
CREATE INDEX idx_events_region  ON case_events(region);
CREATE INDEX idx_events_date    ON case_events(report_date);
CREATE INDEX idx_agg_lookup     ON case_aggregates(disease_name, region, period_start);


-- ============================================================
-- BASE : dsas_alerts  (appartient à alert-service)
-- ============================================================
\connect dsas_alerts

CREATE TABLE alerts (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_name VARCHAR(100) NOT NULL,    -- copie dénormalisée, pas de FK
    region       VARCHAR(100) NOT NULL,
    alert_level  VARCHAR(20)  NOT NULL
                 CHECK (alert_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    message      TEXT         NOT NULL,
    cases_count  INT          NOT NULL,
    threshold    INT          NOT NULL,
    is_resolved  BOOLEAN      NOT NULL DEFAULT FALSE,
    generated_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    resolved_at  TIMESTAMP
);

CREATE INDEX idx_alerts_disease ON alerts(disease_name);
CREATE INDEX idx_alerts_region  ON alerts(region);
CREATE INDEX idx_alerts_level   ON alerts(alert_level);
CREATE INDEX idx_alerts_active  ON alerts(is_resolved) WHERE NOT is_resolved;


-- ============================================================
-- BASE : dsas_reports  (appartient à report-service)
-- ============================================================
\connect dsas_reports

CREATE TABLE reports (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type   VARCHAR(30)  NOT NULL
                  CHECK (report_type IN ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM')),
    generated_by  UUID         NOT NULL,   -- UUID user de dsas_auth via API
    generated_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    file_path     VARCHAR(500),            -- chemin du PDF/CSV généré
    file_format   VARCHAR(10)  NOT NULL DEFAULT 'PDF'
                  CHECK (file_format IN ('PDF', 'CSV')),
    period_start  DATE,
    period_end    DATE,
    parameters    JSONB                    -- filtres utilisés pour ce rapport
);

CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_by   ON reports(generated_by);
CREATE INDEX idx_reports_date ON reports(generated_at);
