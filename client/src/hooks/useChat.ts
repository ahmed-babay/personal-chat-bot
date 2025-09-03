import { useState, useCallback } from 'react'
import { ChatMessage } from '../components/Message'
import { AIModel } from '../components/ModelSelector'

// Generate unique ID for messages
const generateId = () => Math.random().toString(36).substr(2, 9)

const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('deepseek-ai/DeepSeek-V3-0324:fireworks-ai')
  
  // Available models
  const availableModels: AIModel[] = [
    {
      id: 'deepseek-ai/DeepSeek-V3-0324:fireworks-ai',
      name: 'DeepSeek V3 (Fireworks AI)',
      description: 'High-performance language model optimized for chat and reasoning',
      requires_token: true
    },
    {
      id: 'meta-llama/Llama-3.1-8B-Instruct:fireworks-ai',
      name: 'Llama 3.1 8B Instruct',
      description: 'Faster, smaller Llama model good for quick responses',
      requires_token: true
    },
    {
      id: 'meta-llama/Llama-3.1-70B-Instruct:fireworks-ai',
      name: 'Llama 3.1 70B Instruct',
      description: 'Large high-performance instruction model',
      requires_token: true
    },
  ]

  // Send message to AI and get response
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    // Create user message
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    }

    // Add user message to chat
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Make API call to backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationHistory,
          model: selectedModel
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Create AI response message
        const aiMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }

        // Add AI response to chat
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error(data.message || 'Failed to get AI response')
      }

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Create error message
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      }

      // Add error message to chat
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [messages, selectedModel])

  // Clear all messages
  const clearChat = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    selectedModel,
    setSelectedModel,
    availableModels
  }
}

export default useChat