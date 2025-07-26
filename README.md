# Tela AI - Neural Interface Platform

🧠 **Advanced AI-Powered Platform with Neural Interface Capabilities**

Tela AI is a comprehensive platform that combines cutting-edge AI technology with an intuitive neural interface design. It provides powerful tools for conversation, task management, design automation, memory persistence, and file management.

## ✨ Features

- **🧠 Neural Chat** - AI conversations with memory persistence and context awareness
- **📋 Task Engine** - AI-powered task management with intelligent suggestions
- **🎨 Design Lab** - Automated design concept generation and iteration
- **🧮 Memory Core** - Persistent user context, preferences, and learning
- **📁 Data Vault** - Secure file management with intelligent categorization
- **⚙️ System Config** - Comprehensive user settings and plan management

## 🏗️ Architecture

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript + MongoDB + Redis
- **AI:** OpenAI GPT-4o-mini integration with custom neural interface
- **Authentication:** JWT-based with optional Firebase integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6.0+
- Redis 6.0+
- OpenAI API Key

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd tela-ai
   ```

2. **Backend setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run build
   npm run dev
   ```

3. **Frontend setup:**
   ```bash
   cd ..
   npm install
   cp .env.example .env
   # Edit .env (optional)
   npm run dev
   ```

4. **Access the platform:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000

## 📖 Documentation

- **[Complete Setup Guide](SETUP_GUIDE.md)** - Detailed setup instructions
- **[Backend Documentation](backend/README.md)** - API documentation and backend details
- **[Environment Variables](.env.example)** - Configuration options

## 🔧 Development

### Project Structure
```
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── ...
├── backend/               # Backend source code
│   ├── src/
│   │   ├── controllers/   # API controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── ...
│   └── ...
└── ...
```

### Key Technologies
- **Frontend:** React, TypeScript, Framer Motion, Lucide Icons
- **Backend:** Express.js, Mongoose, Redis, OpenAI SDK
- **Database:** MongoDB with comprehensive indexing
- **Security:** JWT authentication, input validation, rate limiting
- **Development:** Hot reloading, TypeScript compilation, ESLint

## 🌟 Key Features in Detail

### Neural Chat Interface
- Advanced AI conversation with GPT-4o-mini
- Persistent conversation history
- Memory-aware responses using user context
- Real-time typing indicators and smooth animations
- Error handling and retry mechanisms

### Task Engine
- Create, manage, and track tasks
- AI-powered task suggestions based on user context
- Priority management and deadline tracking
- Category-based organization
- Statistics and productivity insights

### Memory Core
- Automatic extraction of user preferences and context
- Intelligent tagging and categorization
- Importance-based ranking
- Search and retrieval capabilities
- Temporal memory management

### Authentication & Security
- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting and request validation
- CORS protection and security headers
- Optional Firebase integration

## 🚀 Production Deployment

### Backend Deployment
```bash
cd backend
npm run build
NODE_ENV=production npm start
```

### Frontend Deployment
```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For setup help or issues:
1. Check the [Setup Guide](SETUP_GUIDE.md)
2. Review the [Backend Documentation](backend/README.md)
3. Check the troubleshooting section in the setup guide

---

Built with ❤️ using modern web technologies and AI innovation.