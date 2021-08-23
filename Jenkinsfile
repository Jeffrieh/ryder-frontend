pipeline {
    agent { docker { image 'node:14-alpine' } }
    stages {
        stage('build') {
            steps {
               echo 'Building..'
                sh 'npm --version'
            }
        }
    }
}