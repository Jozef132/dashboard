import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import '../styles/globals.css';
import Sidebar from '../components/Sidebar';
import Nav from '../components/nav';
import { Icon } from "@iconify/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from 'next/link';


export default function Dashboard({ isAuthenticated }) {
  const [username, setUsername] = useState('');
  const [timeValue, setTimeValue] = useState(''); // Store the time value (e.g., 1, 2, 3)
  const [timeUnit, setTimeUnit] = useState('days'); // Default unit is days
  const [serviceCategory, setServiceCategory] = useState(''); // Default value
  const [services, setServices] = useState([]); // Store available services
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [keyCount, setKeyCount] = useState(0);
  const [expiredKeyCount, setExpiredKeyCount] = useState(0);
  const [activeKeyCount, setActiveKeyCount] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [keys, setKeys] = useState([]);
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);
    // Fetch all keys and services
    useEffect(() => {
      const fetchData = async () => {
        try {
          const keysResponse = await axios.get('/api/keys');
          const servicesResponse = await axios.get('/api/services');
          setKeys(keysResponse.data);
          setServices(servicesResponse.data);
        } catch (err) {
          console.error('Failed to fetch data:', err);
        }
      };
      fetchData();
    }, []);
  useEffect(() => {
    async function fetchExpiredKeys() {
      try {
        const response = await fetch("/api/expired_keys");
  
        if (!response.ok) {
          if (response.status === 404) {
            console.warn("API endpoint not found. Returning default value.");
            setExpiredKeyCount(0);
            return;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        setExpiredKeyCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        console.error("Error fetching expired keys:", error);
        setExpiredKeyCount(0);
      }
    }
  
    fetchExpiredKeys();
  }, []);

  useEffect(() => {
    fetch("/api/total_services")
      .then((res) => res.json())
      .then((data) => {
        setTotalServices(data.totalServices || 0);
      })
      .catch((err) => console.error("Error fetching services:", err));
  }, []);

  useEffect(() => {
    async function fetchActiveKeys() {
      try {
        const response = await fetch("/api/active_keys");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setActiveKeyCount(Array.isArray(data) ? data.length : 0);
      } catch (error) {
        console.error("Error fetching active keys:", error);
        setActiveKeyCount(0); // Default to 0 on error
      }
    }

    fetchActiveKeys();
  }, []);
  
  useEffect(() => {
    async function fetchKeys() {
      try {
        const response = await fetch("/api/total_keys"); // Ensure this endpoint is correct
        const data = await response.json();
        setKeyCount(data.total); // Use 'total' instead of 'length'
      } catch (error) {
        console.error("Error fetching keys:", error);
      }
    }
  
    fetchKeys();
  }, []);
  

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('/api/services');
        setServices(response.data);
        if (response.data.length > 0) {
          setServiceCategory(response.data[0].id); // Set the first service as default
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      }
    };
    fetchServices();
  }, []);
  

  const handleGenerateKey = async (e) => {
    e.preventDefault();
  
    // Validate input fields
    if (!username || !timeValue || !serviceCategory) {
      setError("All fields are required!");
      toast.error("All fields are required!", { position: "top-right" });
      return;
    }
  
    try {
      // Calculate expiration date based on the selected time unit
      const expirationDate = new Date();
      switch (timeUnit) {
        case "days":
          expirationDate.setDate(expirationDate.getDate() + parseInt(timeValue));
          break;
        case "hours":
          expirationDate.setHours(expirationDate.getHours() + parseInt(timeValue));
          break;
        case "minutes":
          expirationDate.setMinutes(expirationDate.getMinutes() + parseInt(timeValue));
          break;
        default:
          throw new Error("Invalid time unit");
      }
  
      // Send request to API
      const response = await axios.post("/api/generate-key", {
        username,
        expirationDate: expirationDate.toISOString(),
        serviceCategory,
      });
  
      setKey(response.data.key);
      setError("");
  
      // Show success toast with the generated key
      toast.success(`Key Generated: ${response.data.key}`, { position: "top-right", autoClose: false, });
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Failed to generate key";
      setError(errorMessage);
      toast.error(errorMessage, { position: "top-right" });
    }
  };

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }
  

  return (
<div className="min-h-screen bg-gray-50/50">
<Sidebar />
{/*   <aside className="bg-gradient-to-br from-gray-800 to-gray-900 -translate-x-80 fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0">
    <div className="relative border-b border-white/20">
      <a className="flex items-center gap-4 py-6 px-8" href="#/">
        <h6 className="block antialiased tracking-normal font-sans text-base font-semibold leading-relaxed text-white">Material Tailwind Dashboard</h6>
      </a>
      <button className="middle none font-sans font-medium text-center uppercase transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none w-8 max-w-[32px] h-8 max-h-[32px] rounded-lg text-xs text-white hover:bg-white/10 active:bg-white/30 absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden" type="button">
        <span className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" aria-hidden="true" className="h-5 w-5 text-white">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </span>
      </button>
    </div>
    <div className="m-4">
      <ul className="mb-4 flex flex-col gap-1">
        <li>
          <a aria-current="page" className="active" href="#">
            <button className="middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/40 active:opacity-[0.85] w-full flex items-center gap-4 px-4 capitalize" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5 text-inherit">
                <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"></path>
                <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z"></path>
              </svg>
              <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">dashboard</p>
            </button>
          </a>
        </li>
        <li>
          <a className="" href="#">
            <button className="middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-white hover:bg-white/10 active:bg-white/30 w-full flex items-center gap-4 px-4 capitalize" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5 text-inherit">
                <path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd"></path>
              </svg>
              <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">profile</p>
            </button>
          </a>
        </li>
        <li>
          <a className="" href="#">
            <button className="middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-white hover:bg-white/10 active:bg-white/30 w-full flex items-center gap-4 px-4 capitalize" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5 text-inherit">
                <path fill-rule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 18.375V5.625zM21 9.375A.375.375 0 0020.625 9h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zm0 3.75a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 00.375-.375v-1.5zM10.875 18.75a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375h7.5zM3.375 15h7.5a.375.375 0 00.375-.375v-1.5a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375v1.5c0 .207.168.375.375.375zm0-3.75h7.5a.375.375 0 00.375-.375v-1.5A.375.375 0 0010.875 9h-7.5A.375.375 0 003 9.375v1.5c0 .207.168.375.375.375z" clip-rule="evenodd"></path>
              </svg>
              <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">tables</p>
            </button>
          </a>
        </li>
        <li>
          <a className="" href="#">
            <button className="middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-white hover:bg-white/10 active:bg-white/30 w-full flex items-center gap-4 px-4 capitalize" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5 text-inherit">
                <path fill-rule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clip-rule="evenodd"></path>
              </svg>
              <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">notifactions</p>
            </button>
          </a>
        </li>
      </ul>
      <ul className="mb-4 flex flex-col gap-1">
        <li className="mx-3.5 mt-4 mb-2">
          <p className="block antialiased font-sans text-sm leading-normal text-white font-black uppercase opacity-75">auth pages</p>
        </li>
        <li>
          <a className="" href="#">
            <button className="middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-white hover:bg-white/10 active:bg-white/30 w-full flex items-center gap-4 px-4 capitalize" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5 text-inherit">
                <path fill-rule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clip-rule="evenodd"></path>
              </svg>
              <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">sign in</p>
            </button>
          </a>
        </li>
        <li>
          <a className="" href="#">
            <button className="middle none font-sans font-bold center transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none text-xs py-3 rounded-lg text-white hover:bg-white/10 active:bg-white/30 w-full flex items-center gap-4 px-4 capitalize" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-5 h-5 text-inherit">
                <path d="M6.25 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM3.25 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM19.75 7.5a.75.75 0 00-1.5 0v2.25H16a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25H22a.75.75 0 000-1.5h-2.25V7.5z"></path>
              </svg>
              <p className="block antialiased font-sans text-base leading-relaxed text-inherit font-medium capitalize">sign up</p>
            </button>
          </a>
        </li>
      </ul>
    </div>
  </aside> */}
  <div className="p-4 xl:ml-80">
    <Nav />
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
      <Link href="/admin/keys">
      <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
      <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-blue-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
      <Icon icon="game-icons:house-keys" width="40" height="40" />
      </div>
      <div className="p-4 text-right">
        <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">
          Total Keys
        </p>
        <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
          {keyCount}
        </h4>
      </div>
    </div>
    </Link>
    <Link href="/admin/keys">
    <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
      <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-green-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
      <Icon icon="bi:key-fill" width="40" height="40" />
      </div>
      <div className="p-4 text-right">
        <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">
          Active Keys
        </p>
        <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
          {activeKeyCount}
        </h4>
      </div>
    </div>
    </Link>
    <Link href="/admin/expired-keys">
    <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
      <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-red-600 to-red-400 text-white shadow-red-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
      <Icon icon="material-symbols-light:key-off-rounded" width="40" height="40" />
      </div>
      <div className="p-4 text-right">
        <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">
          Expired Keys
        </p>
        <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">
          {expiredKeyCount}
        </h4>
      </div>
    </div>
    </Link>
    <Link href="/admin/add-service">
    <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
      <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-orange-600 to-orange-400 text-white shadow-orange-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
      <Icon icon="game-icons:network-bars" width="25" height="25" />
      </div>
      <div className="p-4 text-right">
        <p className="block antialiased font-sans text-sm leading-normal font-normal text-blue-gray-600">Total Services</p>
        <h4 className="block antialiased tracking-normal font-sans text-2xl font-semibold leading-snug text-blue-gray-900">{totalServices}</h4>
      </div>
    </div>
    </Link>
      </div>
      <ToastContainer /> {/* ✅ Place ToastContainer Here */}
      <div className="mb-4 grid grid-cols-1 gap-6">
  <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md overflow-hidden xl:col-span-2">
  <div className="relative bg-clip-border rounded-xl overflow-hidden bg-transparent text-gray-700 shadow-none m-0 flex items-center justify-between p-6">      
      <div>
        <h6 className="block antialiased tracking-normal font-sans text-base font-semibold leading-relaxed text-blue-gray-900 mb-1">
          Latest Keys
        </h6>
      </div>

      <button className="btn" onClick={() => document.getElementById("my_modal_3").showModal()}>
        Generate New Key
      </button>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <div>
            <h1 className="tracking-normal font-sans text-base font-semibold leading-relaxed text-blue-gray-900 mb-5">
              Generate Key
            </h1>
            <form onSubmit={handleGenerateKey}>
              <div className="flex gap-4">
                <input
                  type="text"
                  className="input"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <input
                  type="number"
                  className="input"
                  placeholder="Time"
                  value={timeValue}
                  onChange={(e) => setTimeValue(e.target.value)}
                  required
                />
              </div>
              <div>
                <div className="radio-button-container mt-5">
                  <div className="radio-button">
                    <input
                      value="days"
                      checked={timeUnit === "days"}
                      onChange={() => setTimeUnit("days")}
                      type="radio"
                      className="radio-button__input"
                      id="radio1"
                      name="radio-group"
                    />
                    <label className="radio-button__label text-gray-400" htmlFor="radio1">
                      <span className="radio-button__custom"></span>
                      Days
                    </label>
                  </div>
                  <div className="radio-button">
                    <input
                      value="hours"
                      checked={timeUnit === "hours"}
                      onChange={() => setTimeUnit("hours")}
                      type="radio"
                      className="radio-button__input"
                      id="radio2"
                      name="radio-group"
                    />
                    <label className="radio-button__label text-gray-400" htmlFor="radio2">
                      <span className="radio-button__custom"></span>
                      Hours
                    </label>
                  </div>
                  <div className="radio-button">
                    <input
                      value="minutes"
                      checked={timeUnit === "minutes"}
                      onChange={() => setTimeUnit("minutes")}
                      type="radio"
                      className="radio-button__input"
                      id="radio3"
                      name="radio-group"
                    />
                    <label className="radio-button__label text-gray-400" htmlFor="radio3">
                      <span className="radio-button__custom"></span>
                      Minutes
                    </label>
                  </div>
                </div>
              </div>

              <label htmlFor="countries" className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">
                Select an option
              </label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                required
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <div className="w-full">
                <button
                  className="bg-green-400 py-[12px] px-[12px] bg-clip-border rounded-lg overflow-hidden bg-gradient-to-tr from-green-600 to-green-400 text-white shadow-green-500/40 shadow-lg w-full mt-4 text-[20px]"
                  type="submit"
                >
                  Generate Key
                </button>
              </div>
            </form>
{/*             {key && (
              <div>
                <h2>Generated Key:</h2>
                <p>{key}</p>
              </div>
            )} */}
{/*             {error && <p style={{ color: "red" }}>{error}</p>} */}
          </div>
        </div>
      </dialog>
    </div>
    <div className="p-6 overflow-x-scroll px-0 pt-0 pb-2">
      <table className="w-full min-w-[640px] table-auto">
        <thead>
          <tr>
            <th className="border-b border-blue-gray-50 py-3 px-6 text-left">
              <p className="block antialiased font-sans text-[11px] font-medium uppercase text-blue-gray-400">Key</p>
            </th>
            <th className="border-b border-blue-gray-50 py-3 px-6 text-left">
              <p className="block antialiased font-sans text-[11px] font-medium uppercase text-blue-gray-400">Username</p>
            </th>
            <th className="border-b border-blue-gray-50 py-3 px-6 text-left">
              <p className="block antialiased font-sans text-[11px] font-medium uppercase text-blue-gray-400">Category Name</p>
            </th>
            <th className="border-b border-blue-gray-50 py-3 px-6 text-left">
              <p className="block antialiased font-sans text-[11px] font-medium uppercase text-blue-gray-400">Expiration Date</p>
            </th>
          </tr>
        </thead>
        <tbody>
        {keys.sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate)).slice(0, 5).map((key) => (
            <tr key={key.id}>
              <td className="py-3 px-5 border-b border-blue-gray-50">
                <p className="block antialiased font-sans text-sm leading-normal text-blue-gray-900 font-bold">{key.id}</p>
              </td>
              <td className="py-3 px-5 border-b border-blue-gray-50">
                <p className="block antialiased font-sans text-sm leading-normal text-blue-gray-600">{key.username}</p>
              </td>
              <td className="py-3 px-5 border-b border-blue-gray-50">
                <p className="block antialiased font-sans text-sm leading-normal text-blue-gray-600">{key.serviceCategory}</p>
              </td>
              <td className="py-3 px-5 border-b border-blue-gray-50">
                <p className="block antialiased font-sans text-sm leading-normal text-blue-gray-600">{new Date(key.expirationDate).toLocaleString()}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

    </div>
    <div className="text-blue-gray-600">
      <footer className="py-2">
        <div className="flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-between">
          <p className="block antialiased font-sans text-sm leading-normal font-normal text-inherit">© 2025, made with by <a href="https://www.jozef.site" target="_blank" className="transition-colors hover:text-blue-500">Jozef</a> for PC Engneer. </p>
        </div>
      </footer>
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