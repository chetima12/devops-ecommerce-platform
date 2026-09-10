pipeline {

    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        APP_NAME = 'ecommerce-backend'
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

                    echo "PostgreSQL did not become ready"
                    docker logs ecommerce-postgres-test
                    exit 1
                '''
            }
        }

        stage('Initialize Database') {
            steps {
                dir('application/backend') {
                    sh '''
                        npm run init-db
                    '''
                }
            }
        }

        stage('Test') {
            steps {
                dir('application/backend') {
                    sh '''
                        npm test
                    '''
                }
            }
        }
    }

    post {

        always {
            sh '''
                docker rm -f ecommerce-postgres-test || true
            '''
        }

    }
}
