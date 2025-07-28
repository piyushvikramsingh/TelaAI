# Chattyy - Complete WhatsApp Clone with AI Assistant

A fully functional, real-time chat application built with React, TypeScript, and modern web technologies. Chattyy provides all the features you'd expect from a modern messaging app, including voice/video calls, status updates, file sharing, and **Jarvy AI Assistant** for instant help and support.

## 🚀 Features

### 📱 Authentication
- Phone number authentication with OTP verification
- Secure user registration and login
- Persistent login sessions

### 🤖 Jarvy AI Assistant - Advanced Meta/Grok-Level Training
- **Meta-like Reasoning Engine** - Advanced pattern recognition and logical inference
- **Grok-style Creative Responses** - Context-aware, personalized communication
- **Knowledge Graph** - 18+ domains with 100+ interconnected concepts
- **Multi-Modal Reasoning** - Causal, comparative, analytical, temporal, and strategic thinking
- **Auto-Training System** - Comprehensive dataset with 25+ expert-level conversations
- **Domain Expertise** - Technology, business, health, science, finance, psychology, and more
- **Complex Query Processing** - Handles expert-level questions with confidence scoring
- **Continuous Learning** - Real-time adaptation based on user feedback
- **Advanced NLP** - Fuzzy matching, semantic similarity, and context understanding
- **Training Interface** - Built-in system for adding new knowledge and conversations

### 💬 Messaging
- Real-time text messaging
- Message status indicators (sent, delivered, read)
- Message reactions and replies
- Message forwarding and starring
- File sharing (images, videos, audio, documents)
- Voice message recording
- Location sharing
- Emoji picker integration
- Message search and filtering

### 📞 Voice & Video Calls
- High-quality video calling with WebRTC
- Voice-only calling option
- Screen sharing capabilities
- Call controls (mute, camera toggle, end call)
- Call duration tracking
- Full-screen mode support

### 📊 Status Updates
- 24-hour disappearing status updates
- Text status with custom backgrounds
- Image and video status sharing
- Status viewing with progress indicators
- View count tracking

### 👥 Contacts & Groups
- Contact management
- Group chat creation and management
- Online status indicators
- Typing indicators
- User profiles with avatars

### 🎨 UI/UX Features
- Dark/Light mode toggle
- Responsive design for all devices
- Smooth animations and transitions
- Modern, WhatsApp-inspired interface
- Mobile-first design approach

### 🔐 Security & Privacy
- End-to-end encryption indicators
- Secure file uploads
- Private message handling
- User privacy controls

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router DOM** - Client-side routing
- **Framer Motion** - Smooth animations

### Communication & Media
- **WebRTC** - Real-time peer-to-peer communication
- **Socket.io Client** - Real-time websocket connections
- **Simple Peer** - WebRTC wrapper for easier implementation
- **React Webcam** - Camera access for video calls

### UI Components & Libraries
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Elegant toast notifications
- **Emoji Picker React** - Comprehensive emoji picker
- **React Phone Number Input** - International phone input
- **Date-fns** - Modern date utility library

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting and quality
- **PostCSS & Autoprefixer** - CSS processing
- **Firebase** - Backend services (optional)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chattyy
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_APP_NAME=Chattyy
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_WEBSOCKET_URL=ws://localhost:8080
```

### Firebase Setup (Optional)
If you want to use Firebase for backend services:

1. Create a Firebase project
2. Enable Authentication and Firestore
3. Add your Firebase config to the environment variables
4. Update the Firebase configuration in `src/firebase.ts`

## 📱 Usage

### Getting Started
1. **Register**: Enter your phone number and verify with OTP (use `123456` for demo)
2. **Create Profile**: Set your name and avatar
3. **Start Chatting**: Click on contacts to start conversations
4. **Add Status**: Share text, image, or video status updates
5. **Make Calls**: Use video/voice call buttons in chat headers

### Key Features Guide

#### Messaging
- Type messages in the input field
- Press Enter or click send button
- Hold mic button to record voice messages
- Click paperclip to share files
- Double-click messages to react
- Long-press for message options

#### Video Calls
- Click video icon in chat header
- Grant camera/microphone permissions
- Use on-screen controls during calls
- Click screen share to share your screen
- End call with red phone button

#### Status Updates
- Navigate to Status tab or click eye icon
- Choose text or media status
- Customize text backgrounds
- View others' status by clicking on them
- Status disappears after 24 hours

#### Jarvy AI Assistant - Advanced Training
- **Access Training Interface**: Click the Bot icon in the header
- **Domain Knowledge Training**: Add new concepts, facts, and examples
- **Conversation Training**: Train with custom Q&A pairs and ratings
- **Auto-Training**: Comprehensive dataset automatically trains Jarvy on startup
- **Advanced Queries**: Ask complex questions like "Analyze AI's impact on employment"
- **Expert-Level Responses**: Get detailed, multi-perspective answers with sources
- **Reasoning Insights**: View confidence scores, complexity levels, and knowledge sources
- **Multiple Training Modes**: Comprehensive, quick, expert-only, or domain-specific

**Example Advanced Queries:**
- "Compare React vs Vue.js for enterprise applications"
- "Explain quantum computing principles in simple terms"
- "How to validate a business idea before investing?"
- "What are evidence-based mental health strategies?"
- "Analyze the trade-offs between economic growth and sustainability"

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   └── JarvyChat.tsx   # AI Assistant chat interface
├── pages/              # Main application pages
│   ├── LoginPage.tsx   # Phone authentication
│   ├── ChattyPage.tsx  # Main chat interface
│   ├── VideoCallPage.tsx # Video calling
│   └── StatusPage.tsx  # Status updates
├── store/              # State management
│   ├── authStore.ts    # Authentication state
│   └── chatStore.ts    # Chat and messaging state
├── services/           # API and external services
│   ├── jarvy.ts        # Enhanced Jarvy AI with Meta/Grok capabilities
│   ├── advancedJarvy.ts # Advanced AI reasoning and knowledge graph
│   ├── trainingData.ts # Comprehensive training dataset (25+ conversations)
│   └── autoTrainer.ts  # Automated training system
├── firebase.ts         # Firebase configuration
├── App.tsx            # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## 🚀 Building for Production

```bash
# Build the application
npm run build
# or
yarn build

# Preview the production build
npm run preview
# or
yarn preview
```

## 📱 Mobile App Development

This codebase can be easily converted to a mobile app using:

### React Native (Recommended)
- Reuse most of the TypeScript logic
- Adapt UI components to React Native
- Use native modules for camera/microphone access

### Capacitor
- Wrap the web app in a native container
- Add native plugins for enhanced functionality
- Deploy to app stores with minimal changes

### Electron (Desktop)
- Create desktop versions for Windows, Mac, Linux
- Add desktop-specific features
- Maintain single codebase

## 🔐 Security Considerations

- **Authentication**: Secure phone number verification
- **Encryption**: Messages are handled securely
- **File Uploads**: Validate and sanitize all uploads
- **WebRTC**: Peer-to-peer connections for calls
- **Privacy**: User data is stored locally by default

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- WhatsApp for design inspiration
- React team for the amazing framework
- All open-source contributors whose libraries made this possible

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments for implementation details

---

**Built with ❤️ using modern web technologies**
