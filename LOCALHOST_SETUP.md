# MedChain Localhost Setup Guide

## Prerequisites
You mentioned you have:
- Node.js
- Express
- SQL

## Step 1: Extract and Navigate to Project
```bash
# Extract the downloaded zip file
unzip medchain-project.zip
cd medchain-project

# Or if you have a different zip name:
# unzip your-downloaded-file.zip
# cd extracted-folder-name
```

## Step 2: Install Basic Dependencies
```bash
# Install all project dependencies
npm install

# If you encounter permission issues, use:
sudo npm install
```

## Step 3: Blockchain Dependencies
```bash
# Install blockchain and Web3 related packages
npm install web3 ethers @ethereum/web3-providers @openzeppelin/contracts
npm install --save-dev hardhat @nomiclabs/hardhat-ethers @nomiclabs/hardhat-waffle
npm install ipfs-http-client crypto-js
npm install @solana/web3.js @solana/spl-token  # If using Solana
```

## Step 4: AI/ML Dependencies
```bash
# Install AI and Machine Learning packages
npm install @tensorflow/tfjs @tensorflow/tfjs-node
npm install brain.js ml-matrix natural
npm install opencv4nodejs-prebuilt  # For computer vision
npm install @google-cloud/vision @google-cloud/speech  # Google AI services
npm install openai anthropic  # AI API clients
```

## Step 5: IoT and Real-time Dependencies
```bash
# Install IoT and real-time communication packages
npm install mqtt socket.io ws
npm install serialport node-dht-sensor  # For hardware sensors
npm install redis bull  # For job queues
```

## Step 6: Voice and Audio Processing
```bash
# Install voice and audio processing packages
npm install node-record-lpcm16 @google-cloud/speech
npm install @google-cloud/text-to-speech
npm install twilio  # For voice calls
npm install speech-to-text-wav ffmpeg-static
```

## Step 7: Payment and UPI Integration
```bash
# Install payment processing packages
npm install razorpay paytm-pg stripe
npm install upi-payment-gateway
```

## Step 8: Database Setup
```bash
# Install additional database packages
npm install better-sqlite3 mysql2 pg
npm install prisma @prisma/client  # Alternative ORM
npm install sequelize mysql2  # If using MySQL with Sequelize
```

## Step 9: Environment Configuration
Create a `.env` file in the root directory:
```bash
# Create environment file
touch .env
```

Add these variables to `.env`:
```env
# Database Configuration
DATABASE_URL="file:./medchain.db"
DB_HOST=localhost
DB_PORT=3306
DB_NAME=medchain
DB_USER=root
DB_PASSWORD=your_password

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Blockchain Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-infura-key
PRIVATE_KEY=your-ethereum-private-key
CONTRACT_ADDRESS=your-deployed-contract-address

# AI API Keys
OPENAI_API_KEY=your-openai-api-key
GOOGLE_CLOUD_API_KEY=your-google-cloud-key

# Voice Services
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# Payment Gateways
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
UPI_MERCHANT_ID=your-upi-merchant-id

# IoT Configuration
MQTT_BROKER_URL=mqtt://localhost:1883
REDIS_URL=redis://localhost:6379
```

## Step 10: Database Setup and Verification
```bash
# Initialize the database
npm run db:push

# Seed the database with sample data
npm run db:seed

# If the above commands don't exist, create them manually:
npx drizzle-kit push:sqlite
```

## Step 11: Start the Application
```bash
# Start the development server
npm run dev

# Or if that doesn't work:
npm start
```

## Step 12: Verify Database Data
You can check your database in multiple ways:

### Option 1: Using SQLite Browser
1. Download DB Browser for SQLite: https://sqlitebrowser.org/
2. Open the `medchain.db` file in the project root
3. Browse tables: users, drugs, pharmacies, inventory, verifications

### Option 2: Using Command Line
```bash
# Install sqlite3 command line tool
npm install -g sqlite3

# Open database
sqlite3 medchain.db

# Check tables
.tables

# View data
SELECT * FROM users;
SELECT * FROM drugs;
SELECT * FROM pharmacies;
SELECT * FROM inventory;
SELECT * FROM verifications;

# Exit
.exit
```

### Option 3: Using Database Status Page
Once the server is running, visit:
- http://localhost:5000/database-status (HTML interface)
- http://localhost:5000/api/database-status (JSON API)

## Step 13: Test All Features
Visit these URLs to test all features:
- http://localhost:5000 (Main application)
- http://localhost:5000/verify-drug (Drug verification)
- http://localhost:5000/emergency-locator (Emergency stock locator)
- http://localhost:5000/blockchain-tracker (Blockchain tracking)
- http://localhost:5000/iot-monitoring (IoT sensors)
- http://localhost:5000/ai-forecasting (AI predictions)
- http://localhost:5000/ivr-system (Voice system)
- http://localhost:5000/incentive-system (Rewards system)

## Common Issues and Solutions

### Issue 1: Port Already in Use
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=3000 npm run dev
```

### Issue 2: Database Connection Error
```bash
# Check if database file exists
ls -la medchain.db

# If not, create it
touch medchain.db
npm run db:push
```

### Issue 3: Missing Dependencies
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue 4: Permission Errors
```bash
# Fix permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP node_modules
```

## Advanced Setup (Optional)

### Docker Setup
```bash
# Build Docker image
docker build -t medchain .

# Run with Docker
docker run -p 5000:5000 medchain
```

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start
```

## Monitoring and Logging
```bash
# Install monitoring tools
npm install pm2 morgan winston

# Start with PM2
pm2 start npm --name "medchain" -- run dev
pm2 status
pm2 logs medchain
```

## Database Backup
```bash
# Backup database
cp medchain.db medchain.db.backup

# Restore database
cp medchain.db.backup medchain.db
```

## Testing
```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

## Additional AI/ML Setup

### TensorFlow.js Setup
```bash
# Install TensorFlow.js with GPU support
npm install @tensorflow/tfjs-node-gpu

# Or CPU version
npm install @tensorflow/tfjs-node
```

### Python AI Services (Optional)
```bash
# Install Python dependencies for AI features
pip install tensorflow scikit-learn pandas numpy
pip install flask flask-cors  # For AI microservices
```

## Blockchain Development Environment

### Hardhat Setup
```bash
# Initialize Hardhat
npx hardhat init

# Compile contracts
npx hardhat compile

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

### Ganache Setup (Local Blockchain)
```bash
# Install Ganache CLI
npm install -g ganache-cli

# Start local blockchain
ganache-cli -p 8545 -a 10 -e 1000
```

## Final Verification Checklist

1. ✅ Server starts on http://localhost:5000
2. ✅ Database file exists and contains data
3. ✅ All pages load without errors
4. ✅ User registration and login work
5. ✅ Drug verification returns results
6. ✅ Emergency locator shows pharmacies
7. ✅ Advanced features are accessible
8. ✅ API endpoints respond correctly

## Getting Help

If you encounter issues:
1. Check the console logs for error messages
2. Verify all dependencies are installed
3. Ensure database is properly initialized
4. Check that all environment variables are set
5. Try restarting the server

## Next Steps
Once everything is working:
1. Configure your AI API keys for real functionality
2. Set up blockchain network connections
3. Configure payment gateways
4. Set up IoT sensor connections
5. Customize the application for your needs

Your MedChain application should now be fully functional on localhost with all advanced features!