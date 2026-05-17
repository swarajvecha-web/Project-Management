# ============================================================
# terraform/variables.tf
# All input variables with descriptions and sensible defaults
# ============================================================

variable "aws_region" {
  description = "AWS region to deploy all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefix used for all resource names"
  type        = string
  default     = "jiraclone"
}

variable "environment" {
  description = "Deployment environment (dev / staging / prod)"
  type        = string
  default     = "prod"
}

# ── VPC ──────────────────────────────────────────────────────
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (ALB lives here)"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (EKS nodes live here)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

# ── EKS ──────────────────────────────────────────────────────
variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "jiraclone-cluster"
}

variable "cluster_version" {
  description = "Kubernetes version for the EKS cluster"
  type        = string
  default     = "1.29"
}

variable "node_instance_type" {
  description = "EC2 instance type for EKS worker nodes"
  type        = string
  default     = "t3.medium"   # 2 vCPU, 4 GB RAM — good for dev/prod balance
}

variable "node_desired_count" {
  description = "Desired number of worker nodes"
  type        = number
  default     = 2
}

variable "node_min_count" {
  description = "Minimum number of worker nodes (HPA scaling floor)"
  type        = number
  default     = 1
}

variable "node_max_count" {
  description = "Maximum number of worker nodes (HPA scaling ceiling)"
  type        = number
  default     = 4
}
