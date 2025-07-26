# Tela AI Backend

Neural Interface Server for the Tela AI Platform

## Features

🧠 **Neural Chat** - Advanced AI conversations with memory persistence
📋 **Task Engine** - AI-powered task management and generation
🎨 **Design Lab** - Automated design concept generation
🧮 **Memory Core** - Persistent user context and preferences
📁 **Data Vault** - Secure file management system
⚙️ **System Config** - User settings and plan management

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for session and data caching
- **AI**: OpenAI GPT-4o-mini integration
- **Authentication**: JWT with bcryptjs
- **File Upload**: Multer for file handling
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Custom structured logging

## Quick Start

### Prerequisites

- Node.js 18 or higher
- MongoDB 6.0+
- Redis 6.0+
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
```bash
cd backend
npm install
```

2. **Environment setup:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Required environment variables:**
```env
MONGODB_URI=mongodb://localhost:27017/tela-ai
JWT_SECRET=your-super-secure-jwt-secret
OPENAI_API_KEY=sk-your-openai-api-key
```

4. **Start development server:**
```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Neural Chat
- `POST /api/chat/message` - Send chat message
- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/conversations/:id` - Get conversation
- `PUT /api/chat/conversations/:id` - Update conversation
- `DELETE /api/chat/conversations/:id` - Delete conversation
- `GET /api/chat/stats` - Chat statistics

### Task Engine
- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks with filters
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/generate` - AI generate tasks
- `GET /api/tasks/stats` - Task statistics

### Memory Core
- `POST /api/memory` - Store memory entry
- `GET /api/memory` - Get memories with filters
- `GET /api/memory/:id` - Get memory entry
- `PUT /api/memory/:id` - Update memory
- `DELETE /api/memory/:id` - Delete memory
- `GET /api/memory/search` - Search memories
- `GET /api/memory/stats` - Memory statistics

### Design Lab
- `POST /api/design/projects` - Create design project
- `GET /api/design/projects` - List projects
- `GET /api/design/projects/:id` - Get project
- `PUT /api/design/projects/:id` - Update project
- `DELETE /api/design/projects/:id` - Delete project
- `POST /api/design/generate` - Generate design concept

### Data Vault
- `POST /api/files/upload` - Upload file
- `GET /api/files` - List files with filters
- `GET /api/files/:id` - Get file details
- `PUT /api/files/:id` - Update file metadata
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/:id/download` - Download file

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system status

## Authentication

All protected endpoints require Bearer token authentication:

```http
Authorization: Bearer <jwt_token>
```

## Rate Limiting

- General API: 100 requests per 15 minutes
- AI endpoints: 30 requests per 15 minutes
- File uploads: 10 requests per 15 minutes

## Error Handling

All API responses follow this format:

```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "errors": string[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

## User Plans

### Free Plan
- 1,000 monthly credits
- 10 conversations max
- 50 files max
- 100 memory entries max
- 50 tasks per month

### Pro Plan
- 10,000 monthly credits
- 100 conversations max
- 500 files max
- 1,000 memory entries max
- 500 tasks per month
- Priority support
- Advanced features

### Enterprise Plan
- 100,000 monthly credits
- Unlimited conversations
- Unlimited files
- Unlimited memory entries
- Unlimited tasks
- Priority support
- Advanced features
- Custom integrations

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
npm test           # Run tests
```

### Database Schema

The backend uses MongoDB with the following collections:

- **users** - User accounts and authentication
- **chatconversations** - AI chat conversations
- **tasks** - Task management data
- **memoryentries** - User memory and context
- **files** - File metadata and storage info
- **designprojects** - Design generation projects

### Logging

Structured JSON logging with multiple levels:
- **error** - Error conditions
- **warn** - Warning conditions  
- **info** - Informational messages
- **debug** - Debug-level messages

Logs are written to both console and file (`logs/tela-ai.log`).

## Security Features

- **JWT Authentication** with secure token generation
- **Password Hashing** using bcryptjs with salt rounds
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **Input Validation** using express-validator
- **Security Headers** via Helmet middleware
- **Request Size Limits** to prevent DoS attacks

## Monitoring

Health check endpoints provide:
- Service status
- Database connectivity
- Memory usage
- System uptime
- Version information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details