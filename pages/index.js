import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import { Icon } from "@iconify/react";

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post('/api/login', { username, password });
      if (response.data.message === 'Login successful') {
        localStorage.setItem('isLoggedIn', 'true');
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-sans bg-background">
      {/* Animated Background Orbs */}
      <div className="blob bg-primary-500 w-96 h-96 top-0 left-10"></div>
      <div className="blob bg-purple-500 w-96 h-96 bottom-0 right-10 animation-delay-2000"></div>
      <div className="blob bg-indigo-500 w-72 h-72 top-1/2 left-1/2 animation-delay-4000"></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl mx-4 lg:mx-auto glass-panel rounded-3xl overflow-hidden flex shadow-2xl">
        
        {/* Left branding panel */}
        <div className="hidden lg:flex w-1/2 relative flex-col justify-center p-12 bg-black/40 border-r border-glass-border">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 mix-blend-overlay"></div>
          <div className="relative z-10">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight tracking-tight text-glow">PC Engineer Dashboard</h1>
            <p className="text-lg text-indigo-100 font-light mb-8 max-w-md">Access your central control panel to manage keys, services, and secure administrative tasks seamlessly.</p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-1 bg-primary-500 rounded-full"></div>
              <div className="text-sm font-medium text-white/50 tracking-widest uppercase">Admin Portal</div>
            </div>
          </div>
        </div>

        {/* Right login form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 relative bg-white/5 backdrop-blur-xl">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-10 lg:hidden">
              <h2 className="text-3xl font-bold text-white mb-2 text-glow">PC Engineer</h2>
            </div>
            <div className="mb-10">
              <h2 className="text-3xl font-semibold text-white tracking-tight mb-2">Welcome Back</h2>
              <p className="text-gray-400 text-sm">Please sign in to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-primary-400 transition-colors">
                    <Icon icon="lucide:user" width="20" height="20" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-primary-400 transition-colors">
                    <Icon icon="lucide:lock" width="20" height="20" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary-500 focus:ring-primary-500 focus:ring-offset-gray-900"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-400">
                    Stay signed in
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-2 text-red-400 animate-fade-in">
                  <Icon icon="lucide:alert-circle" width="18" height="18" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group overflow-hidden bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl py-3.5 px-4 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="relative z-10 flex items-center justify-center space-x-2">
                  <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}