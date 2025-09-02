import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ChatInterface from './components/ChatInterface'
import Header from './components/Header'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<ChatInterface />} />
        </Routes>
      </main>
    </div>
  )
}

export default App