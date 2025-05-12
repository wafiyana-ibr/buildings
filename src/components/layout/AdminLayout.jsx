import React, { useState, useEffect } from "react"; // Import useEffect
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faTable,
  faUsers,
  faList,
  faLayerGroup,
  faSignOutAlt,
  faBars,
  faChessBoard,
  faHouseUser
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth hook

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const location = useLocation();
  const isMobile = window.innerWidth < 768;
  const navigate = useNavigate();
  const { logout } = useAuth(); // Get logout function from auth context

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
      } 
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle logout function
  const handleLogout = async () => {
    await logout();
    navigate('/sign-in');
  };

  const navItems = [
    { path: "/admin", icon: faHome, label: "Dashboard" },
    { path: "/admin/bases", icon: faChessBoard, label: "Bases" },
    { path: "/admin/users", icon: faUsers, label: "Users" },
    { path: "/admin/categories", icon: faLayerGroup, label: "Categories" },
    { path: "/admin/types", icon: faList, label: "Types" },
    { path: "/", icon: faHouseUser, label: "Back to Home" },
  ];

  return (
    <div className="relative md:flex h-screen bg-gray-100">
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 
          w-64 bg-blue-900 text-white 
          transform transition-transform duration-300 ease-in-out 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}  md:relative md:translate-x-0 
          md:flex md:flex-col md:transition-all md:duration-300 md:ease-in-out
          ${sidebarOpen ? 'md:w-64' : 'md:w-20'} 
        `}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-blue-800">
          
          {(sidebarOpen) && <h1 className="text-xl font-bold whitespace-nowrap">Admin Panel</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            
            className={`p-2 rounded-md text-white hover:bg-blue-800 ${!sidebarOpen ? 'md:mx-auto' : ''}`}
            aria-label="Toggle sidebar"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="mb-1 px-2">
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-3 text-white rounded-md ${location.pathname === item.path
                    ? 'bg-blue-800 font-semibold'
                    : 'hover:bg-blue-800'
                    } ${!sidebarOpen ? 'justify-center' : ''}`}
                  onClick={() => { if (isMobile) setSidebarOpen(false); }}
                >
                  <FontAwesomeIcon icon={item.icon} className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
                  {sidebarOpen && <span className="whitespace-nowrap text-sm">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button at bottom of sidebar */}
        <div className="p-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center px-3 py-3 text-white rounded-md hover:bg-blue-800 ${!sidebarOpen ? 'justify-center' : ''}`}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : 'mx-auto'}`} />
            {sidebarOpen && <span className="whitespace-nowrap text-sm">Logout</span>}
          </button>
        </div>
      </div>

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out`}>
        <header className="bg-white shadow-sm sticky top-0 z-10 h-16 flex items-center">
          <div className="px-6 w-full">
             <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-200 md:hidden mr-4"
                aria-label="Open sidebar"
             >
                <FontAwesomeIcon icon={faBars} />
             </button>
            
            <h2 className="text-xl font-semibold text-gray-800 inline-block">
              {navItems.find(item => item.path === location.pathname)?.label || "Admin"}
            </h2>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;