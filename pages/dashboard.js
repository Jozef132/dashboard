import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import Sidebar from '../components/Sidebar';
import Nav from '../components/nav';
import { Icon } from "@iconify/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from 'next/link';

export default function Dashboard({ isAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [timeValue, setTimeValue] = useState(''); // Store the time value (e.g., 1, 2, 3)
  const [timeUnit, setTimeUnit] = useState('days'); // Default unit is days
  const [serviceCategory, setServiceCategory] = useState(''); // Default value
  const [services, setServices] = useState([]); // Store available services
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [keyCount, setKeyCount] = useState(0);
  const [expiredKeyCount, setExpiredKeyCount] = useState(0);
  const [activeKeyCount, setActiveKeyCount] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [keys, setKeys] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Fetch all keys and services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const keysResponse = await axios.get('/api/keys');
        const servicesResponse = await axios.get('/api/services');
        setKeys(keysResponse.data);
        setServices(servicesResponse.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchExpiredKeys() {
      try {
        const response = await fetch("/api/expired_keys");
        if (!response.ok) {
          if (response.status === 404) {
            setExpiredKeyCount(0);
            return;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setExpiredKeyCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        setExpiredKeyCount(0);
      }
    }
    fetchExpiredKeys();
  }, []);

  useEffect(() => {
    fetch("/api/total_services")
      .then((res) => res.json())
      .then((data) => {
        setTotalServices(data.totalServices || 0);
      })
      .catch((err) => console.error("Error fetching services:", err));
  }, []);

  useEffect(() => {
    async function fetchActiveKeys() {
      try {
        const response = await fetch("/api/active_keys");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setActiveKeyCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        setActiveKeyCount(0);
      }
    }
    fetchActiveKeys();
  }, []);
  
  useEffect(() => {
    async function fetchKeys() {
      try {
        const response = await fetch("/api/total_keys");
        const data = await response.json();
        setKeyCount(data.total);
      } catch (error) {}
    }
    fetchKeys();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('/api/services');
        setServices(response.data);
        if (response.data.length > 0) {
          setServiceCategory(response.data[0].id);
        }
      } catch (err) {}
    };
    fetchServices();
  }, []);
  
  const handleGenerateKey = async (e) => {
    e.preventDefault();
  
    if (!email || !timeValue || !serviceCategory) {
      setError("Email, Duration, and Service Platform are required!");
      toast.error("Required fields missing!", { position: "top-right" });
      return;
    }
  
    try {
      const expirationDate = new Date();
      switch (timeUnit) {
        case "days": expirationDate.setDate(expirationDate.getDate() + parseInt(timeValue)); break;
        case "hours": expirationDate.setHours(expirationDate.getHours() + parseInt(timeValue)); break;
        case "minutes": expirationDate.setMinutes(expirationDate.getMinutes() + parseInt(timeValue)); break;
        default: throw new Error("Invalid time unit");
      }
  
      const response = await axios.post("/api/generate-key", {
        email,
        password,
        discordUsername,
        phoneNumber,
        expirationDate: expirationDate.toISOString(),
        serviceCategory,
      });
  
      setKey(response.data.key);
      setError("");
      toast.success(`Subscription Generated! Ref: ${response.data.key}`, { position: "top-right", autoClose: false });
      setIsModalOpen(false); // close modal on success
      
      // Reset form
      setEmail('');
      setPassword('');
      setDiscordUsername('');
      setPhoneNumber('');
      setTimeValue('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to generate subscription";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Background blobs for premium effect */}
      <div className="blob bg-primary-500 w-96 h-96 top-0 left-10"></div>
      <div className="blob bg-purple-500 w-96 h-96 bottom-0 right-10 animation-delay-2000"></div>
      
      <Sidebar />
      
      <div className="p-4 xl:ml-[310px] relative z-10 transition-all duration-300">
        <Nav />
        <ToastContainer theme="dark" toastClassName="glass-panel" />
        
        <div className="mt-8">
          {/* Stat Cards */}
          <div className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Link href="/admin/keys">
              <div className="glass-card p-6 flex items-center justify-between group cursor-pointer h-full">
                <div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Total Subscriptions</p>
                  <h4 className="text-3xl font-bold text-white group-hover:text-primary-400 transition-colors">{keyCount}</h4>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-500/20 to-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all">
                  <Icon icon="lucide:book-open" width="28" height="28" />
                </div>
              </div>
            </Link>

            <Link href="/admin/keys">
              <div className="glass-card p-6 flex items-center justify-between group cursor-pointer h-full">
                <div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Active Subs</p>
                  <h4 className="text-3xl font-bold text-white group-hover:text-emerald-400 transition-colors">{activeKeyCount}</h4>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all">
                  <Icon icon="lucide:user-check" width="28" height="28" />
                </div>
              </div>
            </Link>

            <Link href="/admin/expired-keys">
              <div className="glass-card p-6 flex items-center justify-between group cursor-pointer h-full">
                <div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Expired Subs</p>
                  <h4 className="text-3xl font-bold text-white group-hover:text-rose-400 transition-colors">{expiredKeyCount}</h4>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)] group-hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-all">
                  <Icon icon="lucide:user-x" width="28" height="28" />
                </div>
              </div>
            </Link>

            <Link href="/admin/add-service">
              <div className="glass-card p-6 flex items-center justify-between group cursor-pointer h-full">
                <div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Total Services</p>
                  <h4 className="text-3xl font-bold text-white group-hover:text-amber-400 transition-colors">{totalServices}</h4>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all">
                  <Icon icon="lucide:briefcase" width="28" height="28" />
                </div>
              </div>
            </Link>
          </div>

          {/* Main Action Area & Table */}
          <div className="glass-panel rounded-3xl overflow-hidden flex flex-col border border-white/5 shadow-2xl">
            <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">      
              <div>
                <h6 className="text-lg font-semibold text-white">Latest Subscriptions</h6>
                <p className="text-sm text-gray-400 mt-1">Overview of the most recently created subscriptions</p>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="group relative overflow-hidden bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl py-2.5 px-6 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center gap-2"
              >
                <Icon icon="lucide:plus" width="20" height="20" />
                <span>Generate Subscription</span>
              </button>
            </div>


            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-max table-auto text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 hidden sm:table-row">
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Reference Number</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Email</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Service Category</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Expiration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 block sm:table-row-group">
                {keys.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate)).slice(0, 5).map((key) => (
                    <tr key={key.id} className="hover:bg-white/[0.02] transition-colors block sm:table-row border-b sm:border-b-0 border-white/10 mb-4 sm:mb-0">
                      <td className="p-4 block sm:table-cell">
                         <span className="inline-block sm:hidden text-xs font-bold uppercase text-gray-500 mr-2">Ref:</span>
                         <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 py-1.5 px-3 rounded-lg border border-indigo-500/20">{key.id}</span>
                      </td>
                      <td className="p-4 block sm:table-cell">
                         <span className="inline-block sm:hidden text-xs font-bold uppercase text-gray-500 mr-2">Email:</span>
                         <span className="text-gray-300 font-medium">{key.email || key.username}</span>
                      </td>
                      <td className="p-4 block sm:table-cell">
                         <span className="inline-block sm:hidden text-xs font-bold uppercase text-gray-500 mr-2">Service:</span>
                         <span className="text-sm font-semibold bg-white/10 px-3 py-1 rounded-full text-white">{key.serviceCategory}</span>
                      </td>
                      <td className="p-4 block sm:table-cell">
                         <span className="inline-block sm:hidden text-xs font-bold uppercase text-gray-500 mr-2">Expires:</span>
                         <span className="text-gray-400 text-sm">{new Date(key.expirationDate).toLocaleString(undefined, {
                           year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                         })}</span>
                      </td>
                    </tr>
                  ))}
                  {keys.length === 0 && (
                     <tr>
                        <td colSpan="4" className="p-10 text-center text-gray-500">
                           <Icon icon="lucide:inbox" className="mx-auto mb-3 opacity-50" width="40" height="40" />
                           <p>No keys generated recently.</p>
                        </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <footer className="py-8 mt-4 border-t border-white/10 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()}, Designed with precision for PC Engineer.</p>
        </footer>
      </div>

            {/* Custom Modal replacing daisyUI dialog */}
            {isModalOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="glass-card max-w-lg w-full p-8 border border-white/10 relative animate-slide-up bg-[#0b0f19] shadow-2xl">
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                  >
                    <Icon icon="lucide:x" width="24" height="24" />
                  </button>
                  
                  <h2 className="text-2xl font-bold text-white mb-6">Create Subscription</h2>
                  
                  <form onSubmit={handleGenerateKey} className="space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar pb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                          type="email"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="client@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input
                          type="text"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Password (optional)"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Discord Username</label>
                        <input
                          type="text"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="johndoe#1234"
                          value={discordUsername}
                          onChange={(e) => setDiscordUsername(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                        <input
                          type="text"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="+1 234..."
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-gray-300 mb-2">Duration amount</label>
                         <input
                          type="number"
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                          placeholder="Amount"
                          value={timeValue}
                          onChange={(e) => setTimeValue(e.target.value)}
                          required
                        />
                      </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Time Unit</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['days', 'hours', 'minutes'].map((unit) => (
                           <label 
                             key={unit} 
                             className={`cursor-pointer rounded-xl border text-center py-2.5 transition-all ${timeUnit === unit ? 'bg-primary-500/20 border-primary-500 text-primary-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                           >
                             <input
                                type="radio"
                                name="timeUnit"
                                value={unit}
                                checked={timeUnit === unit}
                                onChange={() => setTimeUnit(unit)}
                                className="hidden"
                              />
                              <span className="capitalize font-medium">{unit}</span>
                           </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Service Platform</label>
                      <select
                        value={serviceCategory}
                        onChange={(e) => setServiceCategory(e.target.value)}
                        className="w-full bg-[#1e2532] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none"
                        required
                      >
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    </div>
                    
                    <button
                      className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl py-3.5 mt-2 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] flex justify-center items-center gap-2"
                      type="submit"
                    >
                      <Icon icon="lucide:user-plus" width="20" height="20" /> Create Subscription 
                    </button>
                  </form>
                </div>
              </div>
            )}

    </div>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
  const isLoggedIn = req.cookies.isLoggedIn; 

  if (!isLoggedIn) {
    return {
      redirect: {
        destination: "/", 
        permanent: false,
      },
    };
  }

  return {
    props: {
      isAuthenticated: true,
    },
  };
}