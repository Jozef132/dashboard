import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon } from "@iconify/react";

const Sidebar = () => {
  const router = useRouter();

  const isActive = (path) => {
    return router.pathname === path;
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'ic:round-space-dashboard' },
    { name: 'Manage Keys', path: '/admin/keys', icon: 'lucide:key' },
    { name: 'Expired Keys', path: '/admin/expired-keys', icon: 'lucide:key-square' },
    { name: 'Manage Services', path: '/admin/add-service', icon: 'lucide:briefcase' },
    { name: 'Settings', path: '/admin/settings', icon: 'lucide:settings' }
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 my-4 ml-4 w-72 rounded-3xl transition-transform duration-300 xl:translate-x-0 -translate-x-80 glass-panel border border-white/5 shadow-2xl flex flex-col">
      <div className="relative border-b border-white/10 p-6 flex items-center justify-center flex-col">
        {/* Placeholder for Logo -> Assuming you have logo.png, just scaling it down softly */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-500 to-purple-600 mb-3 flex items-center justify-center overflow-hidden shadow-lg shadow-primary-500/30">
           <img src='/logo.png' alt="Logo" className="w-10 h-10 object-contain mix-blend-screen" />
        </div>
        <h6 className="block antialiased tracking-normal font-sans text-lg font-bold leading-relaxed text-white text-glow text-center">
          PC Engineer
        </h6>
        <p className="text-xs text-indigo-300/80 font-medium tracking-widest mt-1 uppercase">Admin Portal</p>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 no-scrollbar">
        <ul className="flex flex-col gap-2">
          {menuItems.map((item) => (
             <li key={item.path}>
             <Link href={item.path}>
               <button
                 className={`group font-sans font-medium transition-all duration-300 ease-in-out text-sm py-3.5 px-4 rounded-xl w-full flex items-center gap-4 capitalize relative overflow-hidden ${
                   isActive(item.path) 
                   ? 'text-white' 
                   : 'text-gray-400 hover:text-white hover:bg-white/5'
                 }`}
                 type="button"
               >
                 {isActive(item.path) && (
                   <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent"></div>
                 )}
                 {isActive(item.path) && (
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-md shadow-[0_0_10px_#6366f1]"></div>
                 )}
                 <Icon 
                    icon={item.icon} 
                    className={`shrink-0 transition-colors duration-300 ${isActive(item.path) ? 'text-primary-400' : 'text-gray-500 group-hover:text-primary-400'}`} 
                    width="22" 
                    height="22" 
                  />
                 <p className="block antialiased z-10 leading-relaxed text-inherit font-semibold">{item.name}</p>
               </button>
             </Link>
           </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;