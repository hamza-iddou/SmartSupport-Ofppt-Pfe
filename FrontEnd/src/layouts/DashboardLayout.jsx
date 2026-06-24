import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Settings, 
  LogOut, 
  PlusCircle,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const DashboardLayout = () => {
  const { logout, workspace, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Tickets', path: '/tickets', icon: Ticket },
    { name: 'Members', path: '/members', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}

      

      
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-slate-950 text-white transform transition-transform duration-300 ease-in-out border-r border-slate-800
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">S</div>
            <h1 className="text-xl font-bold tracking-tight">SmartSupport</h1>
          </div>

          <div className="px-6 mb-6">
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Workspace</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold border border-blue-500/20">
                  {workspace?.name?.charAt(0) || 'W'}
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold truncate">{workspace?.name || 'Loading...'}</p>
                  <button 
                    onClick={() => navigate('/workspaces')}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    Switch Workspace
                  </button>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-6">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <button 
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 px-4 hidden sm:block">
            {/* Search placeholder */}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-gray-900">{isAdmin ? 'Admin' : 'Member'}</span>
              <span className="text-xs text-gray-500">Connected</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold border border-gray-200">
              {workspace?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
