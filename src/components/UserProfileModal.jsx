import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  User,
  ShieldCheck,
  BookOpen,
  LogOut,
  CheckCircle2,
  Clock,
  Key,
  Activity,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export function UserProfileModal({ isOpen, onClose }) {
  const { user, profile, signOut } = useAuth();

  if (!isOpen || !user) return null;

  const role = profile?.rol || user?.user_metadata?.rol || 'lector';
  const displayName =
    profile?.nombre_completo ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Usuario';

  const isEmailConfirmed = Boolean(user?.email_confirmed_at);

  const getRoleConfig = (rol) => {
    switch (rol) {
      case 'admin':
        return {
          title: 'Administrador General',
          badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          borderColor: 'border-amber-500/40',
          icon: ShieldCheck,
          description:
            'Acceso total al sistema, configuración de seguridad, gestión de personal y supervisión de registros.',
          privileges: [
            'Gestión de usuarios y asignación de roles',
            'Configuración general y auditoría de eventos',
            'Acceso administrativo a Storage y Base de Datos'
          ]
        };
      case 'bibliotecario':
        return {
          title: 'Bibliotecario / Personal',
          badgeColor: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
          borderColor: 'border-sky-500/40',
          icon: BookOpen,
          description:
            'Control de acervo bibliográfico, registro de préstamos y consulta de actividad en biblioteca.',
          privileges: [
            'Registro y actualización de catálogo de libros',
            'Gestión de recursos digitales y modelos 3D',
            'Control de préstamos a usuarios lectores'
          ]
        };
      default:
        return {
          title: 'Lector Registrado',
          badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          borderColor: 'border-emerald-500/40',
          icon: User,
          description:
            'Acceso a consulta de catálogo cultural, lectura digital y experiencias inmersivas WebXR.',
          privileges: [
            'Exploración de la sala inmersiva y acervo 3D',
            'Consulta de material cultural Wixárika y Cora',
            'Historial personal de lectura'
          ]
        };
    }
  };

  const roleConfig = getRoleConfig(role);
  const RoleIcon = roleConfig.icon;

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'N/A';

  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Activa ahora';

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg p-6 sm:p-7 overflow-hidden rounded-2xl bg-slate-900/95 border border-sky-500/30 shadow-2xl shadow-sky-500/10 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior con gradiente de acento */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-amber-400 to-emerald-400" />

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>

        {/* ENCABEZADO */}
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">
              Panel de Usuario & Control
            </h2>
            <p className="text-xs text-slate-400">
              Biblioteca Pública Profesor Solón Argüello
            </p>
          </div>
        </div>

        {/* TARJETA DE PERFIL */}
        <div className="p-4 mb-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/30 to-slate-800 border border-sky-400/30 flex items-center justify-center text-sky-300 font-bold text-lg shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 className="text-sm font-semibold text-white truncate">
                {displayName}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${roleConfig.badgeColor}`}
              >
                <RoleIcon size={12} />
                {roleConfig.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>

            <div className="mt-2 flex items-center gap-3 text-[11px]">
              {isEmailConfirmed ? (
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 size={12} />
                  Correo verificado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-400">
                  <AlertCircle size={12} />
                  Verificación pendiente
                </span>
              )}
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock size={11} /> Registro: {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* DETALLE DEL ROL Y PRIVILEGIOS */}
        <div className="mb-4 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-1.5">
            <Key size={13} className="text-sky-400" />
            <span>Permisos asignados al rol ({role.toUpperCase()})</span>
          </div>
          <p className="text-xs text-slate-400 mb-2 leading-relaxed">
            {roleConfig.description}
          </p>
          <ul className="space-y-1 text-xs text-slate-300">
            {roleConfig.privileges.map((privilege, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                <span>{privilege}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* LOG DE SESIÓN / TRABAJADORES */}
        <div className="mb-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-300 font-sans font-semibold mb-1">
            <Activity size={12} className="text-emerald-400" />
            <span>Log de Sesión Activa</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">ID Usuario:</span>
            <span className="text-slate-300 truncate max-w-[200px]" title={user.id}>
              {user.id}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Último Ingreso:</span>
            <span className="text-slate-300">{lastSignIn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Servicio Auth:</span>
            <span className="text-emerald-400">Supabase Cloud (Online)</span>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 hover:border-rose-700 transition-all cursor-pointer"
          >
            <LogOut size={14} />
            <span>Cerrar Sesión</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-sky-400 hover:bg-sky-300 transition-all cursor-pointer shadow-md shadow-sky-500/20"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;
