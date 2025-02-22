import Link from 'next/link';
import { useRouter } from 'next/router';
import { Icon } from "@iconify/react";

const Sidebar = () => {
  const router = useRouter();

  const isActive = (path) => {
    return router.pathname === path;
  };

  return (
    <aside className="bg-gradient-to-br from-gray-800 to-gray-900 -translate-x-80 fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0">
      <div className="relative border-b border-white/20">
        <a className="flex items-center py-6 px-8 flex-col" href="#/">
        <img src='/logo.png' width={120} height={120}></img>
          <h6 className="block antialiased tracking-normal font-sans text-base font-semibold leading-relaxed text-white">Pc Engneer Keys Dashboard</h6>
        </a>
      </div>
      <div className="m-4">
        <ul className="mb-4 flex flex-col gap-1">
          <li>
            <Link href="/dashboard">
              <button
                className={`middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-white hover:bg-white/10 active:bg-white/30 w-full flex items-center gap-4 px-4 capitalize ${
                  isActive('/dashboard') ? 'bg-white/10' : ''
                }`}
                type="button"
              >
                <Icon icon="ic:round-home" width="20" height="20" />
                <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">dashboard</p>
              </button>
            </Link>
          </li>
          <li>
            <Link href="/admin/keys">
              <button
                className={`middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-white hover:bg-white/10 active:bg-white/30 w-full flex items-center gap-4 px-4 capitalize ${
                  isActive('/admin/keys') ? 'bg-white/10' : ''
                }`}
                type="button"
              >
                <Icon icon="game-icons:house-keys" width="20" height="20" />
                <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">Manage Keys</p>
              </button>
            </Link>
          </li>
          <li>
            <Link href="/admin/expired-keys">
              <button
                className={`middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-white hover:bg-white/10 active:bg-white/30 w-full flex items-center gap-4 px-4 capitalize ${
                  isActive('/admin/expired-keys') ? 'bg-white/10' : ''
                }`}
                type="button"
              >
                <Icon icon="material-symbols-light:key-off-rounded" width="20" height="20" />
                <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">Manage Expired Keys</p>
              </button>
            </Link>
          </li>
          <li>
            <Link href="/admin/add-service">
              <button
                className={`middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-white hover:bg-white/10 active:bg-white/30 w-full flex items-center gap-4 px-4 capitalize ${
                  isActive('/admin/add-service') ? 'bg-white/10' : ''
                }`}
                type="button"
              >
                <Icon icon="game-icons:network-bars" width="20" height="20" />
                <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">Manage Services</p>
              </button>
            </Link>
          </li>
          {/* Add more links as needed */}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;