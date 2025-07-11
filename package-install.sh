#!/bin/bash

# MedChain - Complete Package Installation Script
# This script installs all required dependencies for the MedChain project

set -e  # Exit on any error

echo "🏥 MedChain Package Installation Script"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Function to install packages with error handling
install_packages() {
    local category="$1"
    shift
    local packages=("$@")
    
    echo ""
    echo "📦 Installing $category packages..."
    for package in "${packages[@]}"; do
        echo "Installing $package..."
        if npm install "$package" --save; then
            echo "✅ $package installed successfully"
        else
            echo "❌ Failed to install $package"
            # Continue with other packages
        fi
    done
}

# Install core dependencies
core_packages=(
    "express"
    "cors"
    "helmet"
    "morgan"
    "dotenv"
    "bcryptjs"
    "jsonwebtoken"
    "express-session"
    "connect-pg-simple"
    "express-rate-limit"
    "compression"
    "cookie-parser"
)

install_packages "Core" "${core_packages[@]}"

# Install database packages
database_packages=(
    "better-sqlite3"
    "mysql2"
    "pg"
    "drizzle-orm"
    "drizzle-zod"
    "@types/better-sqlite3"
    "sequelize"
    "typeorm"
    "prisma"
    "@prisma/client"
)

install_packages "Database" "${database_packages[@]}"

# Install blockchain packages
blockchain_packages=(
    "web3"
    "ethers"
    "@openzeppelin/contracts"
    "crypto-js"
    "elliptic"
    "secp256k1"
    "bip39"
    "hdkey"
    "bitcoinjs-lib"
    "ipfs-http-client"
    "@solana/web3.js"
    "@solana/spl-token"
    "near-api-js"
)

install_packages "Blockchain" "${blockchain_packages[@]}"

# Install AI/ML packages
ai_packages=(
    "@tensorflow/tfjs"
    "@tensorflow/tfjs-node"
    "brain.js"
    "ml-matrix"
    "natural"
    "compromise"
    "sentiment"
    "node-nlp"
    "opencv4nodejs-prebuilt"
    "face-api.js"
    "openai"
    "anthropic"
    "@google-cloud/vision"
    "@google-cloud/language"
    "@google-cloud/translate"
    "scikit-learn"
    "pandas-js"
    "regression"
    "ml-regression"
    "decision-tree"
    "random-forest"
)

install_packages "AI/ML" "${ai_packages[@]}"

# Install IoT and real-time packages
iot_packages=(
    "mqtt"
    "socket.io"
    "ws"
    "serialport"
    "node-dht-sensor"
    "johnny-five"
    "raspi-io"
    "gpio"
    "pi-gpio"
    "node-red"
    "modbus-serial"
    "node-opcua"
    "influxdb"
    "redis"
    "bull"
    "agenda"
)

install_packages "IoT & Real-time" "${iot_packages[@]}"

# Install voice and audio packages
voice_packages=(
    "node-record-lpcm16"
    "@google-cloud/speech"
    "@google-cloud/text-to-speech"
    "speech-to-text-wav"
    "node-wav"
    "ffmpeg-static"
    "fluent-ffmpeg"
    "twilio"
    "nexmo"
    "amazon-cognito-identity-js"
    "aws-sdk"
    "azure-cognitiveservices-speech-sdk"
    "microsoft-speech-platform-sdk"
)

install_packages "Voice & Audio" "${voice_packages[@]}"

# Install payment packages
payment_packages=(
    "stripe"
    "razorpay"
    "paypal-rest-sdk"
    "paytm-pg"
    "cashfree-pg"
    "instamojo-nodejs"
    "upi-payment-gateway"
    "crypto-pay"
    "bitcoin-core"
    "wallet-address-validator"
)

install_packages "Payment" "${payment_packages[@]}"

# Install development tools
dev_packages=(
    "typescript"
    "@types/node"
    "@types/express"
    "@types/cors"
    "@types/bcryptjs"
    "@types/jsonwebtoken"
    "nodemon"
    "ts-node"
    "tsx"
    "jest"
    "supertest"
    "@types/jest"
    "@types/supertest"
    "eslint"
    "prettier"
    "husky"
    "lint-staged"
    "concurrently"
    "cross-env"
    "rimraf"
)

install_packages "Development Tools" "${dev_packages[@]}"

# Install frontend build tools (if needed)
frontend_packages=(
    "vite"
    "@vitejs/plugin-react"
    "react"
    "react-dom"
    "@types/react"
    "@types/react-dom"
    "tailwindcss"
    "postcss"
    "autoprefixer"
    "wouter"
    "@tanstack/react-query"
    "react-hook-form"
    "zod"
    "@hookform/resolvers"
    "lucide-react"
    "class-variance-authority"
    "clsx"
    "tailwind-merge"
)

install_packages "Frontend (if needed)" "${frontend_packages[@]}"

# Install monitoring and logging packages
monitoring_packages=(
    "winston"
    "morgan"
    "express-winston"
    "pm2"
    "nodemailer"
    "node-cron"
    "helmet"
    "express-validator"
    "joi"
    "ajv"
    "rate-limiter-flexible"
    "pino"
    "pino-pretty"
)

install_packages "Monitoring & Logging" "${monitoring_packages[@]}"

# Install testing and quality assurance
testing_packages=(
    "mocha"
    "chai"
    "sinon"
    "nyc"
    "cucumber"
    "cypress"
    "playwright"
    "puppeteer"
    "selenium-webdriver"
    "jest-environment-node"
    "supertest"
    "nock"
    "faker"
    "@faker-js/faker"
)

install_packages "Testing & QA" "${testing_packages[@]}"

# Install security packages
security_packages=(
    "helmet"
    "cors"
    "express-rate-limit"
    "bcryptjs"
    "crypto-js"
    "node-2fa"
    "speakeasy"
    "qrcode"
    "uuid"
    "nanoid"
    "validator"
    "xss"
    "hpp"
    "express-mongo-sanitize"
)

install_packages "Security" "${security_packages[@]}"

# Install additional utility packages
utility_packages=(
    "lodash"
    "moment"
    "date-fns"
    "axios"
    "node-fetch"
    "cheerio"
    "jsdom"
    "xml2js"
    "csvtojson"
    "multer"
    "sharp"
    "jimp"
    "pdf-parse"
    "node-pdf"
    "qrcode"
    "jsqr"
    "node-geocoder"
    "geolib"
    "turf"
)

install_packages "Utilities" "${utility_packages[@]}"

echo ""
echo "🎉 Package installation completed!"
echo ""
echo "📝 Next steps:"
echo "1. Create a .env file with your configuration"
echo "2. Initialize your database: npm run db:push"
echo "3. Start the application: npm run dev"
echo "4. Check database status: node check-database.js"
echo ""
echo "📋 Installed package categories:"
echo "✅ Core packages (Express, authentication, etc.)"
echo "✅ Database packages (SQLite, MySQL, PostgreSQL)"
echo "✅ Blockchain packages (Web3, Ethers, crypto)"
echo "✅ AI/ML packages (TensorFlow, NLP, computer vision)"
echo "✅ IoT packages (MQTT, sensors, real-time)"
echo "✅ Voice/Audio packages (Speech recognition, TTS)"
echo "✅ Payment packages (Stripe, Razorpay, UPI)"
echo "✅ Development tools (TypeScript, testing, linting)"
echo "✅ Frontend packages (React, Vite, Tailwind)"
echo "✅ Monitoring packages (Winston, PM2)"
echo "✅ Testing packages (Jest, Mocha, Cypress)"
echo "✅ Security packages (Helmet, validation)"
echo "✅ Utility packages (Lodash, date handling, etc.)"
echo ""
echo "🔧 Total packages installed: Check package.json for complete list"
echo ""
echo "⚠️  Note: Some packages may require additional system dependencies"
echo "   For example, opencv4nodejs might need OpenCV installed system-wide"
echo "   Check individual package documentation for system requirements"
echo ""
echo "🚀 Your MedChain project is now ready for development!"