import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import "../../styles/globals.css";
import Sidebar from "../../components/Sidebar";
import Nav from "../../components/nav";
import { Icon } from "@iconify/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ExpiredKeysPage({ isAuthenticated }) {
  const [expiredKeys, setExpiredKeys] = useState([]);
  const [services, setServices] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedKey, setSelectedKey] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("/api/services");
        setServices(response.data);
      } catch (err) {
        toast.error("Failed to fetch services", { position: "top-right" });
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchExpiredKeys = async () => {
      try {
        const response = await axios.get("/api/expired_keys");
        setExpiredKeys(response.data);
      } catch (err) {
        toast.error("Failed to fetch expired keys", { position: "top-right" });
      }
    };
    fetchExpiredKeys();
  }, []);

  const filteredKeys = filterCategory === "all"
    ? expiredKeys
    : expiredKeys.filter(
        (key) => key.serviceCategory.trim().toLowerCase() === filterCategory.trim().toLowerCase()
      );

  const refreshKeys = async () => {
    try {
      const response = await axios.get("/api/expired_keys");
      setExpiredKeys(response.data);
    } catch (err) {
      toast.error("Failed to refresh keys", { position: "top-right" });
    }
  };

  const handleViewDetails = (key) => {
    setSelectedKey(key);
    setIsModalOpen(true);
  };

  const handleRestoreKey = async (keyId) => {
    try {
      await axios.post("/api/restore-key", { key: keyId });
      toast.success("Key restored successfully", { position: "top-right" });
      refreshKeys();
    } catch (err) {
      toast.error("Failed to restore key", { position: "top-right" });
    }
  };

  const handleDeleteKey = async (keyId) => {
    if(!window.confirm("Delete this key permanently?")) return;
    try {
      await axios.delete("/api/delete-expired-key", { data: { key: keyId } });
      toast.success("Key deleted successfully", { position: "top-right" });
      refreshKeys();
    } catch (err) {
      toast.error("Failed to delete key", { position: "top-right" });
    }
  };

  const handleRestoreAllKeys = async () => {
    try {
      await axios.post("/api/restore-all-keys");
      toast.success("All keys restored successfully", { position: "top-right" });
      refreshKeys();
    } catch (err) {
      toast.error("Failed to restore all keys", { position: "top-right" });
    }
  };

  const handleDeleteAllKeys = async () => {
    if(!window.confirm("Delete all expired keys permanently?")) return;
    try {
      await axios.delete("/api/delete-all-expired-keys");
      toast.success("All keys deleted successfully", { position: "top-right" });
      refreshKeys();
    } catch (err) {
      toast.error("Failed to delete all keys", { position: "top-right" });
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      <div className="blob bg-primary-500 w-96 h-96 top-0 left-10"></div>
      <div className="blob bg-rose-500 w-96 h-96 bottom-0 right-10 animation-delay-2000"></div>

      <ToastContainer theme="dark" toastClassName="glass-panel" />
      <Sidebar />
      
      <div className="p-4 xl:ml-[310px] relative z-10 transition-all duration-300">
        <Nav />
        <div className="glass-panel rounded-3xl mt-8 border border-white/5 shadow-2xl flex flex-col">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xl font-bold leading-normal text-white">
                Expired Subscriptions
              </p>
              <p className="text-sm text-gray-400 mt-1">Manage or permanently delete expired subscriptions</p>
            </div>
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              <div className="flex bg-white/5 border border-white/10 rounded-xl px-4 py-2 items-center text-sm">
                <span className="text-gray-400 mr-2">Filter:</span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent text-white focus:outline-none appearance-none font-semibold"
                >
                  <option value="all" className="bg-[#1e2532]">All Services</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.name} className="bg-[#1e2532]">
                       {service.name}
                    </option>
                  ))}
                </select>
                <Icon icon="lucide:chevron-down" className="ml-2 text-gray-400 pointer-events-none" />
              </div>

              <button
                className="group flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] whitespace-nowrap"
                onClick={handleRestoreAllKeys}
              >
                <Icon icon="lucide:refresh-cw" width="18" height="18" /> 
                <span className="hidden sm:inline">Restore All</span>
              </button>

              <button
                className="group flex items-center gap-2 py-2.5 px-4 text-sm font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] whitespace-nowrap"
                onClick={handleDeleteAllKeys}
              >
                <Icon icon="lucide:trash-2" width="18" height="18" /> 
                <span className="hidden sm:inline">Delete All</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-max table-auto text-left whitespace-nowrap">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Reference Number</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Email</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Service Category</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Expiration Date</th>
                  <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-xs text-rose-300 bg-rose-500/10 py-1.5 px-3 rounded-lg border border-rose-500/20">{key.id}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-300 font-medium">{key.email || key.username || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-semibold bg-white/10 px-3 py-1 rounded-full text-white">{key.serviceCategory}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-gray-400 text-sm">{new Date(key.expirationDate).toLocaleString(undefined, {
                           year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                         })}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white border border-primary-500/20 p-2 rounded-lg transition-colors"
                          onClick={() => handleViewDetails(key)}
                          title="View Details"
                        >
                          <Icon icon="lucide:info" width="18" height="18" />
                        </button>
                        <button
                          className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 p-2 rounded-lg transition-colors"
                          onClick={() => handleRestoreKey(key.id)}
                          title="Restore"
                        >
                          <Icon icon="lucide:refresh-ccw" width="18" height="18" />
                        </button>
                        <button
                          className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 p-2 rounded-lg transition-colors"
                          onClick={() => handleDeleteKey(key.id)}
                          title="Delete"
                        >
                          <Icon icon="lucide:trash" width="18" height="18" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredKeys.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-10 text-center text-gray-500">
                      <Icon icon="lucide:inbox" className="mx-auto mb-3 opacity-50" width="40" height="40" />
                      <p>No expired subscriptions found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info Modal */}
      {isModalOpen && selectedKey && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card max-w-lg w-full p-8 border border-white/10 relative animate-slide-up bg-[#0b0f19] shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <Icon icon="lucide:x" width="24" height="24" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Subscription Details</h2>
            
            <div className="space-y-4 mb-2 text-gray-300 max-h-[60vh] overflow-y-auto no-scrollbar pr-2">
              <div className="flex flex-col border-b border-white/5 pb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reference Number</span>
                <span className="font-mono text-primary-400 text-sm">{selectedKey.id}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</span>
                  <span className="text-sm font-medium">{selectedKey.email || selectedKey.username || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Password</span>
                  <span className="text-sm font-medium">{selectedKey.password || 'N/A'}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Discord</span>
                  <span className="text-sm font-medium">{selectedKey.discordUsername || 'N/A'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</span>
                  <span className="text-sm font-medium">{selectedKey.phoneNumber || 'N/A'}</span>
                </div>
              </div>
              
              <div className="flex flex-col border-b border-white/5 pb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Service Platform</span>
                <span className="text-sm font-medium">{selectedKey.serviceCategory}</span>
              </div>
              
              <div className="flex flex-col border-b border-white/5 pb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expiration Status</span>
                <span className="text-sm font-medium text-rose-400">Expired on {new Date(selectedKey.expirationDate).toLocaleString()}</span>
              </div>
            </div>

            <button
               onClick={() => setIsModalOpen(false)}
               className="w-full mt-6 py-3 px-4 bg-primary-600 font-bold text-white rounded-xl hover:bg-primary-500 transition-all flex justify-center items-center gap-2"
            >
              Close Details
            </button>
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

  return { props: { isAuthenticated: true } };
}