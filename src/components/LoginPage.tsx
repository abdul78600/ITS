import React, { useState } from 'react';
import { LogIn, AlertCircle, Info, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative bg-cover bg-center"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2070")',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="max-w-md w-full relative">
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-white mb-2">GRAND CITY</div>
          <h1 className="text-3xl font-bold text-white mb-2">IT Management System</h1>
          <p className="text-gray-200">Developing Pakistan</p>
        </div>

        <div className="bg-white/95 backdrop-blur-lg rounded-lg shadow-xl p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogIn className="h-5 w-5" />
              )}
              Sign In
            </button>
          </form>

          <div className="bg-blue-50/80 backdrop-blur p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 font-medium mb-2">
              <Info className="h-5 w-5" />
              <h3>Demo Accounts</h3>
            </div>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>Head:</strong> head@example.com</p>
              <p><strong>Manager:</strong> manager@example.com</p>
              <p><strong>Normal User:</strong> normal@example.com</p>
              <p><strong>View Only:</strong> view@example.com</p>
              <p className="text-xs text-blue-600 mt-2">Password for all accounts: password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}