pipeline {
 
    agent any
 
    environment {
        IMAGE = "google-classroom-frontend-jenkins:${BUILD_NUMBER}"
        CONT = "google-classroom-frontend-jenkins"
    }
 
    stages {
 
        stage('Checkout') {
            steps { checkout scm }
        }
 
        stage('Debug') {
            steps {
                bat 'echo IMAGE=%IMAGE%'
            }
        }
 
        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE% .'
            }
        }
 
        stage('Run Container') {
            steps {
                bat 'docker rm -f %CONT% || true'
                bat 'docker run -d --name %CONT% -p 4206:80 %IMAGE%'
            }
        }
 
    }
}