pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        APP_NAME = 'ecommerce-backend'
        REGISTRY_IMAGE = 'chetima/ecommerce-backend'
        IMAGE_TAG = "${BUILD_NUMBER}"
        DB_HOST = 'localhost'
        DB_PORT = '5433'
        DB_NAME = 'ecommerce_test'
        DB_USER = 'ecommerce_user'
        DB_PASSWORD = 'ecommerce_password'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        buildDiscarder(
            logRotator(numToKeepStr: '10')
        )
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Branch Info') {
            steps {
                echo "Branch: ${env.BRANCH_NAME}"
                echo "Build Number: ${env.BUILD_NUMBER}"
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('application/backend') {
                    sh '''
                        node --version
                        npm --version
                        npm ci
                    '''
                }
            }
        }

        stage('Start Test Database') {
            steps {
                sh '''
                    docker rm -f ecommerce-postgres-test || true

                    docker run -d \
                      --name ecommerce-postgres-test \
                      -e POSTGRES_DB=$DB_NAME \
                      -e POSTGRES_USER=$DB_USER \
                      -e POSTGRES_PASSWORD=$DB_PASSWORD \
                      -p 5433:5432 \
                      postgres:16-alpine
                '''
            }
        }

        stage('Wait for Test Database') {
            steps {
                sh '''
                    echo "Waiting for PostgreSQL..."

                    for i in $(seq 1 30); do
                        if docker exec ecommerce-postgres-test \
                          pg_isready \
                          -U "$DB_USER" \
                          -d "$DB_NAME"; then
                            echo "PostgreSQL is ready"
                            exit 0
                        fi
                        sleep 2
                    done

                    docker logs ecommerce-postgres-test
                    exit 1
                '''
            }
        }

        stage('Initialize Database') {
            steps {
                dir('application/backend') {
                    sh 'npm run init-db'
                }
            }
        }

        stage('Test') {
            steps {
                dir('application/backend') {
                    sh 'npm test'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                      -t $APP_NAME:$IMAGE_TAG \
                      application/backend
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                    trivy image \
                      --exit-code 1 \
                      --severity HIGH,CRITICAL \
                      $APP_NAME:$IMAGE_TAG
                '''
            }
        }

        stage('Tag Image') {
            steps {
                sh '''
                    docker tag \
                      $APP_NAME:$IMAGE_TAG \
                      $REGISTRY_IMAGE:$IMAGE_TAG
                '''
            }
        }

        stage('Generate Image Tag') {
            steps {
                script {
                    env.GIT_SHORT_COMMIT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    env.FULL_IMAGE_TAG = "${BUILD_NUMBER}-${GIT_SHORT_COMMIT}"
                    echo "Image tag: ${env.FULL_IMAGE_TAG}"
                }
            }
        }

        stage('Push Image') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_TOKEN'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_TOKEN" | \
                          docker login \
                          -u "$DOCKER_USER" \
                          --password-stdin

                        docker push \
                          $REGISTRY_IMAGE:$IMAGE_TAG

                        docker logout
                    '''
                }
            }
        }
    }

    post {
        always {
            sh '''
                 docker image rm \
                    $APP_NAME:$IMAGE_TAG \
                    2>/dev/null || true
            '''
        }

        success {
            echo 'CI pipeline completed successfully.'
        }

        failure {
            echo 'CI pipeline failed.'
        }
    }
}
