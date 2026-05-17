# ============================================================
# terraform/terraform.tfvars
# Non-secret variable overrides — safe to commit to git.
# NEVER put passwords, keys, or tokens in this file.
# ============================================================

aws_region   = "us-east-1"
project_name = "jiraclone"
environment  = "prod"

# VPC
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
private_subnet_cidrs = ["10.0.10.0/24", "10.0.11.0/24"]

# EKS
cluster_name       = "jiraclone-cluster"
cluster_version    = "1.29"
node_instance_type = "t3.micro"
node_desired_count = 2
node_min_count     = 1
node_max_count     = 4
