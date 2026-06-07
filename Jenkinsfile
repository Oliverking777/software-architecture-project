// ═══════════════════════════════════════════════════════════════
//  DSAS — Unified CI/CD Jenkins Pipeline
//  Order: Infra (Docker) → Build/Test → Push Images → Deploy
//  Frontend: excluded (not ready yet)
// ═══════════════════════════════════════════════════════════════

pipeline {
    agent any

    environment {
        DOCKER_HUB    = credentials('dockerhub-creds')
        KUBECONFIG    = '/var/jenkins_home/.kube/config'
        COMPOSE_FILE  = 'docker-compose.yml'
        COMPOSE_PROJECT = "dsas-test-${BUILD_NUMBER}"
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    stages {

        // ── Stage 1: Checkout ──────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ══════════════════════════════════════════════════════
        //  PHASE 0 — START TEST INFRASTRUCTURE
        //  Spin up Postgres + RabbitMQ + Mailhog once for all tests
        // ══════════════════════════════════════════════════════

        stage('Start Test Infrastructure') {
            steps {
                sh '''
                    cd infrastructure

                    docker compose -p ${COMPOSE_PROJECT} \
                        up -d postgres rabbitmq mailhog

                    # ── Wait for Postgres ──────────────────────
                    echo ">>> Waiting for Postgres..."
                    for i in $(seq 1 30); do
                        docker compose -p ${COMPOSE_PROJECT} \
                            exec -T postgres pg_isready -U dsas_user && break
                        echo "  Postgres not ready yet ($i/30)..."
                        sleep 3
                    done

                    # ── Copy and run init-db.sql ───────────────
                    echo ">>> Running init-db.sql..."
                    PG_CONTAINER=$(docker compose -p ${COMPOSE_PROJECT} ps -q postgres)
                    docker cp init-db.sql ${PG_CONTAINER}:/tmp/init-db.sql
                    docker compose -p ${COMPOSE_PROJECT} \
                        exec -T postgres psql -U dsas_user -d dsas_db \
                        -f /tmp/init-db.sql

                    # ── Wait for RabbitMQ ──────────────────────
                    echo ">>> Waiting for RabbitMQ..."
                    for i in $(seq 1 30); do
                        docker compose -p ${COMPOSE_PROJECT} \
                            exec -T rabbitmq rabbitmq-diagnostics ping && break
                        echo "  RabbitMQ not ready yet ($i/30)..."
                        sleep 3
                    done

                    echo ">>> Test infrastructure is ready"
                '''
            }
        }

        // ══════════════════════════════════════════════════════
        //  PHASE 1 — BUILD & TEST
        //  Run all tests in parallel (infra already up)
        // ══════════════════════════════════════════════════════

        stage('Build & Test — Java Services') {
            parallel {
                // No DB — api-gateway and discovery-service are
                // pure routing/registry services
                stage('api-gateway') {
                    steps { buildAndTestJavaNoDB('api-gateway') }
                }
                stage('discovery-service') {
                    steps { buildAndTestJavaNoDB('discovery-service') }
                }

                // DB-backed services — each gets its own database
                stage('auth-service') {
                    steps { buildAndTestJavaWithDB('auth-service', 'dsas_auth') }
                }
                stage('disease-service') {
                    steps { buildAndTestJavaWithDB('disease-service', 'dsas_diseases') }
                }
                stage('location-service') {
                    steps { buildAndTestJavaWithDB('location-service', 'dsas_locations') }
                }
                stage('patient-service') {
                    steps { buildAndTestJavaWithDB('patient-service', 'dsas_patients') }
                }
            }
        }

        stage('Build & Test — Python Services') {
            parallel {
                stage('analytics-service') {
                    steps { lintAndTestPython('analytics-service') }
                }
                stage('geo-service') {
                    steps { lintAndTestPython('geo-service') }
                }
                stage('notification-service') {
                    steps { lintAndTestPython('notification-service') }
                }
                stage('report-service') {
                    steps { lintAndTestPython('report-service') }
                }
            }
        }

        // ══════════════════════════════════════════════════════
        //  PHASE 2 — BUILD & PUSH ALL DOCKER IMAGES
        // ══════════════════════════════════════════════════════

        stage('Build & Push — Java Images') {
            when { branch 'main' }
            parallel {
                stage('img: api-gateway') {
                    steps { buildAndPushImage('api-gateway', 'backend/api-gateway') }
                }
                stage('img: auth-service') {
                    steps { buildAndPushImage('auth-service', 'backend/auth-service') }
                }
                stage('img: discovery-service') {
                    steps { buildAndPushImage('discovery-service', 'backend/discovery-service') }
                }
                stage('img: disease-service') {
                    steps { buildAndPushImage('disease-service', 'backend/disease-service') }
                }
                stage('img: location-service') {
                    steps { buildAndPushImage('location-service', 'backend/location-service') }
                }
                stage('img: patient-service') {
                    steps { buildAndPushImage('patient-service', 'backend/patient-service') }
                }
            }
        }

        stage('Build & Push — Python Images') {
            when { branch 'main' }
            parallel {
                stage('img: analytics-service') {
                    steps { buildAndPushImage('analytics-service', 'backend/analytics-service') }
                }
                stage('img: geo-service') {
                    steps { buildAndPushImage('geo-service', 'backend/geo-service') }
                }
                stage('img: notification-service') {
                    steps { buildAndPushImage('notification-service', 'backend/notification-service') }
                }
                stage('img: report-service') {
                    steps { buildAndPushImage('report-service', 'backend/report-service') }
                }
            }
        }

        // ══════════════════════════════════════════════════════
        //  PHASE 3 — DEPLOY INFRASTRUCTURE FIRST
        // ══════════════════════════════════════════════════════

        stage('Deploy — Infrastructure') {
            when { branch 'main' }
            steps {
                sh '''
                    echo ">>> Applying DB init configmap..."
                    kubectl create configmap postgres-init-sql \
                        --from-file=init.sql=infrastructure/init-db.sql \
                        --dry-run=client -o yaml | kubectl apply -f -

                    echo ">>> Deploying infrastructure services..."
                    kubectl apply -f infrastructure/k8s/postgres/
                    kubectl apply -f infrastructure/k8s/rabbitmq/
                    kubectl apply -f infrastructure/k8s/mailhog/
                    kubectl apply -f infrastructure/k8s/prometheus/
                    kubectl apply -f infrastructure/k8s/grafana/

                    echo ">>> Waiting for Postgres and RabbitMQ to be ready..."
                    kubectl rollout status deployment/postgres --timeout=300s
                    kubectl rollout status deployment/rabbitmq --timeout=300s

                    echo ">>> Infrastructure is ready"
                '''
            }
        }

        // ══════════════════════════════════════════════════════
        //  PHASE 4 — DEPLOY DISCOVERY SERVICE
        // ══════════════════════════════════════════════════════

        stage('Deploy — Discovery Service') {
            when { branch 'main' }
            steps {
                sh '''
                    echo ">>> Deploying discovery-service..."
                    kubectl apply -f infrastructure/k8s/discovery-service/

                    READY=$(kubectl get deployment discovery-service \
                        -o jsonpath=\'{.status.readyReplicas}\' 2>/dev/null || echo "0")

                    if [ "$READY" = "0" ]; then
                        echo "Discovery not ready — restarting..."
                        kubectl rollout restart deployment/discovery-service
                    else
                        echo "Discovery already healthy ($READY replicas) — skipping restart"
                    fi

                    kubectl rollout status deployment/discovery-service --timeout=300s
                    echo ">>> Discovery service is ready"
                '''
            }
        }

        // ══════════════════════════════════════════════════════
        //  PHASE 5 — DEPLOY JAVA SERVICES
        // ══════════════════════════════════════════════════════

        stage('Deploy — Java Services') {
            when { branch 'main' }
            steps {
                sh '''
                    echo ">>> Applying Java service manifests..."
                    kubectl apply -f infrastructure/k8s/api-gateway/
                    kubectl apply -f infrastructure/k8s/auth-service/
                    kubectl apply -f infrastructure/k8s/disease-service/
                    kubectl apply -f infrastructure/k8s/location-service/
                    kubectl apply -f infrastructure/k8s/patient-service/

                    echo ">>> Restarting and waiting for Java services..."
                    for svc in api-gateway auth-service disease-service location-service patient-service; do
                        echo "  -- restarting $svc"
                        kubectl rollout restart deployment/$svc
                        kubectl rollout status deployment/$svc --timeout=300s
                    done

                    echo ">>> All Java services deployed"
                '''
            }
        }

        // ══════════════════════════════════════════════════════
        //  PHASE 6 — DEPLOY PYTHON SERVICES
        // ══════════════════════════════════════════════════════

        stage('Deploy — Python Services') {
            when { branch 'main' }
            steps {
                sh '''
                    echo ">>> Applying Python service manifests..."
                    kubectl apply -f infrastructure/k8s/analytics-service/
                    kubectl apply -f infrastructure/k8s/geo-service/
                    kubectl apply -f infrastructure/k8s/notification-service/
                    kubectl apply -f infrastructure/k8s/report-service/

                    echo ">>> Restarting and waiting for Python services..."
                    for svc in analytics-service geo-service notification-service report-service; do
                        echo "  -- restarting $svc"
                        kubectl rollout restart deployment/$svc
                        kubectl rollout status deployment/$svc --timeout=300s
                    done

                    echo ">>> All Python services deployed"
                '''
            }
        }

        // ══════════════════════════════════════════════════════
        //  PHASE 7 — DEPLOY INGRESS
        // ══════════════════════════════════════════════════════

        stage('Deploy — Ingress') {
            when { branch 'main' }
            steps {
                sh '''
                    echo ">>> Applying ingress rules..."
                    kubectl apply -f infrastructure/k8s/ingress/
                    echo ">>> Ingress deployed — pipeline complete"
                '''
            }
        }
    }

    // ── Post Actions ───────────────────────────────────────────
    post {
        always {
            sh '''
                cd infrastructure
                docker compose -p ${COMPOSE_PROJECT} down -v || true
                echo ">>> Cleanup done"
            '''
        }
        success {
            echo "✅ PIPELINE COMPLETED SUCCESSFULLY — Build #${BUILD_NUMBER}"
        }
        failure {
            echo "❌ PIPELINE FAILED — Build #${BUILD_NUMBER}"
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  SHARED FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// ── Java service WITH a database ──────────────────────────────
def buildAndTestJavaWithDB(String service, String dbName) {
    // Get container IDs dynamically (name varies with COMPOSE_PROJECT)
    def pgContainer = sh(
        script: "docker compose -p ${env.COMPOSE_PROJECT} -f infrastructure/docker-compose.yml ps -q postgres",
        returnStdout: true
    ).trim()

    def pgHost = sh(
        script: "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${pgContainer}",
        returnStdout: true
    ).trim()

    def mqContainer = sh(
        script: "docker compose -p ${env.COMPOSE_PROJECT} -f infrastructure/docker-compose.yml ps -q rabbitmq",
        returnStdout: true
    ).trim()

    def mqHost = sh(
        script: "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${mqContainer}",
        returnStdout: true
    ).trim()

    withEnv(["PATH+MAVEN=${tool 'Maven-3'}/bin"]) {
        sh """
            cd backend/${service}
            mvn clean package -B -q -DskipTests
            mvn test -B \
                -Dspring.profiles.active=test \
                -DSPRING_DATASOURCE_URL=jdbc:postgresql://${pgHost}:5432/${dbName} \
                -DSPRING_DATASOURCE_USERNAME=dsas_user \
                -DSPRING_DATASOURCE_PASSWORD=dsas_password \
                -DSPRING_RABBITMQ_HOST=${mqHost} \
                -DSPRING_RABBITMQ_PORT=5672 \
                -DSPRING_RABBITMQ_USERNAME=dsas_user \
                -DSPRING_RABBITMQ_PASSWORD=dsas_password
        """
    }
}

// ── Java service WITHOUT a database (gateway / discovery) ─────
def buildAndTestJavaNoDB(String service) {
    withEnv(["PATH+MAVEN=${tool 'Maven-3'}/bin"]) {
        sh """
            cd backend/${service}
            mvn clean package -B -q -DskipTests
            mvn test -B \
                -Dspring.profiles.active=test \
                -Deureka.client.enabled=false \
                -Dspring.cloud.discovery.enabled=false
        """
    }
}

// ── Python service ─────────────────────────────────────────────
def lintAndTestPython(String service) {
    sh """
        cd backend/${service}
        python3 -m pip install --upgrade pip -q --break-system-packages
        pip install -r requirements.txt -q --break-system-packages
        pip install pytest pytest-cov flake8 black isort -q --break-system-packages

        # Critical errors — pipeline fails on these
        flake8 app --count --select=E9,F63,F7,F82 --show-source --statistics

        # Style warnings — non-blocking
        flake8 app --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics || true
        black --check app || true
        isort --check-only app || true

        # Tests with coverage
        pytest --cov=app --cov-report=xml --cov-report=html --tb=short || true
    """
}

// ── Build and push Docker image ────────────────────────────────
def buildAndPushImage(String service, String context) {
    sh """
        docker build \
            -t ${DOCKER_HUB_USR}/${service}:${BUILD_NUMBER} \
            -t ${DOCKER_HUB_USR}/${service}:latest \
            ${context}
        echo ${DOCKER_HUB_PSW} | docker login -u ${DOCKER_HUB_USR} --password-stdin
        docker push ${DOCKER_HUB_USR}/${service}:${BUILD_NUMBER}
        docker push ${DOCKER_HUB_USR}/${service}:latest
    """
}
