// ============================================================
// Jenkinsfile – JiraClone CI/CD Pipeline
// Declarative Pipeline for Jenkins
//
// Pre-requisites (configure in Jenkins → Manage Credentials):
//   aws-credentials   → AWS Access Key ID + Secret (IAM user)
//
// Jenkins plugins required:
//   Pipeline, Docker Pipeline, AWS Steps, Blue Ocean (optional)
// ============================================================

pipeline {

    agent any


    // ── Pipeline-level environment variables ─────────────────────────
    environment {
        // AWS / EKS settings
        AWS_REGION         = 'us-east-1'
        AWS_ACCOUNT_ID     = '385105852446'
        EKS_CLUSTER_NAME   = 'jiraclone-cluster'
        K8S_NAMESPACE      = 'jiraclone'
        
        // ECR Repositories
        ECR_REGISTRY       = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
        IMAGE_BACKEND      = "${ECR_REGISTRY}/jiraclone-backend"
        IMAGE_FRONTEND     = "${ECR_REGISTRY}/jiraclone-frontend"

        // Image tag: use Git short SHA for traceability + BUILD_NUMBER
        GIT_SHORT_SHA      = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        IMAGE_TAG          = "${BUILD_NUMBER}-${GIT_SHORT_SHA}"
    }

    // ── Triggers ─────────────────────────────────────────────────────
    // GitHub webhook fires this pipeline automatically on every git push
    triggers {
        githubPush()
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

        // ── Stage 2: AWS Login ────────────────────────────────────────
        stage('AWS Login') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh """
                        # Login to AWS ECR
                        aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
                    """
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
                            // We use /api as the REACT_APP_API_URL so the Nginx Ingress routes it automatically
                            sh """
                                docker build \
                                    --build-arg REACT_APP_API_URL=/ \
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


        // ── Stage 4: Push to AWS ECR ──────────────────────────────────
        stage('Push to ECR') {
            steps {
                withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'aws-credentials',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh """
                        docker push ${IMAGE_BACKEND}:${IMAGE_TAG}
                        docker push ${IMAGE_BACKEND}:latest
                        docker push ${IMAGE_FRONTEND}:${IMAGE_TAG}
                        docker push ${IMAGE_FRONTEND}:latest
                    """
                    echo "🚀 Images pushed to AWS ECR"
                }
            }
        }

        // ── Stage 5: Deploy to EKS ────────────────────────────────────
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
                        kubectl apply -f k8s/mongo/ -n ${K8S_NAMESPACE}
                        kubectl apply -f k8s/backend/ -n ${K8S_NAMESPACE}
                        kubectl apply -f k8s/frontend/ -n ${K8S_NAMESPACE}
                        kubectl apply -f k8s/ingress.yaml -n ${K8S_NAMESPACE}

                        # Rolling update: inject the exact new image tags
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
    }

    // ── Post-build actions ────────────────────────────────────────────
    post {
        always {
            // Clean up local Docker images to free disk space on the Jenkins agent
            sh """
                docker rmi ${IMAGE_BACKEND}:${IMAGE_TAG}  || true
                docker rmi ${IMAGE_FRONTEND}:${IMAGE_TAG} || true
                docker system prune -f || true
            """
            echo '🧹 Docker cleanup complete'
        }
        success {
            echo "✅ Pipeline SUCCESS — \${env.JOB_NAME} #\${env.BUILD_NUMBER}"
        }
        failure {
            echo "❌ Pipeline FAILED — \${env.JOB_NAME} #\${env.BUILD_NUMBER}"
        }
    }
}
