---
name: project-dsas-overview
description: DSAS is a microservices disease-surveillance platform — Java/Spring Boot + Python/FastAPI backends, React frontend, Eureka/RabbitMQ/Postgres, Docker Compose + K8s deploy
metadata:
  type: project
---

The repo (software-architecture-project, branch `new`) implements **DSAS (Disease Surveillance and Alert System)**, a microservices platform that tracks disease case reports by geographic region and raises alerts when configurable thresholds are exceeded.

Stack split:
- Java/Spring Boot services in `backend/`: discovery-service (Eureka, 8761), api-gateway (8080, JWT), auth-service (8081), patient-service (8082, publishes case events to RabbitMQ), disease-service (8083), location-service (8084).
- Python/FastAPI services in `backend/`: analytics-service (8085, consumes RabbitMQ events, computes alerts/aggregates), report-service (8086), notification-service (8087, SMTP/MailHog), geo-service (8088).
- Frontend lives at `frontend/react-app/` (React 19 + Vite + Tailwind + Recharts) — NOT the top-level `react-app/` (that's just a Vite cache) or `frontend.rar` (stale archive).
- Infra: `infrastructure/docker-compose.yml` for local dev (11 services + Postgres 15 + RabbitMQ + MailHog + Prometheus/Grafana), `infrastructure/k8s/` manifests for prod (images `tinfeh/*`).
- Database-per-service pattern: 7 Postgres DBs (`dsas_auth`, `dsas_patients`, `dsas_diseases`, `dsas_locations`, `dsas_analytics`, `dsas_reports`, `dsas_alerts`) defined in `infrastructure/init-db.sql`.
- CI: two separate GitHub Actions pipelines, `backend-java.yml` and `backend-python.yml`, each doing build/test/lint/security-scan (SonarQube/Bandit/Safety) and Docker image push.

**Why:** Established via a full directory exploration on 2026-06-08 to build a baseline architectural map.
**How to apply:** Use this as the reference architecture map when navigating the repo or discussing design — e.g. know which language/service owns which responsibility before suggesting changes, and remember the frontend's real location is `frontend/react-app/`.
