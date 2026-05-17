# ============================================================
# terraform/outputs.tf
# Values printed after `terraform apply` — used by CI/CD
# ============================================================

output "cluster_name" {
  description = "EKS cluster name (used in: aws eks update-kubeconfig)"
  value       = aws_eks_cluster.main.name
}

output "cluster_endpoint" {
  description = "EKS API server endpoint"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_ca_certificate" {
  description = "Base64-encoded cluster CA certificate"
  value       = aws_eks_cluster.main.certificate_authority[0].data
  sensitive   = true
}

output "ecr_backend_url" {
  description = "ECR URL for the backend image (use as IMAGE_BACKEND in Jenkinsfile)"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_url" {
  description = "ECR URL for the frontend image (use as IMAGE_FRONTEND in Jenkinsfile)"
  value       = aws_ecr_repository.frontend.repository_url
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "kubeconfig_command" {
  description = "Run this command to configure kubectl after apply"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${var.cluster_name}"
}
