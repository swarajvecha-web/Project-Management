# ============================================================
# terraform/eks.tf
# EKS Control Plane + Managed Node Group
# ============================================================

# ── Security Group for the EKS Cluster ───────────────────────
resource "aws_security_group" "eks_cluster" {
  name        = "${var.project_name}-eks-cluster-sg"
  description = "EKS cluster control plane security group"
  vpc_id      = aws_vpc.main.id

  # Allow all outbound (needed for API server to communicate with nodes)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-eks-cluster-sg" }
}

# ── EKS Cluster ───────────────────────────────────────────────
resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  version  = var.cluster_version
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids              = concat(aws_subnet.public[*].id, aws_subnet.private[*].id)
    security_group_ids      = [aws_security_group.eks_cluster.id]
    endpoint_public_access  = true    # kubectl from laptop / Jenkins
    endpoint_private_access = true    # nodes communicate privately
  }

  # Enable control plane logging for auditability
  enabled_cluster_log_types = ["api", "audit", "authenticator"]

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
  ]

  tags = {
    Name        = var.cluster_name
    Environment = var.environment
  }
}

# ── Managed Node Group ────────────────────────────────────────
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-nodes"
  node_role_arn   = aws_iam_role.eks_nodes.arn

  # Place nodes in PRIVATE subnets (they are not exposed to the internet)
  subnet_ids = aws_subnet.private[*].id

  instance_types = [var.node_instance_type]
  capacity_type  = "ON_DEMAND"
  ami_type       = "AL2_x86_64"

  scaling_config {
    desired_size = var.node_desired_count
    min_size     = var.node_min_count
    max_size     = var.node_max_count
  }

  # Allow graceful updates: EKS will drain nodes before replacing
  update_config {
    max_unavailable = 1
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node,
    aws_iam_role_policy_attachment.eks_cni,
    aws_iam_role_policy_attachment.eks_ecr_read,
  ]

  tags = {
    Name        = "${var.project_name}-node-group"
    Environment = var.environment
  }
}
