# Super Legit Advance - Deployment Scripts

This directory contains scripts for deploying, managing, and maintaining the Super Legit Advance loan management system.

## Scripts Overview

### 1. `deploy.sh` - Main Deployment Script

**Purpose**: Complete deployment automation for all environments.

**Usage**:
```bash
# Full deployment to production
./deploy.sh deploy production

# Start services in development
./deploy.sh start development

# View logs
./deploy.sh logs backend

# Backup database
./deploy.sh backup staging

# Run tests
./deploy.sh test development