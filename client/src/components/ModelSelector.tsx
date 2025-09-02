import React from 'react'
import { ChevronDown, Zap } from 'lucide-react'

export interface AIModel {
  id: string
  name: string
  description: string
  requires_token: boolean
}

interface ModelSelectorProps {
  models: AIModel[]
  selectedModel: string
  onModelChange: (modelId: string) => void
  disabled?: boolean
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onModelChange,
  disabled = false
}) => {
  const currentModel = models.find(m => m.id === selectedModel)

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        AI Model
      </label>
      
      <div className="relative">
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
        
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      
      {currentModel && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">
              {currentModel.name}
            </span>
            {currentModel.requires_token && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Token Required
              </span>
            )}
          </div>
          <p className="text-xs text-gray-600">
            {currentModel.description}
          </p>
        </div>
      )}
    </div>
  )
}

export default ModelSelector
export type { ModelSelectorProps }