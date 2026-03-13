import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Calendar, LogOut,
  Menu, X, ChevronRight, Settings, Scissors, TrendingUp, Clock, Users, UserCog, ExternalLink,
  Sun, Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const NAV = [
  { to: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, end: true, adminOnly: true },
  { to: '/admin/citas',      label: 'Citas',       icon: CalendarDays                               },
  { to: '/admin/clientas',   label: 'Clientas',    icon: Users                                      },
  { to: '/admin/calendario', label: 'Calendario',  icon: Calendar                                   },
  { to: '/admin/servicios',  label: 'Servicios',   icon: Scissors,        adminOnly: true           },
  { to: '/admin/ingresos',   label: 'Ingresos',    icon: TrendingUp,      adminOnly: true           },
  { to: '/admin/horario',    label: 'Horario',     icon: Clock,           adminOnly: true           },
  { to: '/admin/usuarios',   label: 'Usuarios',    icon: UserCog,         adminOnly: true           },
  { to: '/admin/settings',   label: 'Ajustes',     icon: Settings,        superAdminOnly: true      },
];

export default function AdminLayout() {
  const { profile, isAdmin, isSuperAdmin, signOut } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`flex flex-col bg-white dark:bg-gray-800 border-r border-pink-100 dark:border-gray-700 ${mobile ? 'w-72' : 'w-64'} h-full`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-pink-50 dark:border-gray-700">
        <img src="/logo.png" alt="Luga Gy" className="h-10 w-auto object-contain" />
        <span className="font-poppins text-[10px] text-gray-400 dark:text-gray-500 tracking-widest uppercase">Admin</span>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.filter(item => {
          if (item.superAdminOnly) return isSuperAdmin;
          if (item.adminOnly) return isAdmin;
          return true;
        }).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl font-poppins text-sm transition-all duration-150 cursor-pointer group ${
                isActive
                  ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-pink-50/60 dark:hover:bg-gray-700 hover:text-pink-500 dark:hover:text-pink-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-pink-500 dark:text-pink-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-pink-400'} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-pink-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Ver sitio web */}
      <div className="px-3 pb-2">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-poppins text-sm text-gray-400 dark:text-gray-500 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-50/60 dark:hover:bg-gray-700 transition-all duration-150 cursor-pointer group"
        >
          <ExternalLink size={18} className="text-gray-400 dark:text-gray-500 group-hover:text-pink-400 shrink-0" />
          <span className="flex-1">Ver sitio web</span>
        </a>
      </div>

      {/* User + Theme toggle */}
      <div className="px-4 py-4 border-t border-pink-50 dark:border-gray-700">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shrink-0">
            <span className="font-poppins text-xs font-bold text-pink-600 dark:text-pink-400">
              {profile?.nombre?.[0]?.toUpperCase() ?? 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-poppins text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{profile?.nombre ?? 'Admin'}</p>
            <p className="font-poppins text-xs text-pink-400 capitalize">{profile?.rol}</p>
          </div>
          <button
            onClick={toggle}
            title={dark ? 'Modo claro' : 'Modo oscuro'}
            className="text-gray-400 dark:text-gray-500 hover:text-pink-500 dark:hover:text-pink-400 transition-colors cursor-pointer shrink-0 mr-1"
          >
            {dark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={handleSignOut}
            title="Cerrar sesión"
            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:shrink-0 h-full">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative h-full flex">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border-b border-pink-100 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 dark:text-gray-400 hover:text-pink-500 transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <span className="font-great-vibes text-2xl text-pink-500 leading-none">Luga Gy</span>
          <div className="ml-auto">
            <button
              onClick={toggle}
              title={dark ? 'Modo claro' : 'Modo oscuro'}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
