import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Sparkles, CheckCircle2, AlertCircle, ArrowRight, X } from 'lucide-react';

export function AuthModal({ isOpen, onClose }) {
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'email-sent'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        onClose();
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
        setErrorMsg(msg || 'Ocurrió un error inesperado al procesar la solicitud.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md p-7 overflow-hidden rounded-2xl bg-slate-900/95 border border-sky-500/30 shadow-2xl shadow-sky-500/10 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior dorada */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#E5A00D]" />

        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {/* PANTALLA: CORREO ENVIADO */}
        {mode === 'email-sent' ? (
          <div className="text-center py-4 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-bold text-[#E5A00D]">¡Confirma tu cuenta!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hemos enviado un enlace de confirmación a: <br />
              <strong className="text-amber-300 text-sm font-semibold">{email}</strong>
            </p>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-400 text-left space-y-1">
              <strong className="text-slate-200">Pasos para activar tu acceso:</strong>
              <ol className="list-decimal ml-4 space-y-0.5">
                <li>Abre tu bandeja de entrada de <strong>Gmail</strong>.</li>
                <li>Busca el correo de confirmación de BiblioVR.</li>
                <li>Haz clic en el enlace para activar tu cuenta.</li>
              </ol>
            </div>

            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className="w-full py-2.5 px-4 font-bold text-[#0B1A30] bg-[#E5A00D] hover:bg-amber-400 rounded-xl transition-all cursor-pointer"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        ) : (
          <>
            {/* ENCABEZADO */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mb-2 text-xs font-semibold text-[#E5A00D] bg-[#E5A00D]/10 border border-[#E5A00D]/20 rounded-full">
                <Sparkles size={12} />
                <span>BiblioVR Admin</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'login' && 'Iniciar Sesión'}
                {mode === 'register' && 'Crear Cuenta'}
                {mode === 'forgot' && 'Recuperar Contraseña'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'login' && 'Ingresa para acceder al Panel de Control General'}
                {mode === 'register' && 'Regístrate para recibir tu correo de confirmación'}
                {mode === 'forgot' && 'Ingresa tu correo para recibir las instrucciones'}
              </p>
            </div>

            {/* ALERTAS */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 mb-3 text-xs text-rose-300 bg-rose-950/60 border border-rose-800/60 rounded-xl">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 p-2.5 mb-3 text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-800/60 rounded-xl">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nombre Completo</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Mateo Morales"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Correo Electrónico (Gmail)</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="usuario@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-300">Contraseña</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot');
                          setErrorMsg('');
                          setSuccessMsg('');
                        }}
                        className="text-xs text-sky-400 hover:underline"
                      >
                        ¿La olvidaste?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 flex items-center justify-center gap-2 font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 rounded-xl shadow-lg shadow-sky-500/20 disabled:opacity-50 transition-all cursor-pointer text-xs uppercase tracking-wide"
              >
                <span>
                  {loading
                    ? 'Procesando...'
                    : mode === 'login'
                    ? 'Entrar'
                    : mode === 'register'
                    ? 'Registrarme'
                    : 'Enviar Enlace'}
                </span>
                {!loading && <ArrowRight size={14} />}
              </button>
            </form>

            {/* SELECTOR ENTRE LOGIN / REGISTRO */}
            <div className="mt-4 pt-3 text-center border-t border-slate-800 text-xs text-slate-400">
              {mode === 'login' ? (
                <p>
                  ¿No tienes cuenta?{' '}
                  <button
                    onClick={() => {
                      setMode('register');
                      setErrorMsg('');
                    }}
                    className="text-sky-400 font-semibold hover:underline"
                  >
                    Regístrate aquí
                  </button>
                </p>
              ) : (
                <p>
                  ¿Ya tienes cuenta?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setErrorMsg('');
                    }}
                    className="text-sky-400 font-semibold hover:underline"
                  >
                    Inicia sesión
                  </button>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
