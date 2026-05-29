import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⊞", path: "/painel" },
  { id: "vehicles", label: "Veículos", icon: "◈", path: "/veiculos" },
  { id: "services", label: "Serviços", icon: "⚙", path: "/servicos" },
  { id: "owners", label: "Proprietários", icon: "◉", path: "/proprietarios" },
  { id: "collaborators", label: "Colaboradores", icon: "👤", path: "/colaboradores" },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const userEmail = user?.email || 'admin@bigsom.com';
  const userInitials = userEmail.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
    } catch (err) {
      console.error("Erro ao sair:", err);
    }
  };

  return (
    <>
      {/* Backdrop para mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`min-h-screen bg-[#080808] border-r border-neutral-900 transition-all duration-300 flex flex-col fixed top-0 left-0 z-48 overflow-hidden 
          lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          ${collapsed ? 'lg:w-16' : 'lg:w-[230px]'} w-[230px]`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-neutral-900 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white flex-shrink-0 flex items-center justify-center font-black text-sm text-black tracking-tighter">
            BS
          </div>
          <div className={`flex-1 ${collapsed ? 'lg:hidden' : 'block'}`}>
            <div className="text-white font-bold text-sm tracking-wider">BIGSOM</div>
            <div className="text-neutral-650 text-[9px] tracking-widest uppercase">Oficina</div>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block ml-auto text-neutral-600 hover:text-neutral-400 cursor-pointer text-lg flex-shrink-0"
          >
            ≡
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto text-neutral-600 hover:text-neutral-400 cursor-pointer text-xl flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map(item => {
            const isVehiclesTabActive = item.id === 'vehicles' && location.pathname.startsWith('/veiculos');
            
            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-xs transition-all duration-150 text-left ${
                  isActive || isVehiclesTabActive
                    ? 'bg-neutral-950 border-neutral-800 text-white'
                    : 'bg-transparent border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50'
                }`}
              >
                <span className="text-sm flex-shrink-0 w-5 text-center">{item.icon}</span>
                <span className={`whitespace-nowrap font-medium ${collapsed ? 'lg:hidden' : 'block'}`}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User info & Signout */}
        <div className="p-3 border-t border-neutral-900">
          <div className={`flex items-center justify-between gap-2 ${collapsed ? 'lg:hidden' : 'flex'}`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 text-xs font-semibold flex-shrink-0">
                {userInitials}
              </div>
              <div className="overflow-hidden">
                <div className="text-neutral-300 text-xs font-semibold truncate">Admin</div>
                <div className="text-neutral-650 text-[10px] truncate">{userEmail}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-neutral-600 hover:text-red-400 cursor-pointer text-sm p-1 rounded hover:bg-neutral-900 transition-colors"
              title="Sair"
            >
              ⎋
            </button>
          </div>

          {collapsed && (
            <div className="hidden lg:flex lg:justify-center">
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-red-400 transition-colors text-xs font-semibold"
                title="Sair"
              >
                ⎋
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
