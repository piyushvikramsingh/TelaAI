#!/bin/bash

echo "🧠 Setting up Tela AI Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration:"
    echo "   - MONGODB_URI: Your MongoDB connection string"
    echo "   - JWT_SECRET: A secure random string"
    echo "   - OPENAI_API_KEY: Your OpenAI API key"
    echo ""
fi

# Create logs directory
mkdir -p logs

# Build the project
echo "🔨 Building TypeScript..."
npm run build

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Make sure MongoDB and Redis are running"
echo "3. Start development server: npm run dev"
echo "4. API will be available at: http://localhost:8000"
echo ""
echo "📚 Check README.md for detailed documentation"