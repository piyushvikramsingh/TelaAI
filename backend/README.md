# Tela AI Backend

A comprehensive Node.js/Express backend for the Tela AI Neural Interface Platform, providing AI-powered chat, task management, file processing, and more.

## Features

- 🤖 **AI Chat Interface** - OpenAI integration with streaming responses
- 👤 **User Authentication** - JWT-based auth with refresh tokens
- 📋 **Task Management** - AI-powered task execution and tracking
- 📁 **File Management** - Upload, process, and analyze documents
- 🎨 **Design Generation** - AI-powered design creation
- 🧠 **Memory System** - AI knowledge base and context management
- 🔄 **Real-time Features** - WebSocket support for live updates
- 📊 **Analytics** - Usage tracking and reporting
- 🛡️ **Security** - Rate limiting, input validation, and secure practices

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Authentication**: JWT with bcrypt
- **AI**: OpenAI API
- **Real-time**: Socket.IO
- **Validation**: express-validator
- **Logging**: Winston
- **File Upload**: Multer

## Prerequisites

- Node.js 18 or higher
- MongoDB running locally or connection string
- Redis running locally or connection string
- OpenAI API key

## Installation

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your actual configuration:
   - Add your OpenAI API key
   - Update MongoDB and Redis connection strings
   - Set strong JWT secrets for production
   - Configure email settings

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database and service configurations
│   ├── middleware/      # Express middleware (auth, error handling)
│   ├── models/         # MongoDB schemas and models
│   ├── routes/         # API route handlers
│   ├── services/       # External service integrations (OpenAI)
│   ├── utils/          # Utility functions and helpers
│   └── server.ts       # Main application entry point
├── uploads/            # File upload directory
├── logs/              # Application logs
└── dist/              # Compiled JavaScript (after build)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile

### Chat
- `GET /api/chat` - Get all user chats
- `POST /api/chat` - Create new chat
- `POST /api/chat/:id/messages` - Send message to chat
- `POST /api/chat/:id/stream` - Stream AI response
- `GET /api/chat/:id/export` - Export chat

### Tasks
- `GET /api/tasks` - Get all user tasks
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Files
- `GET /api/files` - Get all user files
- `POST /api/files` - Upload new file
- `GET /api/files/:id` - Get specific file
- `DELETE /api/files/:id` - Delete file

### AI Services
- `GET /api/ai/models` - Get available AI models
- `POST /api/ai/generate-code` - Generate code
- `POST /api/ai/analyze-text` - Analyze text content
- `POST /api/ai/generate-content` - Generate creative content

### Analytics
- `GET /api/analytics/dashboard` - Get user analytics

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |

## Security Features

- **JWT Authentication** with refresh token rotation
- **Rate Limiting** to prevent abuse
- **Input Validation** on all endpoints
- **CORS** configuration for secure cross-origin requests
- **Helmet** for security headers
- **bcrypt** for password hashing
- **Request logging** for monitoring

## Real-time Features

The backend supports real-time communication via Socket.IO for:
- Live chat messages and AI responses
- Task progress updates
- File upload progress
- User presence indicators
- Collaborative editing

## Error Handling

Comprehensive error handling with:
- Custom error classes
- Detailed error logging
- User-friendly error messages
- Development vs production error responses
- Async error catching middleware

## Logging

Winston-based logging system:
- Different log levels (error, warn, info, debug)
- File-based logging in production
- Console logging in development
- Request/response logging
- Error tracking with stack traces

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Database Seeding
```bash
npm run seed
```

### Watching for Changes
```bash
npm run dev
```

## Production Deployment

1. **Environment Setup:**
   - Set `NODE_ENV=production`
   - Use strong secrets for JWT
   - Configure production database
   - Set up email service
   - Configure file storage

2. **Build Application:**
   ```bash
   npm run build
   ```

3. **Start Production Server:**
   ```bash
   npm start
   ```

4. **Process Management:**
   Consider using PM2 for production:
   ```bash
   npm install -g pm2
   pm2 start dist/server.js --name "tela-ai-backend"
   ```

## Monitoring

- Health check endpoint: `GET /health`
- Application logs in `logs/` directory
- Real-time metrics via logging
- Error tracking and alerting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support or questions:
- Check the documentation
- Open an issue on GitHub
- Contact the development team

---

Built with ❤️ for the future of AI-powered productivity.