import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon } from "@iconify/react";
import axios from 'axios';

const Nav = () => {
  const router = useRouter();
  const pathSegments = router.asPath.split('/').filter(segment => segment !== '' && !segment.includes('?'));

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      router.push('/');
    } catch (e) {
      console.error(e);
      router.push('/'); // Fallback
    }
  };

  return (
    <nav className="sticky top-4 z-40 block w-full max-w-full bg-glass-bg backdrop-blur-xl border border-glass-border text-white shadow-lg rounded-2xl transition-all px-6 py-4 mb-8">
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize flex items-center">
          <nav aria-label="breadcrumb" className="w-max">
            <ol className="flex flex-wrap items-center w-full bg-transparent p-0 transition-all space-x-2">
              <li className="flex items-center text-sm font-medium transition-colors duration-300">
                <Link href="/dashboard">
                  <span className="flex items-center gap-2 text-gray-400 hover:text-primary-400 transition-colors">
                     <Icon icon="ic:round-space-dashboard" width="18" height="18" />
                     <span className="hidden sm:inline-block">Dashboard</span>
                  </span>
                </Link>
              </li>
              
              {pathSegments.map((segment, index) => {
                const isDashboard = segment.toLowerCase() === 'dashboard';
                if (isDashboard) return null; // We already added dashboard breadcrumb manually
                
                return (
                  <li key={index} className="flex items-center text-sm font-medium">
                    <Icon icon="lucide:chevron-right" width="16" height="16" className="text-gray-600 mx-1" />
                    <Link href={`/${pathSegments.slice(0, index + 1).join('/')}`}>
                      <span className={`capitalize ${index === pathSegments.length - 1 ? 'text-white text-glow' : 'text-gray-400 hover:text-primary-400 transition-colors'}`}>
                        {segment.replace(/-/g, ' ')}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
        <div className="flex items-center gap-4">
           {/* Mobile menu button placeholder */}
          <button className="relative middle font-sans font-medium text-center transition-all disabled:opacity-50 disabled:shadow-none w-10 h-10 rounded-lg text-gray-400 hover:bg-white/10 grid xl:hidden" type="button">
            <Icon icon="lucide:menu" width="24" height="24" className="m-auto" />
          </button>
          
          <button 
             onClick={handleLogout} 
             className="group font-sans font-semibold transition-all duration-300 text-sm py-2 px-5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center gap-2" 
             type="button"
          >
            <Icon icon="lucide:log-out" width="18" height="18" className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline-block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Nav;