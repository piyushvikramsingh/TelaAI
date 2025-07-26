# Tela AI Platform Setup Guide

Complete setup guide for the Tela AI Neural Interface platform with frontend and backend.

## 🧠 What is Tela AI?

Tela AI is an advanced neural interface platform that provides:

- **Neural Chat** - AI conversations with memory persistence
- **Task Engine** - AI-powered task management and generation  
- **Design Lab** - Automated design concept generation
- **Memory Core** - Persistent user context and preferences
- **Data Vault** - Secure file management system
- **System Config** - User settings and plan management

## 🏗️ Architecture

```
Frontend (React + TypeScript)
    ↓ REST API
Backend (Node.js + Express + TypeScript)
    ↓
MongoDB (Data) + Redis (Cache) + OpenAI (AI)
```

## 📋 Prerequisites

### Required Software
- **Node.js 18+** - [Download](https://nodejs.org/)
- **MongoDB 6.0+** - [Install Guide](https://www.mongodb.com/docs/manual/installation/)
- **Redis 6.0+** - [Install Guide](https://redis.io/docs/getting-started/installation/)

### Required API Keys
- **OpenAI API Key** - [Get yours here](https://platform.openai.com/account/api-keys)

### Optional
- **Firebase Account** - For enhanced authentication (optional)

## 🚀 Quick Start (Recommended)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env  # or use your preferred editor
```

**Required .env variables:**
```env
MONGODB_URI=mongodb://localhost:27017/tela-ai
JWT_SECRET=your-super-secure-jwt-secret-key-here
OPENAI_API_KEY=sk-your-openai-api-key-here
```

```bash
# Build and start the backend
npm run build
npm run dev
```

The backend will be available at `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to root directory (if in backend folder)
cd ..

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file (optional - defaults will work)
nano .env
```

**Optional .env variables:**
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

```bash
# Start the frontend
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🛠️ Detailed Setup

### Backend Configuration

#### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 8000 |
| `NODE_ENV` | Environment | No | development |
| `MONGODB_URI` | MongoDB connection string | **Yes** | - |
| `JWT_SECRET` | JWT signing secret | **Yes** | - |
| `OPENAI_API_KEY` | OpenAI API key | **Yes** | - |
| `REDIS_URL` | Redis connection string | No | redis://localhost:6379 |

#### Database Setup

**MongoDB:**
```bash
# Start MongoDB (if not running)
mongod

# Or with Homebrew (macOS)
brew services start mongodb-community

# Or with systemctl (Linux)
sudo systemctl start mongod
```

**Redis:**
```bash
# Start Redis (if not running)
redis-server

# Or with Homebrew (macOS)
brew services start redis

# Or with systemctl (Linux)
sudo systemctl start redis
```

#### Building and Running

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# With logs
npm run dev | tee logs/server.log
```

### Frontend Configuration

#### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API URL | No | http://localhost:8000/api |
| `VITE_FIREBASE_*` | Firebase config | No | - |

#### Building and Running

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview

# Linting and formatting
npm run lint
npm run format
```

## 🔧 Development Workflow

### Starting Development

1. **Start databases:**
   ```bash
   # Terminal 1: MongoDB
   mongod
   
   # Terminal 2: Redis
   redis-server
   ```

2. **Start backend:**
   ```bash
   # Terminal 3
   cd backend
   npm run dev
   ```

3. **Start frontend:**
   ```bash
   # Terminal 4
   npm run dev
   ```

### Making Changes

- **Backend changes:** Auto-reloads with nodemon
- **Frontend changes:** Auto-reloads with Vite HMR
- **Database changes:** Update models in `backend/src/models/`

## 🚀 Production Deployment

### Backend Deployment

```bash
# Build the backend
cd backend
npm run build

# Set production environment variables
export NODE_ENV=production
export MONGODB_URI=your-production-mongodb-uri
export REDIS_URL=your-production-redis-uri

# Start production server
npm start
```

### Frontend Deployment

```bash
# Build the frontend
npm run build

# Serve static files (example with serve)
npx serve -s dist -l 3000
```

## 🔍 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Neural Chat
- `POST /api/chat/message` - Send chat message
- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/conversations/:id` - Get conversation

### Task Engine
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks
- `POST /api/tasks/generate` - AI generate tasks

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB is running: `mongosh`
- Check Redis is running: `redis-cli ping`
- Verify environment variables in `.env`

**Frontend can't connect to backend:**
- Ensure backend is running on port 8000
- Check `VITE_API_BASE_URL` in frontend `.env`
- Verify CORS settings in backend

**Database connection errors:**
- Check MongoDB URI format: `mongodb://localhost:27017/tela-ai`
- Ensure database permissions
- Check firewall settings

**OpenAI API errors:**
- Verify API key is correct and active
- Check account billing and usage limits
- Ensure proper API key format: `sk-...`

### Log Files

- **Backend logs:** `backend/logs/tela-ai.log`
- **Frontend logs:** Browser developer console
- **MongoDB logs:** Check MongoDB installation directory
- **Redis logs:** Check Redis installation directory

## 📚 Additional Resources

- [Backend README](backend/README.md) - Detailed backend documentation
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Redis Documentation](https://redis.io/docs/)

## 🆘 Support

If you encounter issues:

1. Check this guide and the troubleshooting section
2. Review the logs for error messages
3. Ensure all prerequisites are properly installed
4. Verify environment variables are correctly set

## 🎉 Success!

Once everything is running:

1. Open `http://localhost:5173` in your browser
2. Create an account or login
3. Start chatting with the AI in the Neural Chat interface
4. Explore the Task Engine and other features

The platform should now be fully functional with:
- ✅ User authentication and profiles
- ✅ AI-powered chat with memory
- ✅ Task management and generation
- ✅ Secure API communication
- ✅ Real-time features