import React, { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Loader2 } from 'lucide-react'
import Message from './Message'
import ModelSelector from './ModelSelector'
import useChat from '../hooks/useChat'

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    selectedModel,
    setSelectedModel,
    availableModels
  } = useChat()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input
    setInput('')
    await sendMessage(message)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      {/* Model Selector */}
      <div className="mb-6">
        <ModelSelector
          models={availableModels}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          disabled={isLoading}
        />
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">👋 Welcome to your AI Chatbot!</p>
                <p className="text-sm">Start a conversation by typing a message below.</p>
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex gap-3 p-4 bg-white">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-500">AI is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-gray-50 p-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent max-h-32"
                rows={1}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  disabled={isLoading}
                  className="btn-secondary flex items-center gap-2"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface