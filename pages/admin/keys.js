import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Sidebar from '../../components/Sidebar';
import Nav from '../../components/nav';
import { Icon } from '@iconify/react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/globals.css';

export default function KeysPage({ isAuthenticated }) {
  const [keys, setKeys] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [filterCategory, setFilterCategory] = useState('all');
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const keysResponse = await axios.get('/api/keys');
        const servicesResponse = await axios.get('/api/services');
        setKeys(keysResponse.data);
        setServices(servicesResponse.data);
      } catch (err) {
        toast.error('Failed to fetch data', { position: 'top-right' });
      }
    };
    fetchData();
  }, []);

  const filteredKeys =
    filterCategory === 'all'
      ? keys
      : keys.filter((key) => key.serviceCategory === filterCategory);

  const handleViewDetails = (key) => {
    setSelectedKey(key);
    setEditMode(false);
  };

  const handleDeleteAllKeys = async () => {
    try {
      await axios.delete('/api/delete-all-keys');
      toast.success('All keys deleted successfully', { position: 'top-right' });
      router.reload();
    } catch (err) {
      toast.error('Failed to delete all keys', { position: 'top-right' });
    }
  };

  const handleEdit = async () => {
    try {
      await axios.put('/api/edit-key', { id: selectedKey.id, ...editData });
      toast.success('Key updated successfully', { position: 'top-right' });
      setEditMode(false);
      router.reload();
    } catch (err) {
      toast.error('Failed to update key', { position: 'top-right' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete('/api/delete-key', { data: { id } });
      toast.success('Key deleted successfully', { position: 'top-right' });
      router.reload();
    } catch (err) {
      toast.error('Failed to delete key', { position: 'top-right' });
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
                Manage Keys
              </p>
              <div className="flex justify-end mb-4 mx-3 gap-5">
                <button
                  className="ml-2 py-3 px-3 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 flex items-center duration-200 h-[45px]"
                  onClick={handleDeleteAllKeys}
                >
                  <Icon icon="material-symbols-light:delete-rounded" width="24" height="24" /> Delete All
                </button>
                <div className="py-3 px-4 flex items-center text-sm font-medium leading-none text-gray-600 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded">
                  <p>Filter:</p>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="focus:text-indigo-600 focus:outline-none bg-transparent ml-1"
                  >
                    <option value="all">All</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white py-4 md:py-7 rounded-xl">
            <div className="mt-7 overflow-x-auto">
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
                          <button className="btn" onClick={() => {handleViewDetails(key); document.getElementById("my_modal_3").showModal();}}>
                            <Icon icon="tabler:info-circle" width="20" height="20" /> Info
                          </button>

                          <dialog id="my_modal_3" className="modal">
                            <div className="modal-box">
                              <form method="dialog">
                                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                                  ✕
                                </button>
                              </form>
                              <div>
                                <h1 className="tracking-normal font-sans  leading-relaxed text-xl font-bold text-gray-800 mb-4">
                                  Key Details
                                </h1>

                                {selectedKey && (
                                  <div>
                                    <div className="space-y-4">
                                      <p><strong>Key:</strong> {selectedKey.id}</p>
                                      <p><strong>Username:</strong> {selectedKey.username}</p>
                                      <p><strong>Service Category:</strong> {selectedKey.serviceCategory}</p>
                                      <p><strong>Expiration Date:</strong> {new Date(selectedKey.expirationDate).toLocaleString()}</p>

                                      {editMode ? (
                                        <div className="space-y-4 flex flex-col">
                                          <input
                                            type="text"
                                            placeholder="Username"
                                            value={editData.username || selectedKey.username}
                                            onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded"
                                          />
                                          <input
                                            type="number"
                                            placeholder="Days"
                                            value={editData.days || ''}
                                            onChange={(e) => setEditData({ ...editData, days: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded"
                                          />
                                          <select
                                            value={editData.serviceCategory || selectedKey.serviceCategory}
                                            onChange={(e) => setEditData({ ...editData, serviceCategory: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded"
                                          >
                                            {services.map((service) => (
                                              <option key={service.id} value={service.name}>
                                                {service.name}
                                              </option>
                                            ))}
                                          </select>
                                          <div className="flex gap-2">
                                            <button
                                              onClick={handleEdit}
                                              className="py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={() => setEditMode(false)}
                                              className="py-2 px-4 bg-gray-600 text-white rounded hover:bg-gray-700"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setEditMode(true)}
                                          className="py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                        >
                                          Edit
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </dialog>
                          <button
                            className="ml-2 py-3 px-3 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 flex items-center duration-200 h-[45px]"
                            onClick={() => handleDelete(key.id)}
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
        destination: '/', // Redirect to login page if not logged in
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