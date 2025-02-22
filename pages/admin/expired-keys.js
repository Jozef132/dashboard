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

  const filteredKeys =
    filterCategory === "all"
      ? expiredKeys
      : expiredKeys.filter(
          (key) =>
            key.serviceCategory.trim().toLowerCase() ===
            filterCategory.trim().toLowerCase()
        );

  const refreshKeys = async () => {
    try {
      const response = await axios.get("/api/expired_keys");
      setExpiredKeys(response.data);
    } catch (err) {
      toast.error("Failed to refresh keys", { position: "top-right" });
    }
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
    try {
      await axios.delete("/api/delete-all-expired-keys");
      toast.success("All keys deleted successfully", { position: "top-right" });
      refreshKeys();
    } catch (err) {
      toast.error("Failed to delete all keys", { position: "top-right" });
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
        <div className="w-full bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="px-4 md:px-10 pt-4 md:pt-7">
            <div className="flex items-center justify-between">
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-normal text-gray-800">
                Expired Keys
              </p>
              <div className="py-3 px-4 flex items-center text-sm font-medium leading-none text-gray-600 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded">
                <p>Filter:</p>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="focus:text-indigo-600 focus:outline-none bg-transparent ml-1"
                >
                  <option value="all">All</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="bg-white py-4 md:py-7 rounded-xl">
            <div className="mt-7 overflow-x-auto">
              <div className="flex justify-end mb-4 mx-3">
                <button
                  className="py-3 px-3 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 flex items-center duration-200 gap-1 h-[45px]"
                  onClick={handleRestoreAllKeys}
                >
                  <Icon icon="tabler:restore" width="20" height="20" /> Restore All
                </button>
                <button
                  className="ml-2 py-3 px-3 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 flex items-center duration-200 h-[45px]"
                  onClick={handleDeleteAllKeys}
                >
                  <Icon icon="material-symbols-light:delete-rounded" width="24" height="24" /> Delete All
                </button>
              </div>
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Username</th>
                    <th>Service Category</th>
                    <th>Expiration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKeys.map((key) => (
                    <tr key={key.id} className="h-16 border border-gray-100 rounded">
                      <td>
                        <div className="flex items-center pl-5">
                          <p className="text-base font-medium text-gray-700">{key.id}</p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center pl-5">
                          <p className="text-base font-medium text-gray-700">{key.username}</p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center pl-5">
                          <p className="text-base font-medium text-gray-700">{key.serviceCategory}</p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center pl-5">
                          <p className="text-base font-medium text-gray-700">
                            {new Date(key.expirationDate).toLocaleString()}
                          </p>
                        </div>
                      </td>
                      <td className="pl-5">
                        <div className="flex items-center justify-center">
                          <button
                            className="py-3 px-3 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 flex items-center duration-200 gap-1 h-[45px]"
                            onClick={() => handleRestoreKey(key.id)}
                          >
                            <Icon icon="tabler:restore" width="20" height="20" /> Restore
                          </button>
                          <button
                            className="ml-2 py-3 px-3 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 flex items-center duration-200 h-[45px]"
                            onClick={() => handleDeleteKey(key.id)}
                          >
                            <Icon icon="material-symbols-light:delete-rounded" width="24" height="24" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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