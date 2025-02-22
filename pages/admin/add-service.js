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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
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
    try {
      await axios.delete("/api/delete-service", { data: { id } });
      toast.success("Service deleted successfully", { position: "top-right" });
      const updatedServices = await axios.get("/api/services");
      setServices(updatedServices.data);
    } catch (err) {
      toast.error("Failed to delete service", { position: "top-right" });
    }
  };

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <ToastContainer />
      <Sidebar />
      <div className="p-4 xl:ml-80">
        <Nav />
        <div className="w-full bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Manage Services</h1>
          <form onSubmit={handleAddService} className="mb-4 flex gap-2">
            <div className="w-full flex items-center gap-5">
              <input
                type="text"
                placeholder="Service Name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                required
                className="p-2 border rounded !max-w-full input"
              />
              <button
                className="bg-green-400 py-[12px] px-[12px] bg-clip-border rounded-lg overflow-hidden bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-green-500/40 shadow-lg text-[20px] w-[10rem] h-[3rem] flex items-center justify-center"
                type="submit"
              >
                Add Service
              </button>
            </div>
          </form>
          <h2 className="text-xl font-semibold mt-6">All Services</h2>
          <ul className="mt-3 space-y-3">
            {services.map((service) => (
              <li key={service.id} className="flex justify-between items-center gap-5 bg-gray-100 p-3 rounded-xl font-semibold">
                {editingService === service.id ? (
                  <input
                    type="text"
                    defaultValue={service.name}
                    onBlur={(e) => handleEditService(service.id, e.target.value)}
                    className="p-2 border rounded w-full input !max-w-full"
                  />
                ) : (
                  <span>{service.name}</span>
                )}
                <div className="flex gap-2">
                  {editingService === service.id ? (
                    <button onClick={() => setEditingService(null)} className="px-3 py-1 bg-gray-400 text-white rounded flex items-center gap-1">
                      <Icon icon="material-symbols:cancel-rounded" width="20" height="20" /> Cancel
                    </button>
                  ) : (
                    <button onClick={() => setEditingService(service.id)} className="btn !bg-yellow-500 !text-sm">
                      <Icon icon="mdi:edit" width="24" height="24" /> Edit
                    </button>
                  )}
                  <button onClick={() => handleDeleteService(service.id)} className="ml-2 py-3 px-3 text-sm text-red-700 bg-red-500 rounded hover:bg-red-200 flex items-center duration-200 h-[45px]">
                    <Icon icon="material-symbols-light:delete-rounded" width="24" height="24" /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { req } = context;
  const isLoggedIn = req.cookies.isLoggedIn; // Check if the user is logged in

  if (!isLoggedIn) {
    return {
      redirect: {
        destination: "/", // Redirect to login page if not logged in
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