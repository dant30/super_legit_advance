import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, ArrowLeft } from 'lucide-react'

const Unauthorized: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <Lock className="h-20 w-20 text-yellow-500" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-2">403</h1>
        <p className="text-2xl font-semibold text-gray-300 mb-4">Access Denied</p>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          You don't have permission to access this resource. Please contact an administrator if you believe this is an error.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back to Dashboard
        </button>
      </div>
    </div>
  )
}

export default Unauthorized