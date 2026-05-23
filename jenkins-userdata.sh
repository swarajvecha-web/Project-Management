#!/bin/bash
set -e
yum update -y
# Java 17
yum install -y java-17-amazon-corretto
# Jenkins
wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key
yum install -y jenkins
systemctl enable jenkins
systemctl start jenkins
# Docker
yum install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker jenkins
usermod -aG docker ec2-user
echo "Setup done" > /tmp/done.txt