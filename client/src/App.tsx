import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Placeholder for ChatInterface component
const ChatInterface = () => (
  <div className="bg-white rounded-lg shadow-sm border p-6">
    <p className="text-gray-600 text-center">
      Chat interface will be implemented here...
    </p>
  </div>
)

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">
            🤖 Modern AI Chatbot
          </h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<ChatInterface />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
