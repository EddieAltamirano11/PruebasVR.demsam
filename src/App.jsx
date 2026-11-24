import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { MuseumScene, CULTURAL_STATIONS } from './components/MuseumScene.jsx';
import { RecommendedBooksPanel } from './components/RecommendedBooksPanel.jsx';
import { CounterCheckoutModal } from './components/CounterCheckoutModal.jsx';
import { AdminLayout } from './components/AdminLayout.jsx';
import { DashboardView } from './views/DashboardView.jsx';
import { BooksManagementView } from './views/BooksManagementView.jsx';
import { LoginView } from './views/LoginView.jsx';
import { ExperienceLandingView } from './views/ExperienceLandingView.jsx';
import { RotateDeviceHint } from './components/RotateDeviceHint.jsx';
import { PointerLockHint } from './components/PointerLockHint.jsx';
import { Tutorial2D } from './components/Tutorial2D.jsx';
import { SoundFX } from './services/audioService.js';
import { requestMotionPermission, MOTION_PERMISSION_DENIED_MESSAGE } from './utils/vrSupport.js';

/**
 * Contenedor principal de la aplicación
 * Integra la experiencia 3D/VR del Museo Wixárika con el Panel Lateral de Libros Recomendados (Sprint 3)
 * y el Portal de Gestión Administrativa BiblioVR.
 */
function AppContent() {
  const { user, signOut } = useAuth();
  // El panel administrativo solo se abre con una sesión real de Supabase (sin modo demo).
  // Limpia la bandera del antiguo modo demo para que no quede guardada en navegadores existentes.
  useEffect(() => {
    try {
      window.sessionStorage?.removeItem('bibliovr_admin_session');
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
  const [landingNotice, setLandingNotice] = useState('');

  // iOS Safari ignora user-scalable=no: bloquear el zoom con pellizco/doble toque de la página,
  // que dejaba la vista ampliada y descentrada (OrbitControls usa pointer events, no se ve afectado)
  useEffect(() => {
    const preventPageZoom = (e) => e.preventDefault();
    document.addEventListener('gesturestart', preventPageZoom, { passive: false });
    document.addEventListener('gesturechange', preventPageZoom, { passive: false });
    document.addEventListener('dblclick', preventPageZoom, { passive: false });
    return () => {
      document.removeEventListener('gesturestart', preventPageZoom);
      document.removeEventListener('gesturechange', preventPageZoom);
      document.removeEventListener('dblclick', preventPageZoom);
    };
  }, []);

  // iOS: desbloquear el audio con el primer toque real (los clics por mirada no cuentan como gesto)
  useEffect(() => {
    const unlockAudio = () => {
      if (SoundFX.unlock()) {
        window.removeEventListener('touchend', unlockAudio, true);
        window.removeEventListener('click', unlockAudio, true);
      }
    };
    window.addEventListener('touchend', unlockAudio, true);
    window.addEventListener('click', unlockAudio, true);
    return () => {
      window.removeEventListener('touchend', unlockAudio, true);
      window.removeEventListener('click', unlockAudio, true);
    };
  }, []);

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
  // Tutorial inicial: se muestra cada vez que se entra a una experiencia (2D en pantalla, VR en 3D)
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const onRecenterRef = useRef(null);
  const onWebXRTriggerRef = useRef(null);

  const isAuthenticated = Boolean(user);

  const handleSignOut = async () => {
    await signOut();
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
  // Entrar a Modo VR. Devuelve { ok, reason } para poder informar al visitante si algo falla.
  const enterVR = useCallback(async () => {
    // 1. iOS 13+ (iPhone/iPad): el permiso de movimiento DEBE pedirse dentro del gesto y antes de
    //    cualquier otro await; sin él no hay seguimiento de cabeza. En Android no aplica.
    const motion = await requestMotionPermission();
    if (motion === 'denied') {
      return { ok: false, reason: 'motion-permission' };
    }

    // 2. Si WebXR nativo está disponible y soportado en el navegador (Chrome Android, Quest, etc.):
    if (navigator.xr && onWebXRTriggerRef.current) {
      try {
        const supported = await navigator.xr.isSessionSupported('immersive-vr');
        if (supported) {
          onWebXRTriggerRef.current();
          return { ok: true, mode: 'webxr' };
        }
      } catch (e) {
        console.warn('WebXR check:', e);
      }
    }

    // 3. Modo visor (Homido Grab / Cardboard): pantalla completa + bloqueo horizontal + estéreo dual.
    //    iPhone no permite pantalla completa ni bloqueo de orientación: se muestra RotateDeviceHint.
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
    return { ok: true, mode: 'stereo' };
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
      setLandingNotice('');
      setTutorialOpen(true);
      if (mode === 'vr') {
        enterVR().then((result) => {
          if (!result?.ok) {
            setExperience(null);
            setLandingNotice(
              result?.reason === 'motion-permission'
                ? MOTION_PERMISSION_DENIED_MESSAGE
                : 'No se pudo iniciar la Experiencia VR. Inténtalo de nuevo.'
            );
          }
        });
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
        <LoginView onBackToMuseum={() => navigateTo('/')} />
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
        showVRTutorial={experience === 'vr' && tutorialOpen}
        onCloseVRTutorial={() => setTutorialOpen(false)}
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
          notice={landingNotice}
        />
      )}

      {/* Modo visor en celular: pedir girar a horizontal (iPhone no permite bloquear la orientación) */}
      {vrMode && <RotateDeviceHint />}

      {/* Experiencia 2D con mouse: aviso de clic para explorar / Esc para mostrar el cursor */}
      {experience !== null && !vrMode && !tutorialOpen && <PointerLockHint />}

      {/* Tutorial inicial de la Experiencia 2D */}
      {experience === '2d' && !vrMode && tutorialOpen && (
        <Tutorial2D onClose={() => setTutorialOpen(false)} />
      )}

      {/* Barra de Controles Superior (No VR) */}
      {experience !== null && !vrMode && (
        <div
          style={{
            position: 'fixed',
            top: 'max(16px, env(safe-area-inset-top))',
            left: 'max(16px, env(safe-area-inset-left))',
            right: 'max(16px, env(safe-area-inset-right))',
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
              <span>Panel Admin</span>
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Volver a ver el tutorial */}
          <button
            onClick={() => setTutorialOpen(true)}
            aria-label="Cómo usar"
            style={{
              height: '40px',
              padding: '0 14px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#f8fafc',
              background: 'rgba(11, 26, 48, 0.90)',
              border: '1px solid rgba(229, 160, 13, 0.8)',
              borderRadius: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
              pointerEvents: 'auto'
            }}
            title="Ver de nuevo cómo explorar el museo"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e5a00d" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            <span className="hidden sm:inline">Cómo usar</span>
          </button>

          {/* Botón para regresar al selector de experiencia (VR / 2D), arriba a la derecha */}
          <button
            onClick={() => setExperience(null)}
            style={{
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: '800',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              color: '#0B1A30',
              background: 'linear-gradient(135deg, #f5b82e 0%, #E5A00D 100%)',
              border: '1px solid #fcd34d',
              borderRadius: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(229, 160, 13, 0.4)',
              pointerEvents: 'auto',
              transition: 'all 0.2s ease'
            }}
            title="Volver al menú principal para elegir Experiencia VR o Experiencia 2D"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              {/* Ícono de casita (Lucide "house") */}
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            <span>Menú principal</span>
          </button>
          </div>
        </div>
      )}

      {/* Boton para salir del modo VR manual (en esquina superior izquierda, libre del boton capacitivo superior derecho del visor Homido Grab) */}
      {vrMode && (
        <button
          data-vr-ui="true"
          onClick={exitVR}
          style={{
            position: 'fixed',
            top: 'max(16px, env(safe-area-inset-top))',
            left: 'max(16px, env(safe-area-inset-left))',
            zIndex: 10002,
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
