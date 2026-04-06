import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import "../../styles/globals.css";
import Sidebar from "../../components/Sidebar";
import Nav from "../../components/nav";
import { Icon } from "@iconify/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ManageServicesPage({ isAuthenticated }) {
  const [serviceName, setServiceName] = useState("");
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
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

  const handleAddService = async (e) => {
    e.preventDefault();
    if(!serviceName.trim()) return;
    try {
      await axios.post("/api/add-service", { serviceName });
      toast.success("Service added successfully", { position: "top-right" });
      setServiceName("");
      const updatedServices = await axios.get("/api/services");
      setServices(updatedServices.data);
    } catch (err) {
      toast.error("Failed to add service", { position: "top-right" });
    }
  };

  const handleEditService = async (id, newName) => {
    if(!newName.trim()) {
      setEditingService(null);
      return;
    }
    try {
      await axios.put("/api/edit-service", { id, name: newName });
      toast.success("Service updated successfully", { position: "top-right" });
      setEditingService(null);
      const updatedServices = await axios.get("/api/services");
      setServices(updatedServices.data);
    } catch (err) {
      toast.error("Failed to update service", { position: "top-right" });
    }
  };

  const handleDeleteService = async (id) => {
    if(!window.confirm("Permanently delete this service?")) return;
    try {
      await axios.delete("/api/delete-service", { data: { id } });
      toast.success("Service deleted successfully", { position: "top-right" });
      const updatedServices = await axios.get("/api/services");
      setServices(updatedServices.data);
    } catch (err) {
      toast.error("Failed to delete service", { position: "top-right" });
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
        <div className="glass-panel rounded-3xl mt-8 border border-white/5 shadow-2xl p-6 md:p-10 flex flex-col xl:flex-row gap-10">
          
          {/* Add Service Section */}
          <div className="xl:w-1/3 flex flex-col space-y-6">
             <div>
                <h2 className="text-2xl font-bold leading-normal text-white">Add Service</h2>
                <p className="text-sm text-gray-400 mt-1">Create a new service platform category</p>
             </div>
             
             <form onSubmit={handleAddService} className="flex flex-col gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-400 mb-2">Service Name</label>
                   <input
                     type="text"
                     placeholder="e.g. Netflix, Spotify"
                     value={serviceName}
                     onChange={(e) => setServiceName(e.target.value)}
                     required
                     className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary-500 transition-all"
                   />
                </div>
                <button
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl py-3.5 transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] flex justify-center items-center gap-2"
                  type="submit"
                >
                  <Icon icon="lucide:plus" width="20" height="20" /> Add Category
                </button>
             </form>

             <div className="p-6 bg-primary-500/10 border border-primary-500/20 rounded-2xl">
                 <Icon icon="lucide:info" className="text-primary-400 mb-3" width="28" height="28" />
                 <h3 className="text-white font-semibold mb-2">Why categories?</h3>
                 <p className="text-sm text-indigo-200/70">Categories help organize generated keys to specific applications or subscription services efficiently.</p>
             </div>
          </div>

           {/* List Services Section */}
           <div className="xl:w-2/3">
             <div className="mb-6 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-bold leading-normal text-white">Existing Services</h2>
                <p className="text-sm text-gray-400 mt-1">Manage all available service platforms</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {services.map((service) => (
                 <div key={service.id} className="relative group bg-white/5 border border-white/10 hover:bg-white/10 p-5 rounded-2xl transition-all duration-300 flex items-center justify-between">
                   {editingService === service.id ? (
                     <div className="w-full flex items-center gap-2">
                       <input
                         type="text"
                         defaultValue={service.name}
                         onBlur={(e) => handleEditService(service.id, e.target.value)}
                         autoFocus
                         className="w-full bg-black/30 border border-primary-500/50 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
                         onKeyDown={(e) => {
                             if(e.key === 'Enter') {
                                 e.preventDefault();
                                 e.target.blur();
                             }
                         }}
                       />
                        <button onClick={() => setEditingService(null)} className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors">
                          <Icon icon="lucide:x" width="20" height="20" />
                        </button>
                     </div>
                   ) : (
                     <>
                       <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center text-primary-400">
                             <Icon icon="lucide:layout-grid" width="20" height="20" />
                          </div>
                          <span className="text-white font-semibold truncate text-lg tracking-wide">{service.name}</span>
                       </div>
                       
                       <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => setEditingService(service.id)} 
                            className="bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white border border-amber-500/20 p-2 rounded-xl transition-all"
                            title="Edit"
                         >
                           <Icon icon="lucide:pencil" width="18" height="18" />
                         </button>
                         <button 
                            onClick={() => handleDeleteService(service.id)} 
                            className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 p-2 rounded-xl transition-all"
                            title="Delete"
                         >
                           <Icon icon="lucide:trash-2" width="18" height="18" />
                         </button>
                       </div>
                     </>
                   )}
                 </div>
               ))}

               {services.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                     <Icon icon="lucide:layout-grid" className="mx-auto mb-3 opacity-50" width="40" height="40" />
                     <p>No services created yet.</p>
                  </div>
               )}
             </div>
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