// ═══════════════════════════════════════════════════════════════
//  DSAS — Targeted CI/CD Pipeline
//  Scope: api-gateway + auth-service only
//  Order: Docker Login → Build/Push Images → Deploy via Ansible
// ═══════════════════════════════════════════════════════════════

pipeline {
    agent any

    environment {
        COMPOSE_PROJECT           = "dsas-test-${BUILD_NUMBER}"
        DOCKER_USER               = 'tinfeh'
        ANSIBLE_HOST_KEY_CHECKING = 'False'
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

        // ── Stage 2: Docker Hub Login ──────────────────────────
        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'HUB_USER',
                    passwordVariable: 'HUB_PASS'
                )]) {
                    sh 'echo $HUB_PASS | docker login -u $HUB_USER --password-stdin'
                }
            }
        }

        // ══════════════════════════════════════════════════════
        //  PHASE 1 — BUILD & PUSH DOCKER IMAGES
        // ══════════════════════════════════════════════════════

        stage('Build & Push Images') {
            parallel {
                stage('img: api-gateway') {
                    steps { buildAndPushImage('api-gateway', 'backend/api-gateway') }
                }
                stage('img: auth-service') {
                    steps { buildAndPushImage('auth-service', 'backend/auth-service') }
                }
            }
        }

        // ══════════════════════════════════════════════════════
        //  PHASE 2 — ROLLING RESTART ON KUBERNETES VIA ANSIBLE
        //  - Skips vps-setup (infra already exists)
        //  - Skips apply_manifests (no manifest changes)
        //  - Only restarts and verifies api-gateway + auth-service
        // ══════════════════════════════════════════════════════

        stage('Deploy to VPS via Ansible') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'ansible-vault-pass',
                        variable: 'VAULT_PASS'
                    ),
                    sshUserPrivateKey(
                        credentialsId: 'vps-ssh-key',
                        keyFileVariable:  'SSH_KEY_FILE',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh '''
    export PATH=$PATH:/var/jenkins_home/.local/bin

    echo "$VAULT_PASS" > /tmp/dsas_vault_pass.txt
    chmod 600 /tmp/dsas_vault_pass.txt

    which ansible-playbook || pip install ansible --break-system-packages --quiet

    ansible-galaxy collection install \
        community.general \
        ansible.posix \
        --force-with-deps

    ansible-playbook ansible/deploy.yml \
        -i ansible/inventory/hosts.ini \
        --vault-password-file /tmp/dsas_vault_pass.txt \
        --private-key "$SSH_KEY_FILE" \
        --extra-vars "ansible_user=${SSH_USER}" \
        --extra-vars "image_tag=${BUILD_NUMBER}" \
        --extra-vars "deploy_manifests=false" \
        --extra-vars '{"app_deployments": ["api-gateway", "auth-service"]}' \
        -v
'''
                }
            }
        }
    }

    // ── Post Actions ───────────────────────────────────────────
    post {
        always {
            sh '''
                docker logout || true
                rm -f /tmp/dsas_vault_pass.txt
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

def buildAndPushImage(String service, String context) {
    withEnv(["SERVICE=${service}", "CONTEXT=${context}"]) {
        sh '''
            docker build \
                -t $DOCKER_USER/$SERVICE:$BUILD_NUMBER \
                -t $DOCKER_USER/$SERVICE:latest \
                $CONTEXT
            docker push $DOCKER_USER/$SERVICE:$BUILD_NUMBER
            docker push $DOCKER_USER/$SERVICE:latest
        '''
    }
}