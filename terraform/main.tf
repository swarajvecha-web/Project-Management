# ============================================================
# terraform/main.tf
# Root config: provider, backend (S3 state), and module calls
# ============================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27"
    }
  }

  # Remote state in S3 + DynamoDB locking
  # Create these manually ONCE before running terraform init:
  #   aws s3 mb s3://jiraclone-tfstate-<your-account-id>
  #   aws dynamodb create-table --table-name jiraclone-tf-lock \
  #       --attribute-definitions AttributeName=LockID,AttributeType=S \
  #       --key-schema AttributeName=LockID,KeyType=HASH \
  #       --billing-mode PAY_PER_REQUEST
  backend "s3" {
    bucket         = "jiraclone-tfstate-385105852446"
    key            = "eks/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "jiraclone-tf-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

# ── Data sources ─────────────────────────────────────────────
data "aws_availability_zones" "available" {
  state = "available"
}
