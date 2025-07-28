#!/bin/bash

# 🚀 Chattyy GitHub Pages Deployment Script
# Automated setup for hosting Chattyy on GitHub Pages

set -e  # Exit on any error

echo "🚀 Chattyy GitHub Pages Deployment Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

print_status "Checking current repository status..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository. Please run this script from the Chattyy project directory."
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Check if we have the feature branch
if ! git show-ref --verify --quiet refs/heads/cursor/real-time-chat-application-with-all-features-22b4; then
    print_error "Feature branch 'cursor/real-time-chat-application-with-all-features-22b4' not found."
    print_status "Please ensure you have the correct branch with Chattyy code."
    exit 1
fi

echo ""
print_status "Choose deployment option:"
echo "1. Create new 'chattyy' repository (Recommended)"
echo "2. Use current repository (TelaAI)"
echo "3. Manual deployment only"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        print_status "Option 1: Setting up new repository deployment"
        echo ""
        print_warning "You need to create a new repository on GitHub first!"
        echo ""
        echo "📋 Instructions:"
        echo "1. Go to https://github.com/new"
        echo "2. Repository name: 'chattyy'"
        echo "3. Make it PUBLIC (required for GitHub Pages)"
        echo "4. DO NOT initialize with README/license"
        echo "5. Click 'Create repository'"
        echo ""
        read -p "Have you created the repository? (y/n): " created
        
        if [[ $created != "y" && $created != "Y" ]]; then
            print_warning "Please create the repository first, then run this script again."
            exit 0
        fi
        
        read -p "Enter your GitHub username: " username
        
        if [[ -z "$username" ]]; then
            print_error "Username cannot be empty."
            exit 1
        fi
        
        NEW_REPO_URL="https://github.com/$username/chattyy.git"
        
        print_status "Setting up deployment to $NEW_REPO_URL"
        
        # Create a temporary directory for deployment
        TEMP_DIR="../chattyy-deploy-$(date +%s)"
        print_status "Creating temporary directory: $TEMP_DIR"
        
        # Clone current repo to temp directory
        git clone . "$TEMP_DIR"
        cd "$TEMP_DIR"
        
        # Checkout feature branch
        git checkout cursor/real-time-chat-application-with-all-features-22b4
        
        # Remove old origin and add new one
        git remote remove origin
        git remote add origin "$NEW_REPO_URL"
        
        # Create and switch to main branch
        git checkout -b main
        
        # Update package.json homepage
        sed -i.bak "s|\"homepage\": \".*\"|\"homepage\": \"https://$username.github.io/chattyy\"|" package.json
        
        # Update vite.config.ts base path
        sed -i.bak "s|base: '/.*/',|base: '/chattyy/',|" vite.config.ts
        
        # Update README with correct URLs
        sed -i.bak "s|https://piyushvikramsingh.github.io/chattyy|https://$username.github.io/chattyy|g" README.md
        sed -i.bak "s|https://github.com/piyushvikramsingh/chattyy|https://github.com/$username/chattyy|g" README.md
        
        # Commit the URL updates
        git add .
        git commit -m "🌐 Update URLs for new repository deployment"
        
        # Push to new repository
        print_status "Pushing to new repository..."
        git push -u origin main
        
        print_success "✅ Code pushed to new repository!"
        print_status "Next steps:"
        echo "1. Go to https://github.com/$username/chattyy"
        echo "2. Click Settings → Pages"
        echo "3. Select 'GitHub Actions' as source"
        echo "4. Wait for deployment to complete"
        echo ""
        print_success "🌐 Your app will be live at: https://$username.github.io/chattyy"
        
        # Clean up temp directory
        cd ..
        rm -rf "$TEMP_DIR"
        ;;
        
    2)
        echo ""
        print_status "Option 2: Using current repository"
        
        # Check if we're on the correct branch
        if [[ "$CURRENT_BRANCH" != "cursor/real-time-chat-application-with-all-features-22b4" ]]; then
            print_status "Switching to feature branch..."
            git checkout cursor/real-time-chat-application-with-all-features-22b4
        fi
        
        # Update URLs for TelaAI repository
        sed -i.bak "s|\"homepage\": \".*\"|\"homepage\": \"https://piyushvikramsingh.github.io/TelaAI\"|" package.json
        sed -i.bak "s|base: '/.*/',|base: '/TelaAI/',|" vite.config.ts
        sed -i.bak "s|https://piyushvikramsingh.github.io/chattyy|https://piyushvikramsingh.github.io/TelaAI|g" README.md
        
        # Commit the changes
        git add .
        git commit -m "🌐 Update URLs for TelaAI repository deployment"
        
        # Push the feature branch
        git push origin cursor/real-time-chat-application-with-all-features-22b4
        
        print_success "✅ Changes pushed to feature branch!"
        print_status "Next steps:"
        echo "1. Go to https://github.com/piyushvikramsingh/TelaAI"
        echo "2. Click Settings → Pages"
        echo "3. Select 'GitHub Actions' as source"
        echo "4. Merge the feature branch to main branch"
        echo ""
        print_success "🌐 Your app will be live at: https://piyushvikramsingh.github.io/TelaAI"
        ;;
        
    3)
        echo ""
        print_status "Option 3: Manual deployment setup"
        
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            print_status "Installing dependencies..."
            npm install
        fi
        
        # Build the application
        print_status "Building application..."
        npm run build
        
        # Run manual deployment
        print_status "Deploying to gh-pages branch..."
        npm run deploy
        
        print_success "✅ Manual deployment completed!"
        print_status "Your app should be accessible in a few minutes."
        ;;
        
    *)
        print_error "Invalid choice. Please run the script again and choose 1, 2, or 3."
        exit 1
        ;;
esac

echo ""
print_success "🎉 Deployment setup completed!"
echo ""
print_status "📋 What your live app includes:"
echo "• 🤖 Advanced Jarvy AI with Meta/Grok-level reasoning"
echo "• 💬 Complete WhatsApp-like messaging"
echo "• 📞 Video/Voice calls with WebRTC"
echo "• 📊 Status updates (24h disappearing)"
echo "• 📎 File sharing (all types)"
echo "• 🎤 Voice message recording"
echo "• 🌙 Dark/Light mode toggle"
echo "• 🛠️ AI training interface"
echo ""
print_status "📞 Demo Instructions:"
echo "1. Login with any phone number + OTP: 123456"
echo "2. Chat with Jarvy AI (🤖 icon)"
echo "3. Ask: 'Compare React vs Vue.js' or 'Explain quantum computing'"
echo "4. Try video calls, file sharing, and status updates"
echo "5. Access training interface via Bot icon in header"
echo ""
print_success "🚀 Your advanced Chattyy app is ready for the world!"