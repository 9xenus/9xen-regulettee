# ==============================================================================
# EU POLICY COMPLIANCE SAAS - SOVEREIGN CLOUD INFRASTRUCTURE (TERRAFORM)
# ==============================================================================
# Strict deployment blueprint pinning resources to AWS eu-central-1 (Frankfurt)
# to enforce GDPR compliance and data residency requirements.

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket         = "lexshield-tf-state-eu-central-1"
    key            = "prod/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "lexshield-tf-lock"
  }
}

provider "aws" {
  region = "eu-central-1" # Frankfurt strictly enforced
  
  default_tags {
    tags = {
      Environment = "Production"
      Project     = "LexShield Sovereign Compliance"
      DataResidency = "EU_ONLY"
    }
  }
}

# ------------------------------------------------------------------------------
# 1. NETWORKING (VPC & SUBNETS)
# ------------------------------------------------------------------------------
resource "aws_vpc" "sovereign_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
}

resource "aws_subnet" "private_subnet_a" {
  vpc_id            = aws_vpc.sovereign_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "eu-central-1a"
}

resource "aws_subnet" "private_subnet_b" {
  vpc_id            = aws_vpc.sovereign_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "eu-central-1b"
}

# ------------------------------------------------------------------------------
# 2. ENCRYPTION AT REST (KMS)
# ------------------------------------------------------------------------------
resource "aws_kms_key" "master_db_key" {
  description             = "Master Encryption Key for Postgres RDS (Auto-Rotated)"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

resource "aws_kms_key" "tenant_vault_keys" {
  count                   = 1
  description             = "Customer Managed Keys (CMK) envelope used for S3 Evidence Vault"
  deletion_window_in_days = 30
  enable_key_rotation     = true
}

# ------------------------------------------------------------------------------
# 3. HIGH AVAILABILITY DATABASE (RDS POSTGRES)
# ------------------------------------------------------------------------------
resource "aws_db_instance" "compliance_db" {
  identifier                  = "lexshield-postgres-eu"
  engine                      = "postgres"
  engine_version              = "16.3"
  instance_class              = "db.r6g.xlarge"
  allocated_storage           = 100
  
  # Strict Compliance Requirements
  storage_encrypted           = true
  kms_key_id                  = aws_kms_key.master_db_key.arn
  multi_az                    = true # HA automated failover within EU zone
  backup_retention_period     = 35 # High retention for auditibility
  deletion_protection         = true # Prevent accidental drops
  
  db_subnet_group_name        = aws_db_subnet_group.private_rds_sg.name
  vpc_security_group_ids      = [aws_security_group.db_sg.id]
  
  username                    = "dbadmin_master"
  database_name               = "regulettee_core"
  manage_master_user_password = true # Auto-integrate with AWS Secrets Manager
}

resource "aws_db_subnet_group" "private_rds_sg" {
  name       = "sovereign-db-subnets"
  subnet_ids = [aws_subnet.private_subnet_a.id, aws_subnet.private_subnet_b.id]
}

# ------------------------------------------------------------------------------
# 4. COMPLIANCE EVIDENCE VAULT (S3)
# ------------------------------------------------------------------------------
resource "aws_s3_bucket" "evidence_vault" {
  bucket = "lexshield-secure-vault-eu-central"
}

resource "aws_s3_bucket_server_side_encryption_configuration" "vault_encryption" {
  bucket = aws_s3_bucket.evidence_vault.id

  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.tenant_vault_keys[0].arn
      sse_algorithm     = "aws:kms"
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_public_access_block" "vault_block" {
  bucket                  = aws_s3_bucket.evidence_vault.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ------------------------------------------------------------------------------
# 5. SERVERLESS COMPUTE (ECS FARGATE)
# ------------------------------------------------------------------------------
resource "aws_ecs_cluster" "app_cluster" {
  name = "lexshield-sovereign-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Networking and minimal security group access defined further...
