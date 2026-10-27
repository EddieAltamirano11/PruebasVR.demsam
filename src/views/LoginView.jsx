import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BiblioLogo } from '../components/BiblioLogo';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

export function LoginView({ onBypassDemo }) {
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'email-sent'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else if (mode === 'register') {
        await signUp(email, password, fullName);
        setMode('email-sent');
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg(
          'Enlace de recuperación enviado. Revisa tu bandeja de entrada o spam en Gmail.'
        );
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('Email not confirmed')) {
        setErrorMsg('Debes confirmar tu correo en Gmail antes de iniciar sesión.');
      } else if (msg.includes('Invalid login credentials')) {
        setErrorMsg('Correo o contraseña incorrectos.');
      } else if (msg.includes('User already registered')) {
        setErrorMsg('Este correo ya está registrado. Intenta iniciar sesión.');
      } else {
        setErrorMsg(msg || 'Error al conectar con el servicio de autenticación.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0B1A30] relative overflow-hidden select-none">
      {/* Círculos de luz ambiental decorativos */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#E5A00D]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#4A0E0E]/20 blur-3xl pointer-events-none" />

      {/* Tarjeta Central de Autenticación */}
      <div className="relative w-full max-w-md bg-[#0F223D] border border-slate-700/60 rounded-2xl p-8 shadow-2xl text-slate-100 z-10">
        {/* Barra superior dorada */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#E5A00D] rounded-t-2xl" />

        {/* Logotipo y Título de Marca */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="mb-3 p-2 rounded-2xl bg-[#0B1A30] border border-[#E5A00D]/30 shadow-md">
            <BiblioLogo size={42} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            BiblioVR <span className="text-[#E5A00D]">Admin</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de Biblioteca, Acervo Cultural & Experiencias VR
          </p>
        </div>

        {/* PANTALLA: CORREO DE CONFIRMACIÓN ENVIADO */}
        {mode === 'email-sent' ? (
          <div className="text-center py-4 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-lg font-bold text-[#E5A00D]">¡Confirma tu Cuenta!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hemos enviado un correo de activación a: <br />
              <strong className="text-white text-sm">{email}</strong>
            </p>

            <div className="p-3.5 rounded-xl bg-[#0B1A30] border border-slate-700 text-xs text-slate-300 text-left space-y-1">
              <strong className="text-[#E5A00D]">Pasos siguientes:</strong>
              <ol className="list-decimal ml-4 space-y-1 text-slate-400">
                <li>Abre tu bandeja de entrada en <strong className="text-slate-200">Gmail</strong>.</li>
                <li>Busca el correo de confirmación de BiblioVR.</li>
                <li>Haz clic en el enlace para habilitar tu acceso.</li>
              </ol>
            </div>

            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className="w-full py-2.5 px-4 font-bold text-[#0B1A30] bg-[#E5A00D] hover:bg-amber-400 rounded-xl transition-all cursor-pointer shadow-md"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        ) : (
          <>
            {/* SELECTOR DE MODO: LOGIN / REGISTRO */}
            {mode !== 'forgot' && (
              <div className="flex rounded-xl bg-[#0B1A30] p-1 mb-5 border border-slate-700/60">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-[#E5A00D] text-[#0B1A30] shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    mode === 'register'
                      ? 'bg-[#E5A00D] text-[#0B1A30] shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>
            )}

            {/* AVISOS DE ERROR O ÉXITO */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 mb-4 text-xs text-rose-300 bg-rose-950/70 border border-rose-800/80 rounded-xl">
                <AlertCircle size={15} className="shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 p-3 mb-4 text-xs text-emerald-300 bg-emerald-950/70 border border-emerald-800/80 rounded-xl">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Mateo Morales"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#0B1A30] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E5A00D] transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="usuario@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-[#0B1A30] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E5A00D] transition-colors"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Contraseña
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMsg('');
                          setSuccessMsg('');
                        }}
                        className="text-xs text-[#E5A00D] hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-[#0B1A30] border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E5A00D] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 flex items-center justify-center gap-2 font-bold text-[#0B1A30] bg-[#E5A00D] hover:bg-amber-400 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all cursor-pointer text-xs uppercase tracking-wider"
              >
                <span>
                  {loading
                    ? 'Procesando...'
                    : mode === 'login'
                    ? 'Ingresar al Sistema'
                    : mode === 'register'
                    ? 'Crear Cuenta y Recibir Correo'
                    : 'Enviar Enlace de Recuperación'}
                </span>
                {!loading && <ArrowRight size={15} />}
              </button>
            </form>

            {/* Botón Volver de 'forgot' */}
            {mode === 'forgot' && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  ← Volver a Iniciar Sesión
                </button>
              </div>
            )}

            {/* MODO ACCESO RÁPIDO / DEMO */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={onBypassDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-[#E5A00D] hover:bg-[#0B1A30] border border-slate-700/60 transition-all cursor-pointer"
              >
                <ShieldCheck size={14} className="text-[#E5A00D]" />
                <span>Explorar Panel como Administrador Demo</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginView;
