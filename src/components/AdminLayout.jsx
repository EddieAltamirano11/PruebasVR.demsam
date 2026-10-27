import React, { useState } from 'react';
import { BiblioLogo } from './BiblioLogo.jsx';
import { UserProfileModal } from './UserProfileModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutGrid,
  BookOpen,
  Ruler,
  Glasses,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export function AdminLayout({ activeTab, onSelectTab, children, onSignOut }) {
  const { user, profile } = useAuth();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = profile?.rol || user?.user_metadata?.rol || 'admin';
  const roleLabel =
    role === 'admin'
      ? 'Administrador'
      : role === 'bibliotecario'
      ? 'Bibliotecario'
      : 'Lector';

  const displayName =
    profile?.nombre_completo ||
    user?.user_metadata?.full_name ||
    'Administrador';

  // Iniciales para el avatar circular (por defecto "AD" de Administrador como en la maqueta)
  const initials =
    user?.email === 'demo@bibliovr.com'
      ? 'AD'
      : displayName
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'AD';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutGrid
    },
    {
      id: 'books',
      label: 'Gestión de Libros',
      icon: BookOpen
    },
    {
      id: 'wireframes',
      label: 'Wireframes VR',
      icon: Ruler
    },
    {
      id: 'vr',
      label: 'Prototipo VR',
      icon: Glasses
    }
  ];

  const getPageTitle = (tab) => {
    switch (tab) {
      case 'dashboard':
        return 'Panel de Control General';
      case 'books':
        return 'Gestión de Libros';
      case 'wireframes':
        return 'Wireframes del Espacio VR';
      case 'vr':
        return 'Prototipo VR del Museo';
      default:
        return 'Panel de Control General';
    }
  };

  const handleTabClick = (tabId) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#F4F6F9] overflow-hidden select-none font-sans text-slate-800">
      {/* ======================================================== */}
      {/* SIDEBAR LATERAL IZQUIERDO (AZUL MARINO #0B1A30)           */}
      {/* ======================================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B1A30] text-white flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Cabecera del Sidebar con Logotipo de Rombo Dorado */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <BiblioLogo size={32} />
            <span className="font-extrabold text-lg tracking-tight text-white">
              BiblioVR <span className="font-medium text-slate-300">Admin</span>
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menú de Navegación Vertical */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150 cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#E5A00D] text-[#0B1A30] shadow-md shadow-amber-500/20'
                    : 'text-white hover:bg-white/10 hover:text-amber-300'
                }`}
              >
                <Icon size={19} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer del Sidebar con botón Cerrar Sesión */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Backdrop para móviles cuando el sidebar está abierto */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* ======================================================== */}
      {/* CONTENIDO PRINCIPAL Y BARRA SUPERIOR                     */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Barra Superior Header */}
        <header className="h-20 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg md:hidden"
              aria-label="Abrir menú"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1A30] tracking-tight">
              {getPageTitle(activeTab)}
            </h2>
          </div>

          {/* Perfil de Usuario Superior Derecho */}
          <div
            onClick={() => setProfileModalOpen(true)}
            className="flex items-center gap-3 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
            title="Ver panel de usuario y registros"
          >
            <span className="text-sm font-medium text-slate-500 hidden sm:inline">
              {roleLabel}
            </span>
            {/* Avatar circular idéntico al de la maqueta ("AD") */}
            <div className="w-9 h-9 rounded-full bg-[#0B1A30] text-[#E5A00D] border-2 border-[#E5A00D]/40 font-black text-xs flex items-center justify-center shadow-xs">
              {initials}
            </div>
          </div>
        </header>

        {/* Área de Visualización con Scroll */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Modal de Perfil y Registro de Actividad */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </div>
  );
}

export default AdminLayout;
