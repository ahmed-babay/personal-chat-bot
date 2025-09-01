# Modern AI Chatbot 🚀

A modern, open-source AI chatbot built with React, TypeScript, Node.js, and powered by Hugging Face's open-source models. Features a ChatGPT-like interface with a clean, responsive design.

## ✨ Features

- **🤖 Multiple AI Models**: Support for various open-source models like Llama 2, DialoGPT, GPT-Neo, and GPT-2
- **💬 Real-time Chat**: Smooth, responsive chat interface with message history
- **🎨 Modern UI**: Beautiful, responsive design built with Tailwind CSS
- **🔒 Secure**: Rate limiting, CORS protection, and input validation
- **📱 Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **⚡ Fast**: Built with Vite for lightning-fast development and builds
- **🔄 Model Switching**: Easily switch between different AI models
- **📝 Conversation History**: Maintains context across messages
- **🚫 No API Limits**: Uses free, open-source models instead of paid APIs

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, consistent icons
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Axios** - HTTP client for API calls
- **Hugging Face API** - Access to open-source AI models
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API abuse prevention

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/ahmed-babay/chat-bot.git
cd modern-chatbot
```

### 2. Install Dependencies
```bash
# Install all dependencies (root, server, and client)
npm run install:all
```

### 3. Environment Setup
Create a `.env` file in the `server` directory:

```bash
cd server
cp env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Hugging Face Configuration
HF_API_URL=https://api-inference.huggingface.co/models
HF_MODEL=microsoft/DialoGPT-medium
HF_API_TOKEN=your_huggingface_token_here

# Model Parameters
MAX_TOKENS=500
TEMPERATURE=0.7
TOP_P=0.9
```

**Note**: For most models, you don't need an API token. Only some models like Llama 2 require authentication.

### 4. Start Development Servers
```bash
# Start both frontend and backend in development mode
npm run dev
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

### 5. Open Your Browser
Navigate to [http://localhost:5173](http://localhost:5173) to see your chatbot in action!

## 🔧 Available Scripts

### Root Directory
```bash
npm run dev          # Start both frontend and backend
npm run server:dev   # Start only backend
npm run client:dev   # Start only frontend
npm run build        # Build frontend for production
npm run start        # Start production server
npm run install:all  # Install all dependencies
```

### Server Directory
```bash
cd server
npm run dev          # Start with nodemon (development)
npm start            # Start production server
npm test             # Run tests
```

### Client Directory
```bash
cd client
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔌 API Endpoints

### Chat
- `POST /api/chat` - Send message and get AI response
- `GET /api/chat/models` - Get available AI models
- `GET /api/chat/status/:model` - Check model availability
- `POST /api/chat/warmup/:model` - Warm up a model to ensure it's loaded and ready

### Health
- `GET /health` - Server health check

## 🎨 Customization

### Styling
The application uses Tailwind CSS with custom color schemes. You can modify:
- `client/tailwind.config.js` - Colors, fonts, and animations
- `client/src/index.css` - Custom CSS and component styles

### Models
Add new models by:
1. Adding them to the `availableModels` array in `client/src/hooks/useChat.ts`
2. Updating the backend model list in `server/routes/chat.js`

### Model Warmup
The application includes automatic model warmup to handle Hugging Face's serverless architecture:
- **Automatic Warmup**: Models are warmed up before each chat session
- **Manual Warmup**: Use the "Warm up model" button to pre-load models
- **Retry Logic**: Automatic retries with exponential backoff for loading models
- **Fallback**: Graceful fallback to demo mode if models are unavailable

### UI Components
All React components are in `client/src/components/` and can be easily customized.

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy the `dist` folder
```

### Backend (Railway/Render/Heroku)
```bash
cd server
npm start
# Set environment variables in your hosting platform
```

### Environment Variables for Production
```env
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
HF_API_URL=https://api-inference.huggingface.co/models
HF_MODEL=google/gemma-2-2b-it
HF_API_TOKEN=your_production_token
```

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Secure cross-origin requests
- **Input Validation**: Sanitizes user inputs
- **Helmet**: Security headers
- **Request Size Limits**: Prevents large payload attacks

## 🧪 Testing

```bash
cd server
npm test
```

## 📁 Project Structure

```
modern-chatbot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   ├── tailwind.config.js # Tailwind configuration
│   └── vite.config.ts     # Vite configuration
├── server/                 # Node.js backend
│   ├── routes/            # API routes
│   ├── index.js           # Server entry point
│   ├── package.json       # Backend dependencies
│   └── env.example        # Environment variables template
├── package.json            # Root package.json
└── README.md              # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face** for providing access to open-source AI models

## 🆘 Troubleshooting

### Common Issues

**"Module not found" errors**
- Run `npm run install:all` to install all dependencies

**Backend won't start**
- Check if port 5000 is available
- Verify your `.env` file exists and is configured correctly

**Frontend can't connect to backend**
- Ensure backend is running on port 5000
- Check CORS configuration in server
- Verify proxy settings in `vite.config.ts`

**AI responses are slow**
- Some models take time to load on Hugging Face
- Try switching to a different model
- Check model status with `/api/chat/status/:model`

**Model requires token**
- Some models like Llama 2 require Hugging Face authentication
- Get a free token from [Hugging Face](https://huggingface.co/settings/tokens)
- Add it to your `.env` file

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Join our community discussions

---

**Happy Chatting! 🤖✨**
