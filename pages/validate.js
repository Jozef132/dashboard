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
      toast.error('Please enter a key before checking!');
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
      toast.error(err.response?.data?.error || 'Failed to validate key');
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
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-12">
      <ToastContainer />
      <div className="relative bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="font-semibold text-3xl">
              <p>Validate Key</p>
            </div>
            <div className="flex flex-row text-sm font-medium text-gray-400">
              <p>Put your key here and know how much time Remaining</p>
            </div>
          </div>
          <div>
            <form onSubmit={handleValidateKey}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-row items-center justify-between mx-auto w-full">
                  <input className="input !max-w-full !w-[28rem]" type="text" placeholder="Enter your key" value={key} onChange={(e) => setKey(e.target.value)} required/>
                </div>
                <div className="flex flex-col gap-6">
                  <div>
                    <button type="submit" className="flex flex-row items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-blue-700 border-none text-white text-base font-semibold shadow-sm">
                      Check Your Key <Icon icon="bxs:key" width="24" height="24" />
                    </button>
                  </div>
                  <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                    <p>Do you have problem? Join our</p> <a className="flex flex-row items-center text-blue-600" href="https://discord.gg/tUDgT4rwRu" target="_blank" rel="noopener noreferrer">discord</a>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Move the dialog outside the form */}
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          </form>
          <div>
            <h1 className="tracking-normal font-sans leading-relaxed text-xl font-bold text-gray-800 mb-4">Key Details</h1>
            {result && (
              <div>
                <p>Valid: {result.valid ? 'Yes' : 'No'}</p>
                {result.serviceCategory && <p>Service Category: {result.serviceCategory}</p>}
                {timeRemaining !== null && <p>Time Remaining: {formatTime(timeRemaining)}</p>}
              </div>
            )}
          </div>
        </div>
      </dialog>
    </div>
  );
}