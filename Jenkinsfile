// ============================================================
// Jenkinsfile – JiraClone CI/CD Pipeline
// Declarative Pipeline for Jenkins
//
// Pre-requisites (configure in Jenkins → Manage Credentials):
//   docker-hub-creds  → Username/Password (Docker Hub)
//   aws-credentials   → AWS Access Key ID + Secret (IAM user)
//
// Jenkins plugins required:
//   Pipeline, Docker Pipeline, AWS Steps, Blue Ocean (optional)
// ============================================================

pipeline {

    agent any

    // ── Tool versions (must match Jenkins Global Tool Configuration) ──
    tools {
        nodejs 'NodeJS-18'
    }

    // ── Pipeline-level environment variables ─────────────────────────
    environment {
        // Docker Hub image names
        DOCKER_HUB_USER    = 'yourdockerhubusername'   // ← change this
        IMAGE_BACKEND      = "${DOCKER_HUB_USER}/jiraclone-backend"
        IMAGE_FRONTEND     = "${DOCKER_HUB_USER}/jiraclone-frontend"

        // AWS / EKS settings
        AWS_REGION         = 'us-east-1'               // ← change if needed
        EKS_CLUSTER_NAME   = 'jiraclone-cluster'       // ← matches terraform var
        K8S_NAMESPACE      = 'jiraclone'

        // Image tag: use Git short SHA for traceability + 'latest'
        GIT_SHORT_SHA      = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        IMAGE_TAG          = "${BUILD_NUMBER}-${GIT_SHORT_SHA}"
    }

    // ── Triggers ─────────────────────────────────────────────────────
    triggers {
        // Poll SCM every 5 minutes (or use a GitHub webhook instead)
        pollSCM('H/5 * * * *')
    }

    // ── Options ──────────────────────────────────────────────────────
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))  // keep last 10 builds
        timeout(time: 30, unit: 'MINUTES')              // fail if stuck
        disableConcurrentBuilds()                        // prevent race conditions
        timestamps()
    }

    stages {

        // ── Stage 1: Checkout ─────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                echo "📦 Branch: ${env.BRANCH_NAME} | Build: ${env.IMAGE_TAG}"
            }
        }

        // ── Stage 2: Install & Lint ────────────────────────────────────
        stage('Install & Lint') {
            parallel {
                stage('Backend – Install') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                            echo '✅ Backend dependencies installed'
                        }
                    }
                }
                stage('Frontend – Install') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            echo '✅ Frontend dependencies installed'
                        }
                    }
                }
            }
        }

        // ── Stage 3: Build Docker Images (parallel) ───────────────────
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            sh """
                                docker build \
                                    -t ${IMAGE_BACKEND}:${IMAGE_TAG} \
                                    -t ${IMAGE_BACKEND}:latest \
                                    .
                            """
                            echo "🐳 Backend image built: ${IMAGE_BACKEND}:${IMAGE_TAG}"
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh """
                                docker build \
                                    --build-arg REACT_APP_API_URL=https://api.jiraclone.yourdomain.com \
                                    -t ${IMAGE_FRONTEND}:${IMAGE_TAG} \
                                    -t ${IMAGE_FRONTEND}:latest \
                                    .
                            """
                            echo "🐳 Frontend image built: ${IMAGE_FRONTEND}:${IMAGE_TAG}"
                        }
                    }
                }
            }
        }

        // ── Stage 4: Push to Docker Hub ────────────────────────────────
        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    sh """
                        docker push ${IMAGE_BACKEND}:${IMAGE_TAG}
                        docker push ${IMAGE_BACKEND}:latest
                        docker push ${IMAGE_FRONTEND}:${IMAGE_TAG}
                        docker push ${IMAGE_FRONTEND}:latest
                    """
                    echo "🚀 Images pushed to Docker Hub"
                }
            }
        }

        // ── Stage 5: Update Kubernetes Image Tags ──────────────────────
        // Inline sed replaces image tags in the manifests before applying,
        // ensuring the exact build is deployed (not just :latest).
        stage('Deploy to EKS') {
            when {
                // Only deploy from main / master branch
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh """
                        # Authenticate kubectl with EKS
                        aws eks update-kubeconfig \
                            --region ${AWS_REGION} \
                            --name ${EKS_CLUSTER_NAME}

                        # Apply all base manifests
                        kubectl apply -f k8s/ -n ${K8S_NAMESPACE}

                        # Rolling update: inject the exact image tag
                        kubectl set image deployment/jiraclone-backend \
                            backend=${IMAGE_BACKEND}:${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE}

                        kubectl set image deployment/jiraclone-frontend \
                            frontend=${IMAGE_FRONTEND}:${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE}

                        # Wait for rollout to complete (fails build if pods crash)
                        kubectl rollout status deployment/jiraclone-backend  -n ${K8S_NAMESPACE} --timeout=120s
                        kubectl rollout status deployment/jiraclone-frontend -n ${K8S_NAMESPACE} --timeout=120s

                        echo '✅ Deployment complete!'
                    """
                }
            }
        }

        // ── Stage 6: Smoke Test ────────────────────────────────────────
        stage('Smoke Test') {
            when {
                anyOf { branch 'main'; branch 'master' }
            }
            steps {
                sh """
                    sleep 10  # give pods a moment to become ready
                    # Basic HTTP check against the backend health endpoint
                    curl -f https://api.jiraclone.yourdomain.com/health || \
                        (echo '❌ Health check failed!' && exit 1)
                    echo '✅ Smoke test passed'
                """
            }
        }
    }

    // ── Post-build actions ────────────────────────────────────────────
    post {
        always {
            // Clean up local Docker images to free disk space on the agent
            sh """
                docker rmi ${IMAGE_BACKEND}:${IMAGE_TAG}  || true
                docker rmi ${IMAGE_FRONTEND}:${IMAGE_TAG} || true
                docker system prune -f || true
            """
            echo '🧹 Docker cleanup complete'
        }
        success {
            echo "✅ Pipeline SUCCESS — ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
        failure {
            echo "❌ Pipeline FAILED — ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            // Add email/Slack notification here if needed:
            // mail to: 'team@yourcompany.com', subject: "Build Failed: ${env.JOB_NAME}"
        }
    }
}
