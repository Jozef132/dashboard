import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import "../../styles/globals.css";
import Sidebar from "../../components/Sidebar";
import Nav from "../../components/nav";
import { Icon } from "@iconify/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SettingsPage({ isAuthenticated }) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get("/api/settings");
        if (response.data.webhookUrl) {
          setWebhookUrl(response.data.webhookUrl);
        }
      } catch (err) {
        toast.error("Failed to fetch settings", { position: "top-right" });
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post("/api/settings", { webhookUrl });
      toast.success("Webhook URL saved successfully!", { position: "top-right" });
    } catch (err) {
      toast.error("Failed to save settings", { position: "top-right" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      <div className="blob bg-primary-500 w-96 h-96 top-0 left-10"></div>
      <div className="blob bg-purple-500 w-96 h-96 bottom-0 right-10 animation-delay-2000"></div>

      <ToastContainer theme="dark" toastClassName="glass-panel" />
      <Sidebar />
      <div className="p-4 xl:ml-[310px] relative z-10 transition-all duration-300">
        <Nav />
        <div className="glass-panel rounded-3xl mt-8 border border-white/5 shadow-2xl p-6 md:p-10 flex flex-col max-w-4xl">
          
          <div className="mb-8 border-b border-white/10 pb-6 flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center text-primary-400">
                <Icon icon="lucide:settings" width="28" height="28" />
             </div>
             <div>
                <h2 className="text-2xl font-bold leading-normal text-white">System Settings</h2>
                <p className="text-sm text-gray-400 mt-1">Configure integrations and global properties</p>
             </div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/[0.07] transition-all">
             <div className="flex items-center gap-3 mb-6">
                 <Icon icon="ic:baseline-discord" className="text-indigo-400" width="32" height="32" />
                 <h3 className="text-xl font-bold text-white">Discord Integration</h3>
             </div>
             
             <p className="text-gray-400 text-sm mb-6 max-w-2xl">
                When an active subscription is created or reaches its expiration date, the system will automatically send notifications to a specific Discord channel. Enter your Discord Webhook URL below to enable this feature.
             </p>

             <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">Webhook URL</label>
                   <div className="relative group">
                     <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
                       <Icon icon="lucide:link" width="20" height="20" />
                     </div>
                     <input
                       type="url"
                       placeholder="https://discord.com/api/webhooks/..."
                       value={webhookUrl}
                       onChange={(e) => setWebhookUrl(e.target.value)}
                       className="w-full bg-black/30 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                     />
                   </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl py-3 px-8 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] flex items-center gap-2 disabled:opacity-70"
                >
                  <Icon icon={isLoading ? "lucide:loader" : "lucide:save"} className={isLoading ? "animate-spin" : ""} width="20" height="20" /> 
                  {isLoading ? 'Saving...' : 'Save Configuration'}
                </button>
             </form>
          </div>
          
        </div>
      </div>
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
