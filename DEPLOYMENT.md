# MedChain Deployment Guide

This guide covers deploying MedChain to various platforms and environments.

## 🚀 Quick Deploy Options

### Replit (Recommended)
1. Fork the repository on GitHub
2. Import to Replit from GitHub
3. Configure environment variables
4. Click "Run" - automatic deployment

### Vercel (Frontend + Serverless)
1. Connect GitHub repository to Vercel
2. Configure build settings:
   ```bash
   Build Command: npm run build
   Output Directory: dist
   ```
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Railway (Full Stack)
1. Connect GitHub repository to Railway
2. Add PostgreSQL database service
3. Configure environment variables
4. Deploy with zero configuration

## 🛠️ Production Setup

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
PGHOST=your-db-host
PGPORT=5432
PGUSER=your-db-user
PGPASSWORD=your-db-password
PGDATABASE=your-db-name

# Maps
OLA_MAPS_API_KEY=your-ola-maps-key
OLA_MAPS_CLIENT_ID=your-client-id
OLA_MAPS_CLIENT_SECRET=your-client-secret

# Security
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret

# External Services (Optional)
OPENAI_API_KEY=your-openai-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

### Database Setup
```bash
# Create production database
createdb medchain_production

# Run migrations
npm run db:push

# Seed initial data
npm run db:seed:production
```

### Build Production
```bash
# Install dependencies
npm ci --only=production

# Build frontend
npm run build

# Start production server
npm start
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/medchain
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=medchain
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Deploy with Docker
```bash
# Build and run
docker-compose up -d

# Check logs
docker-compose logs -f

# Update deployment
docker-compose pull && docker-compose up -d
```

## ☁️ Cloud Platforms

### AWS Deployment

#### EC2 with RDS
```bash
# Launch EC2 instance
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type t3.micro \
  --key-name your-key-pair

# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier medchain-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password securepassword \
  --allocated-storage 20
```

#### ECS with Fargate
```yaml
# task-definition.json
{
  "family": "medchain-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "medchain-app",
      "image": "your-account.dkr.ecr.region.amazonaws.com/medchain:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ]
    }
  ]
}
```

### Google Cloud Platform

#### App Engine
```yaml
# app.yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production
  DATABASE_URL: postgresql://user:pass@host/db

automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6
```

#### Cloud Run
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/medchain

# Deploy to Cloud Run
gcloud run deploy medchain \
  --image gcr.io/PROJECT-ID/medchain \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Deployment

#### App Service
```bash
# Create resource group
az group create --name medchain-rg --location eastus

# Create app service plan
az appservice plan create \
  --name medchain-plan \
  --resource-group medchain-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group medchain-rg \
  --plan medchain-plan \
  --name medchain-app \
  --runtime "NODE|18-lts"
```

## 📊 Monitoring & Logging

### Health Checks
```javascript
// Add to server/index.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

### Logging
```bash
# Install logging packages
npm install winston morgan

# Configure structured logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Monitoring
```bash
# Install monitoring tools
npm install prometheus-client newrelic

# Add metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
});
```

## 🔒 Security Considerations

### HTTPS Setup
```bash
# Generate SSL certificates
certbot certonly --webroot -w /var/www/html -d yourdomain.com

# Configure nginx
server {
  listen 443 ssl;
  server_name yourdomain.com;
  
  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
  
  location / {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

### Security Headers
```javascript
// Add security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to production
      run: |
        # Your deployment commands here
        echo "Deploying to production..."
```

## 📈 Performance Optimization

### Database Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_drugs_batch_number ON drugs(batch_number);
CREATE INDEX idx_inventory_drug_id ON inventory(drug_id);
CREATE INDEX idx_inventory_pharmacy_id ON inventory(pharmacy_id);
CREATE INDEX idx_verifications_drug_id ON verifications(drug_id);
```

### Caching
```javascript
// Add Redis caching
const redis = require('redis');
const client = redis.createClient();

// Cache frequently accessed data
app.get('/api/drugs', async (req, res) => {
  const cached = await client.get('drugs');
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  const drugs = await storage.getAllDrugs();
  await client.setex('drugs', 300, JSON.stringify(drugs));
  res.json(drugs);
});
```

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
psql $DATABASE_URL -c "SELECT version();"

# Verify environment variables
printenv | grep PG
```

#### Build Failures
```bash
# Clear cache and rebuild
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

### Rollback Strategy
```bash
# Quick rollback using git
git revert HEAD~1
git push origin main

# Database rollback
pg_restore --clean --if-exists backup.dump
```

## 📞 Support

For deployment issues:
1. Check the logs for specific error messages
2. Verify all environment variables are set
3. Test database connectivity
4. Check firewall and security group settings
5. Review resource limits and quotas

---

**MedChain Production Deployment Guide** 🚀