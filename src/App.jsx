import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { MuseumScene, CULTURAL_STATIONS } from './components/MuseumScene.jsx';
import { RecommendedBooksPanel } from './components/RecommendedBooksPanel.jsx';
import { CounterCheckoutModal } from './components/CounterCheckoutModal.jsx';
import { getRequestedBooks, subscribeRequestedBooks } from './services/counterCheckoutService.js';
import { AdminLayout } from './components/AdminLayout.jsx';
import { DashboardView } from './views/DashboardView.jsx';
import { BooksManagementView } from './views/BooksManagementView.jsx';
import { LoginView } from './views/LoginView.jsx';
import { ExperienceLandingView } from './views/ExperienceLandingView.jsx';

/**
 * Contenedor principal de la aplicación
 * Integra la experiencia 3D/VR del Museo Wixárika con el Panel Lateral de Libros Recomendados (Sprint 3)
 * y el Portal de Gestión Administrativa BiblioVR.
 */
function AppContent() {
  const { user, signOut } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem('bibliovr_admin_session') === 'true';
      }
    } catch {
      // ignore
    }
    return false;
  });

  const handleSetDemoMode = useCallback((val) => {
    setIsDemoMode(val);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        if (val) {
          window.sessionStorage.setItem('bibliovr_admin_session', 'true');
        } else {
          window.sessionStorage.removeItem('bibliovr_admin_session');
        }
      }
    } catch {
      // ignore
    }
  }, []);
  // Detección segura del endpoint administrativo (/admin o #/admin)
  const checkIsAdminEndpoint = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const path = (window.location.pathname || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    return (
      path === '/admin' ||
      path.startsWith('/admin/') ||
      hash === '#/admin' ||
      hash.startsWith('#/admin') ||
      search.includes('admin')
    );
  }, []);

  const [viewMode, setViewMode] = useState(() => (checkIsAdminEndpoint() ? 'admin' : 'museum'));
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'books'

  // Experiencia elegida por el visitante: null (pantalla de selección) | 'vr' | '2d'.
  // Siempre inicia en null para que la app abra en el selector de experiencia.
  const [experience, setExperience] = useState(null);

  const navigateTo = useCallback((target) => {
    if (target === 'museum' || target === '/') {
      const cleanPath = (window.location.pathname || '').replace(/\/admin.*$/i, '') || '/';
      window.history.pushState(null, '', cleanPath);
      if (window.location.hash.toLowerCase().includes('admin')) {
        window.location.hash = '';
      }
      setViewMode('museum');
      setExperience(null); // Al volver al museo siempre se muestra el selector de experiencia
    } else if (target === 'admin' || target === '/admin') {
      window.history.pushState(null, '', '/admin');
      setViewMode('admin');
    }
  }, []);

  // Sincronización reactiva con URL del navegador (popstate y hashchange)
  useEffect(() => {
    const handleUrlSync = () => {
      const isAdmin = checkIsAdminEndpoint();
      setViewMode(isAdmin ? 'admin' : 'museum');
      if (!isAdmin) setExperience(null);
    };

    window.addEventListener('popstate', handleUrlSync);
    window.addEventListener('hashchange', handleUrlSync);
    return () => {
      window.removeEventListener('popstate', handleUrlSync);
      window.removeEventListener('hashchange', handleUrlSync);
    };
  }, [checkIsAdminEndpoint]);

  // Estados de la experiencia 3D y VR
  const [vrMode, setVrMode] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [activeStation, setActiveStation] = useState(null);
  const [isBooksOpen, setIsBooksOpen] = useState(false);
  const [autoOpenOnFocus] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [requestedCount, setRequestedCount] = useState(() => getRequestedBooks().length);

  useEffect(() => {
    const unsub = subscribeRequestedBooks((list) => {
      setRequestedCount(list.length);
    });
    return () => unsub();
  }, []);

  const onRecenterRef = useRef(null);
  const onWebXRTriggerRef = useRef(null);

  const isAuthenticated = Boolean(user) || isDemoMode;

  const handleSignOut = async () => {
    handleSetDemoMode(false);
    if (!isDemoMode) {
      await signOut();
    }
    setActiveTab('dashboard');
    navigateTo('/');
  };

  // Manejador cuando cambia la estación enfocada en 3D
  const handleStationChange = useCallback(
    (station) => {
      setActiveStation(station);
      if (station && autoOpenOnFocus && !vrMode) {
        setIsBooksOpen(true);
      }
    },
    [autoOpenOnFocus, vrMode]
  );

  // Manejador para abrir panel de recomendaciones (desde botón 3D de la tarjeta)
  const handleOpenBooksPanel = useCallback((station) => {
    if (station) {
      setActiveStation(station);
    }
    setIsBooksOpen(true);
  }, []);

  // Entrar a Modo VR (WebXR nativo o fallback estereoscópico móvil)
  const enterVR = useCallback(async () => {
    // 1. Si WebXR nativo está disponible y soportado en el navegador:
    if (navigator.xr && onWebXRTriggerRef.current) {
      try {
        const supported = await navigator.xr.isSessionSupported('immersive-vr');
        if (supported) {
          onWebXRTriggerRef.current();
          return;
        }
      } catch (e) {
        console.warn('WebXR check:', e);
      }
    }

    // 2. Fallback móvil (Homido Grab / Cardboard): Permisos de sensores en iOS si aplica
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        await DeviceOrientationEvent.requestPermission();
      } catch (err) {
        console.warn('Permisos sensor iOS:', err);
      }
    }

    // 3. Activar modo pantalla completa + bloqueo horizontal + estereoscopía dual
    setVrMode(true);
    const el = document.documentElement;
    const rfs =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;
    if (rfs) {
      Promise.resolve(rfs.call(el))
        .then(() => {
          if (window.screen?.orientation?.lock) {
            window.screen.orientation.lock('landscape').catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, []);

  // Si una sesión WebXR inmersiva termina desde el visor, regresar también al selector
  const prevVrModeRef = useRef(vrMode);
  useEffect(() => {
    if (prevVrModeRef.current && !vrMode && experience === 'vr') {
      setExperience(null);
    }
    prevVrModeRef.current = vrMode;
  }, [vrMode, experience]);

  const exitVR = useCallback(() => {
    setVrMode(false);
    setExperience(null); // Al salir de VR se regresa al selector de experiencia
    const efs =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen;
    if (efs && (document.fullscreenElement || document.webkitFullscreenElement)) {
      efs.call(document);
    }
  }, []);

  // Selección de experiencia desde la pantalla de inicio o desde el panel admin
  const handleSelectExperience = useCallback(
    (mode) => {
      setExperience(mode);
      if (mode === 'vr') {
        enterVR();
      } else {
        setVrMode(false);
      }
    },
    [enterVR]
  );

  // Desde el panel admin: abrir el museo directamente en la experiencia elegida
  const handleLaunchExperienceFromAdmin = useCallback(
    (mode) => {
      navigateTo('/');
      handleSelectExperience(mode);
    },
    [navigateTo, handleSelectExperience]
  );

  // Si el usuario accede al endpoint administrativo (/admin o #/admin):
  if (viewMode === 'admin') {
    if (!isAuthenticated) {
      return (
        <LoginView
          onBypassDemo={() => handleSetDemoMode(true)}
          onBackToMuseum={() => navigateTo('/')}
        />
      );
    }

    return (
      <AdminLayout
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
        }}
        onSignOut={handleSignOut}
        onLaunchExperience={handleLaunchExperienceFromAdmin}
      >
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => setActiveTab(tab)}
            onLaunchExperience={handleLaunchExperienceFromAdmin}
          />
        )}
        {activeTab === 'books' && <BooksManagementView />}
      </AdminLayout>
    );
  }

  // Vista principal: Museo Virtual Wixárika 3D con Panel Lateral de Libros Recomendados (Sprint 3)
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Escena 3D del Museo Wixarika */}
      <MuseumScene
        vrMode={vrMode}
        setVrMode={setVrMode}
        onWebXRTriggerRef={onWebXRTriggerRef}
        onRecenterRef={onRecenterRef}
        showButtons={showButtons}
        setShowButtons={setShowButtons}
        activeStation={activeStation}
        onActiveStationChange={handleStationChange}
        onOpenBooksPanel={handleOpenBooksPanel}
        isBooksOpen={isBooksOpen}
        onToggleBooksOpen={setIsBooksOpen}
      />

      {/* Panel Lateral de Libros Recomendados (Sprint 3) */}
      <RecommendedBooksPanel
        isOpen={isBooksOpen}
        onClose={() => setIsBooksOpen(false)}
        activeStation={activeStation}
        allStations={CULTURAL_STATIONS}
        onSelectStation={handleStationChange}
        autoOpenOnFocus={autoOpenOnFocus}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Pantalla de Salida con Resumen de Libros para Pedir en Mostrador (Sprint 5 - Luis Carlos Durán) */}
      <CounterCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onFinishVisit={() => {
          setIsCheckoutOpen(false);
          setIsBooksOpen(false);
        }}
      />

      {/* Pantalla de inicio: selector de experiencia VR / 2D (la escena 3D se precarga detrás) */}
      {experience === null && !vrMode && (
        <ExperienceLandingView
          onSelectExperience={handleSelectExperience}
          onLogin={() => navigateTo('/admin')}
          isAuthenticated={isAuthenticated}
        />
      )}

      {/* Barra de Controles Superior (No VR) */}
      {experience !== null && !vrMode && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            right: '16px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'none'
          }}
        >
          {/* El botón de administración se encuentra protegido y oculto para el público general.
              Solamente se muestra este acceso directo al panel cuando el administrador ya ha iniciado sesión previamente. */}
          {isAuthenticated ? (
            <button
              onClick={() => navigateTo('/admin')}
              style={{
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: '700',
                color: '#f8fafc',
                background: 'rgba(11, 26, 48, 0.90)',
                border: '1px solid rgba(229, 160, 13, 0.8)',
                borderRadius: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(8px)',
                pointerEvents: 'auto',
                transition: 'all 0.2s ease'
              }}
              title="Volver al Panel de Administración (/admin)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e5a00d" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5"/>
                <path d="m12 19-7-7 7-7"/>
              </svg>
              <span>← Panel Admin</span>
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
            {/* Botón: Pantalla de salida con resumen de libros para pedir en mostrador (Sprint 5) */}
            <button
              onClick={() => setIsCheckoutOpen(true)}
              style={{
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: '700',
                color: requestedCount > 0 ? '#0B1A30' : '#f8fafc',
                background: requestedCount > 0 ? '#E5A00D' : 'rgba(11, 26, 48, 0.85)',
                border: requestedCount > 0 ? '1px solid #f59e0b' : '1px solid rgba(229, 160, 13, 0.6)',
                borderRadius: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: requestedCount > 0 ? '0 4px 14px rgba(229, 160, 13, 0.4)' : '0 4px 14px rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease'
              }}
              title="Abrir resumen de libros para pedir en mostrador"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                <path d="M6 6h10"/>
                <path d="M6 10h10"/>
              </svg>
              <span>{requestedCount > 0 ? `Mostrador (${requestedCount})` : 'Pedir en Mostrador'}</span>
            </button>

            {/* Botón de recentrar orientación */}
            <button
              onClick={() => onRecenterRef.current?.()}
              style={{
                padding: '9px 14px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#cbd5e1',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(148, 163, 184, 0.3)',
                borderRadius: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(8px)'
              }}
              title="Recentrar orientación"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="22" y1="12" x2="18" y2="12" />
                <line x1="6" y1="12" x2="2" y2="12" />
                <line x1="12" y1="6" x2="12" y2="2" />
                <line x1="12" y1="22" x2="12" y2="18" />
              </svg>
              <span>Recentrar</span>
            </button>
          </div>
        </div>
      )}

      {/* Barra de Controles Inferior (Abajo) */}
      {experience !== null && !vrMode && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            pointerEvents: 'auto'
          }}
        >
          {/* Botón para regresar al selector de experiencia (VR / 2D) */}
          <button
            onClick={() => setExperience(null)}
            style={{
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: '700',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#0B1A30',
              background: 'linear-gradient(135deg, #f5b82e 0%, #E5A00D 100%)',
              border: '2px solid #fcd34d',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(229, 160, 13, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
            title="Elegir entre Experiencia VR y Experiencia 2D"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 3h5v5" />
              <path d="M4 20 21 3" />
              <path d="M21 16v5h-5" />
              <path d="m15 15 6 6" />
              <path d="M4 4l5 5" />
            </svg>
            Cambiar experiencia
          </button>
        </div>
      )}

      {/* Boton para salir del modo VR manual (en esquina superior izquierda, libre del boton capacitivo superior derecho del visor Homido Grab) */}
      {vrMode && (
        <button
          data-vr-ui="true"
          onClick={exitVR}
          style={{
            position: 'fixed',
            top: '16px',
            left: '16px',
            zIndex: 10000,
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#e2e8f0',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '20px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
          Salir de VR
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
