# AWS Deployment with CloudFormation

This directory contains infrastructure-as-code for deploying FarmSync to AWS.

## Services Used

- **RDS PostgreSQL** - Database with PostGIS
- **App Runner** - Containerized backend deployment
- **S3** - Image storage
- **CloudFront** - CDN for images
- **Route 53** - Domain management
- **CloudWatch** - Logging & monitoring
- **Secrets Manager** - Store sensitive config

## Deployment

### Prerequisites
- AWS CLI configured: `aws configure`
- Docker installed
- Domain registered in Route 53

### Step 1: Create RDS Database

```bash
aws rds create-db-instance \
  --db-instance-identifier farmsync-postgres \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.2 \
  --allocated-storage 20 \
  --storage-type gp2 \
  --master-username postgres \
  --master-user-password YourSecurePassword123! \
  --vpc-security-group-ids sg-xxxxxxxx \
  --enable-cloudwatch-logs-exports postgresql
```

### Step 2: Store Secrets

```bash
aws secretsmanager create-secret \
  --name farmsync/db \
  --secret-string '{
    "engine": "postgres",
    "host": "farmsync-postgres.xxxxx.us-east-1.rds.amazonaws.com",
    "port": 5432,
    "dbname": "farmsync",
    "username": "postgres",
    "password": "YourSecurePassword123!"
  }'

aws secretsmanager create-secret \
  --name farmsync/jwt \
  --secret-string '{"jwtSecret": "your-long-random-secret-key-here"}'
```

### Step 3: Build & Push Docker Image

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t farmsync-backend:latest ../backend

# Tag image
docker tag farmsync-backend:latest \
  YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/farmsync-backend:latest

# Push image
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/farmsync-backend:latest
```

### Step 4: Deploy with App Runner

```bash
aws apprunner create-service \
  --service-name farmsync-api \
  --source-configuration '
  {
    "ImageRepository": {
      "ImageIdentifier": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/farmsync-backend:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "3000",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production",
          "DATABASE_URL": "postgresql://...",
          "JWT_SECRET": "from-secrets-manager"
        }
      }
    }
  }' \
  --auto-deployments-enabled
```

### Step 5: Set Up S3 & CloudFront

```bash
# Create S3 bucket
aws s3api create-bucket \
  --bucket farmsync-images \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket farmsync-images \
  --versioning-configuration Status=Enabled

# Block public access
aws s3api put-public-access-block \
  --bucket farmsync-images \
  --public-access-block-configuration '
  {
    "BlockPublicAcls": true,
    "IgnorePublicAcls": true,
    "BlockPublicPolicy": true,
    "RestrictPublicBuckets": true
  }'

# Create CloudFront distribution (use AWS Console or CDK)
```

## Monitoring

### CloudWatch Logs
```bash
aws logs tail /aws/apprunner/farmsync-api --follow
```

### CloudWatch Metrics
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/AppRunner \
  --metric-name InstanceCount \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average
```

## Cost Optimization

- **RDS**: Use db.t3.micro ($30/month)
- **App Runner**: $4 per vCPU + $1 per GB RAM (~$50/month)
- **S3**: Pay per GB (~$0.023/GB)
- **CloudFront**: Pay for data transfer (~$0.085/GB)
- **Estimated cost**: $80-150/month for MVP

## Auto-scaling

App Runner automatically scales based on CPU/memory. Configure limits:

```bash
aws apprunner update-service \
  --service-arn arn:aws:apprunner:us-east-1:...:service/farmsync-api/... \
  --auto-scaling-configuration-arn arn:aws:apprunner:us-east-1:...:autoscalingconfiguration/farmsync-scaling/1
```

## Backup & Disaster Recovery

RDS automated backups are enabled (7-day retention). For critical data:

```bash
aws rds create-db-snapshot \
  --db-instance-identifier farmsync-postgres \
  --db-snapshot-identifier farmsync-backup-$(date +%s)
```

## Domain Setup

1. Register domain in Route 53
2. Create DNS record:
   ```
   api.farmsync.com CNAME farmsync-api.xxxxx.us-east-1.apprunner.com
   ```
3. Request SSL certificate from ACM (free)
4. Attach to App Runner

## GitHub Actions CI/CD

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Build and Push Docker Image
        run: |
          docker build -t farmsync-backend:${{ github.sha }} ./backend
          docker tag farmsync-backend:${{ github.sha }} farmsync-backend:latest
          # Push to ECR...
      
      - name: Update App Runner
        run: |
          aws apprunner update-service \
            --service-arn ${{ secrets.APPRUNNER_SERVICE_ARN }} \
            --source-configuration...
```

---

**Questions?** See AWS documentation or contact the team.
