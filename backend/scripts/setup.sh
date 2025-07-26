#!/bin/bash

# Tela AI Backend Setup Script
echo "🚀 Setting up Tela AI Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads logs
touch uploads/.gitkeep logs/.gitkeep

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual configuration:"
    echo "   - OpenAI API key"
    echo "   - MongoDB connection string"
    echo "   - Redis connection string"
    echo "   - JWT secrets"
fi

# Build the project
echo "🔨 Building project..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start MongoDB and Redis services"
echo "3. Run 'npm run dev' for development"
echo "4. Run 'npm start' for production"
echo ""
echo "🌐 The server will be available at http://localhost:5000"
echo "📖 API documentation available in README.md"