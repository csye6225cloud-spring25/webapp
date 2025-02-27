variable "build_timestamp" {
  type    = string
  default = "manual-build"
}

variable "DB_NAME" {
  type    = string
  default = "webapp"
}

variable "DB_USER" {
  type    = string
  default = "postgres"
}

variable "DB_PASSWORD" {
  type      = string
  sensitive = true
  default   = "password"
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "gcp_project_id" {
  type    = string
  default = "dev-project-451800"
}

variable "gcp_zone" {
  type    = string
  default = "us-central1-a"
}

variable "ami_name" {
  type    = string
  default = "webapp"
}

variable "gcp_image_name_prefix" {
  type    = string
  default = "webapp"
}

variable "gcp_ssh_username" {
  type    = string
  default = "ubuntu"
}

packer {
  required_plugins {
    amazon = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/amazon"
    }
    googlecompute = {
      version = ">= 1.0.0"
      source  = "github.com/hashicorp/googlecompute"
    }
  }
}

# AWS Source Block (Ubuntu 24.04 LTS)
source "amazon-ebs" "ubuntu" {
  ami_name      = "${var.ami_name}-${var.build_timestamp}"
  instance_type = "t3.medium"
  region        = var.aws_region
  source_ami_filter {
    filters = {
      name                = "ubuntu/images/*ubuntu-noble-24.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["099720109477"]
  }
  launch_block_device_mappings {
    device_name           = "/dev/sda1"
    volume_size           = 25
    volume_type           = "gp2"
    delete_on_termination = true # Ensures EBS volume is deleted with instance termination
  }
  ssh_username = "ubuntu"
  ssh_timeout  = "30m"
}

source "googlecompute" "ubuntu" {
  project_id          = var.gcp_project_id
  zone                = var.gcp_zone
  source_image_family = "ubuntu-2404-lts-amd64"
  machine_type        = "e2-micro"
  ssh_username        = var.gcp_ssh_username
  image_name          = "${var.gcp_image_name_prefix}-${var.build_timestamp}-gcp"
}


build {
  sources = [
    "source.amazon-ebs.ubuntu",
    "source.googlecompute.ubuntu"
  ]

  // Copy the application artifact (backend.zip) from the repo.
  provisioner "file" {
    source      = "backend/backend.zip"
    destination = "/tmp/backend.zip"
  }

  // Copy the systemd service file from the repo root.
  provisioner "file" {
    source      = "csye6225.service"
    destination = "/tmp/csye6225.service"
  }

  // Update the OS packages
  provisioner "shell" {
    script = "update-system.sh"
  }



  // Install Node.js using NVM.
  provisioner "shell" {
    script = "node-setup.sh"
  }


  // Create local non-login user 'csye6225'
  provisioner "shell" {
    inline = [
      "sudo groupadd -r csye6225 || true",
      "sudo useradd -r -g csye6225 -s /usr/sbin/nologin csye6225 || true"
    ]
  }

  // Set up PostgreSQL and configure DB; environment variables passed from Packer.
  provisioner "shell" {
    script = "db-setup.sh"
    environment_vars = [
      "DB_NAME=${var.DB_NAME}",
      "DB_USER=${var.DB_USER}",
      "DB_PASSWORD=${var.DB_PASSWORD}"
    ]
  }

  // Extract the backend artifact and set ownership.
  provisioner "shell" {
    script = "app-setup.sh"
  }

  // Set up and enable the systemd service.
  provisioner "shell" {
    script = "service-setup.sh"
  }
}
