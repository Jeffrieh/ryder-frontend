pipeline {
    agent {
        docker { image 'docker.io/bitnami/apache:2.4-debian-10' }
    }
    stages {
        stage('Build') { 
            steps {
                sh 'npm install' 
            }
        }
    }
}