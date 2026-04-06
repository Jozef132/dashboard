import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/globals.css';
import { Icon } from "@iconify/react";

export default function ValidateKey() {
  const [key, setKey] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(null);
  const intervalRef = useRef(null);

  const handleValidateKey = async (e) => {
    e.preventDefault();
    if (!key) {
      toast.error('Please enter a Reference number before checking!');
      return;
    }
    try {
      const response = await axios.post('/api/validate-key', { key });
      setResult(response.data);
      setError('');

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (response.data.valid && response.data.timeRemaining) {
        const totalSeconds =
          response.data.timeRemaining.days * 86400 +
          response.data.timeRemaining.hours * 3600 +
          response.data.timeRemaining.minutes * 60 +
          response.data.timeRemaining.seconds;

        startCountdown(totalSeconds);
      }
      document.getElementById("my_modal_3").showModal();
    } catch (err) {
      console.error('Validation Error:', err);
      const msg = err.response?.data?.error || err.message || 'Failed to validate key';
      toast.error(msg);
      setResult(null);
      setTimeRemaining(null);
    }
  };

  const startCountdown = (totalSeconds) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeRemaining(totalSeconds);
  };

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans flex items-center justify-center p-4">
      {/* Background blobs for premium effect */}
      <div className="blob bg-primary-500 w-96 h-96 top-1/4 -left-20"></div>
      <div className="blob bg-purple-500 w-96 h-96 bottom-1/4 -right-20 animation-delay-2000"></div>
      
      <ToastContainer theme="dark" toastClassName="glass-panel" />

      <div className="glass-panel relative z-10 w-full max-w-lg rounded-3xl border border-white/5 shadow-2xl p-8 md:p-12 animate-fade-in">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary-500/20 to-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 shadow-[0_0_20px_rgba(99,102,241,0.2)] mb-2">
            <Icon icon="lucide:shield-check" width="40" height="40" />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Validate Subscription</h1>
            <p className="text-gray-400 mt-2 font-medium">Enter your reference number to check status</p>
          </div>

          <form onSubmit={handleValidateKey} className="w-full space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
                <Icon icon="lucide:hash" width="20" height="20" />
              </div>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none" 
                type="text" 
                placeholder="Enter reference number" 
                value={key} 
                onChange={(e) => setKey(e.target.value)} 
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl py-4 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center gap-2 group"
            >
              <span>Verify Status</span>
              <Icon icon="lucide:arrow-right" width="20" height="20" className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <p>Having issues? Join our</p>
              <a 
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors flex items-center gap-1" 
                href="https://discord.gg/tUDgT4rwRu" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Icon icon="ic:baseline-discord" width="18" height="18" />
                Discord
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* Result Modal */}
      {result && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card max-w-sm w-full p-8 border border-white/10 relative animate-slide-up bg-[#0b0f19] shadow-2xl">
            <button 
              onClick={() => setResult(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <Icon icon="lucide:x" width="24" height="24" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${result.valid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                <Icon icon={result.valid ? "lucide:check-circle" : "lucide:alert-circle"} width="32" height="32" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {result.valid ? 'Subscription Active' : 'Subscription Invalid'}
                </h2>
                <p className="text-gray-400 text-sm">Details for ref: {key}</p>
              </div>

              <div className="w-full space-y-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col gap-1 text-left">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Platform</span>
                  <span className="text-white font-semibold">{result.serviceCategory || 'N/A'}</span>
                </div>
                
                {timeRemaining !== null && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex flex-col gap-1 text-left">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Time Remaining</span>
                    <span className="text-primary-400 font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setResult(null)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}