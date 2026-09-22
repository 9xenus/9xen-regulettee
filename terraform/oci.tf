# ==============================================================================
# LEXSHIELD SOVEREIGN CLOUD INFRASTRUCTURE - ORACLE CLOUD INFRASTRUCTURE (OCI)
# ==============================================================================
# Production Terraform blueprint for deployment in OCI EU Frankfurt or Zurich
# ensuring GDPR compliance, data sovereignty, and high performance.

terraform {
  required_version = ">= 1.2.0"
}

# ------------------------------------------------------------------------------
# 1. NETWORKING (VCN & SUBNETS)
# ------------------------------------------------------------------------------
resource "oci_core_vcn" "lexshield_vcn" {
  cidr_block     = "10.0.0.0/16"
  compartment_id = var.compartment_ocid
  display_name   = "lexshield-sovereign-vcn"
  dns_label      = "lexshieldvcn"
}

resource "oci_core_internet_gateway" "lexshield_ig" {
  compartment_id = var.compartment_ocid
  display_name   = "lexshield-internet-gateway"
  vcn_id         = oci_core_vcn.lexshield_vcn.id
}

resource "oci_core_route_table" "lexshield_rt" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.lexshield_vcn.id
  display_name   = "lexshield-public-route-table"

  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.lexshield_ig.id
  }
}

resource "oci_core_subnet" "public_subnet" {
  cidr_block        = "10.0.1.0/24"
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.lexshield_vcn.id
  display_name      = "lexshield-public-subnet"
  dns_label         = "publicsub"
  route_table_id    = oci_core_route_table.lexshield_rt.id
  security_list_ids = [oci_core_security_list.lexshield_sl.id]
}

# ------------------------------------------------------------------------------
# 2. SECURITY LIST (FIREWALL RULES)
# ------------------------------------------------------------------------------
resource "oci_core_security_list" "lexshield_sl" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.lexshield_vcn.id
  display_name   = "lexshield-security-list"

  # Egress: Allow all outbound
  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  # Ingress: Allow SSH (22), HTTP (80), HTTPS (443), and App Port (3000)
  ingress_security_rules {
    protocol = "6" # TCP
    source   = "0.0.0.0/0"
    tcp_options {
      min = 80
      max = 80
    }
  }

  ingress_security_rules {
    protocol = "6" # TCP
    source   = "0.0.0.0/0"
    tcp_options {
      min = 443
      max = 443
    }
  }

  ingress_security_rules {
    protocol = "6" # TCP
    source   = "0.0.0.0/0"
    tcp_options {
      min = 3000
      max = 3000
    }
  }

  ingress_security_rules {
    protocol = "6" # TCP
    source   = "0.0.0.0/0"
    tcp_options {
      min = 22
      max = 22
    }
  }
}

# ------------------------------------------------------------------------------
# 3. OCI CONTAINER INSTANCE / COMPUTE INSTANCE
# ------------------------------------------------------------------------------
resource "oci_core_instance" "lexshield_app_server" {
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_ocid
  display_name        = "lexshield-production-node"
  shape               = "VM.Standard.A1.Flex" # Ampere A1 Compute (Flexible 4 OCPU, 24GB RAM)

  shape_config {
    ocpus         = 4
    memory_in_gbs = 24
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.public_subnet.id
    assign_public_ip = true
    hostname_label   = "lexshield-prod"
  }

  source_details {
    source_type = "image"
    source_id   = var.ubuntu_image_ocid
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data           = base64encode(<<-EOF
      #!/bin/bash
      apt-get update -y
      apt-get install -y docker.io docker-compose-v2 git
      systemctl enable docker
      systemctl start docker
      usermod -aG docker ubuntu
    EOF
    )
  }
}

# ------------------------------------------------------------------------------
# 4. VARIABLES
# ------------------------------------------------------------------------------
variable "compartment_ocid" {
  type        = string
  description = "OCI Compartment OCID"
}

variable "ubuntu_image_ocid" {
  type        = string
  description = "OCID for Ubuntu 22.04 LTS Image in target OCI Region"
}

variable "ssh_public_key" {
  type        = string
  description = "SSH Public Key for Server Management"
}

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_ocid
}
