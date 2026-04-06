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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/');
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

  const filteredKeys = filterCategory === 'all'
    ? keys
    : keys.filter((key) => key.serviceCategory === filterCategory);

  const handleViewDetails = (key) => {
    setSelectedKey(key);
    setEditMode(false);
    setIsModalOpen(true);
  };

  const handleDeleteAllKeys = async () => {
    if(!window.confirm("Are you sure you want to delete all keys?")) return;
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
      setIsModalOpen(false);
      router.reload();
    } catch (err) {
      toast.error('Failed to update key', { position: 'top-right' });
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this key?")) return;
    try {
      await axios.delete('/api/delete-key', { data: { id } });
      toast.success('Key deleted successfully', { position: 'top-right' });
      router.reload();
    } catch (err) {
      toast.error('Failed to delete key', { position: 'top-right' });
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="blob bg-primary-500 w-96 h-96 top-0 left-10"></div>
      <div className="blob bg-purple-500 w-96 h-96 bottom-0 right-10 animation-delay-2000"></div>

      <ToastContainer theme="dark" toastClassName="glass-panel" />
      <Sidebar />
      
      <div className="p-4 xl:ml-[310px] relative z-10 transition-all duration-300">
        <Nav />
        <div className="glass-panel rounded-3xl mt-8 border border-white/5 shadow-2xl flex flex-col">
          <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xl font-bold leading-normal text-white">
                Manage Subscriptions
              </p>
              <p className="text-sm text-gray-400 mt-1">View, edit, and delete active subscriptions</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
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
                      <span className="font-mono text-xs text-indigo-300 bg-indigo-500/10 py-1.5 px-3 rounded-lg border border-indigo-500/20">{key.id}</span>
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
                           className="bg-primary-500/20 text-primary-400 hover:bg-primary-500 hover:text-white border border-primary-500/30 p-2 rounded-lg transition-colors" 
                           onClick={() => handleViewDetails(key)}
                           title="Info/Edit"
                        >
                          <Icon icon="lucide:info" width="18" height="18" />
                        </button>

                        <button
                          className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 p-2 rounded-lg transition-colors"
                          onClick={() => handleDelete(key.id)}
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
                      <p>No keys found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info / Edit Modal */}
      {isModalOpen && selectedKey && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-card max-w-lg w-full p-8 border border-white/10 relative animate-slide-up bg-background">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <Icon icon="lucide:x" width="24" height="24" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Subscription Details</h2>
            
            <div className="space-y-4 mb-6 text-gray-300">
              <div className="flex flex-col border-b border-white/5 pb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Reference Number</span>
                <span className="font-mono text-primary-400 text-sm">{selectedKey.id}</span>
              </div>
              <div className="flex flex-col border-b border-white/5 pb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wider mb-1">Current Expiration</span>
                <span>{new Date(selectedKey.expirationDate).toLocaleString()}</span>
              </div>
            </div>

            {editMode ? (
              <div className="space-y-4 flex flex-col mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                    <input
                      type="email"
                      value={editData.email !== undefined ? editData.email : (selectedKey.email || selectedKey.username || '')}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                    <input
                      type="text"
                      value={editData.password !== undefined ? editData.password : (selectedKey.password || '')}
                      onChange={(e) => setEditData({ ...editData, password: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Discord Username</label>
                    <input
                      type="text"
                      value={editData.discordUsername !== undefined ? editData.discordUsername : (selectedKey.discordUsername || '')}
                      onChange={(e) => setEditData({ ...editData, discordUsername: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                    <input
                      type="text"
                      value={editData.phoneNumber !== undefined ? editData.phoneNumber : (selectedKey.phoneNumber || '')}
                      onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Add Days to Expiration</label>
                  <input
                    type="number"
                    placeholder="Days (optional)"
                    value={editData.days || ''}
                    onChange={(e) => setEditData({ ...editData, days: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Service Category</label>
                  <select
                    value={editData.serviceCategory || selectedKey.serviceCategory}
                    onChange={(e) => setEditData({ ...editData, serviceCategory: e.target.value })}
                    className="w-full bg-[#1e2532] border border-white/10 rounded-xl py-2 px-3 text-white focus:ring-2 focus:ring-primary-500 transition-all appearance-none"
                  >
                    {services.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEdit}
                    className="flex-1 py-2.5 px-4 bg-primary-600 font-semibold text-white rounded-xl hover:bg-primary-500 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="flex-1 py-2.5 px-4 bg-white/5 border border-white/10 font-semibold text-white rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="w-full py-3 px-4 bg-primary-600/20 border border-primary-500/30 text-primary-400 font-bold rounded-xl hover:bg-primary-500 hover:text-white transition-all flex justify-center items-center gap-2 mt-4"
              >
                <Icon icon="lucide:pencil" width="18" height="18" /> Edit Subscription
              </button>
            )}
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
        destination: '/', 
        permanent: false,
      },
    };
  }
  return { props: { isAuthenticated: true } };
}