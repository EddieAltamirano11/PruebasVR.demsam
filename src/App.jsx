import React, { useState, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { MuseumScene } from './components/MuseumScene.jsx';
import { RecommendedBooksPanel } from './components/RecommendedBooksPanel.jsx';
import { AdminLayout } from './components/AdminLayout.jsx';
import { DashboardView } from './views/DashboardView.jsx';
import { BooksManagementView } from './views/BooksManagementView.jsx';
import { WireframesView } from './views/WireframesView.jsx';
import { VRPrototypeView } from './views/VRPrototypeView.jsx';
import { LoginView } from './views/LoginView.jsx';

/**
 * Contenedor principal de la aplicación
 * Integra la experiencia 3D/VR del Museo Wixárika con el Panel Lateral de Libros Recomendados (Sprint 3)
 * y el Portal de Gestión Administrativa BiblioVR.
 */
function AppContent() {
  const { user, signOut } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [viewMode, setViewMode] = useState('museum'); // 'museum' | 'admin'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'books' | 'wireframes' | 'vr'

  // Estados de la experiencia 3D y VR
  const [vrMode, setVrMode] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const [activeStation, setActiveStation] = useState(null);
  const [isBooksOpen, setIsBooksOpen] = useState(false);
  const [autoOpenOnFocus] = useState(false);

  const onRecenterRef = useRef(null);
  const onWebXRTriggerRef = useRef(null);

  const isAuthenticated = Boolean(user) || isDemoMode;

  const handleSignOut = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
    } else {
      await signOut();
    }
    setActiveTab('dashboard');
    setViewMode('museum');
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

  const exitVR = useCallback(() => {
    setVrMode(false);
    const efs =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen;
    if (efs && (document.fullscreenElement || document.webkitFullscreenElement)) {
      efs.call(document);
    }
  }, []);

  // Si el usuario decide entrar a la vista administrativa de BiblioVR:
  if (viewMode === 'admin') {
    if (!isAuthenticated) {
      return (
        <LoginView
          onBypassDemo={() => setIsDemoMode(true)}
          onBackToMuseum={() => setViewMode('museum')}
        />
      );
    }

    return (
      <AdminLayout
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'vr') {
            setViewMode('museum');
          } else {
            setActiveTab(tab);
          }
        }}
        onSignOut={handleSignOut}
      >
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={(tab) => {
              if (tab === 'vr') setViewMode('museum');
              else setActiveTab(tab);
            }}
          />
        )}
        {activeTab === 'books' && <BooksManagementView />}
        {activeTab === 'wireframes' && <WireframesView />}
        {activeTab === 'vr' && (
          <VRPrototypeView onBackToDashboard={() => setActiveTab('dashboard')} />
        )}
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
      />

      {/* Panel Lateral Interactivo de Libros Recomendados en la Escena (Sprint 3 - Luis Carlos Durán Ocampo) */}
      <RecommendedBooksPanel
        isOpen={isBooksOpen && !vrMode}
        onClose={() => setIsBooksOpen(false)}
        activeStation={activeStation}
      />

      {/* Barra de Controles Superior (No VR) */}
      {!vrMode && (
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
          {/* Botón para acceder al Panel de Administración BiblioVR */}
          <button
            onClick={() => setViewMode('admin')}
            style={{
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#f8fafc',
              background: 'rgba(11, 26, 48, 0.85)',
              border: '1px solid rgba(229, 160, 13, 0.6)',
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
            title="Abrir Panel de Gestión BiblioVR (Dashboard, Libros, Wireframes)"
          >
            <span style={{ fontSize: '15px' }}>🏛️</span>
            <span>Panel BiblioVR</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
            {/* Botón en la escena para alternar el Panel Lateral de Libros (Sprint 3) */}
            <button
              onClick={() => setIsBooksOpen((prev) => !prev)}
              style={{
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: '700',
                color: isBooksOpen ? '#0f172a' : '#fde047',
                background: isBooksOpen
                  ? '#e5a00d'
                  : 'rgba(11, 26, 48, 0.85)',
                border: isBooksOpen ? '1px solid #fde047' : '1px solid rgba(229, 160, 13, 0.6)',
                borderRadius: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease'
              }}
              title="Panel lateral interactivo de Libros Recomendados en la escena (Sprint 3)"
            >
              <span>📖</span>
              <span>Libros Recomendados</span>
              {activeStation && (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    display: 'inline-block'
                  }}
                  title="Elemento activo enfocado"
                />
              )}
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

      {/* Pestaña lateral derecha cuando el panel está cerrado */}
      {!vrMode && !isBooksOpen && (
        <button
          onClick={() => setIsBooksOpen(true)}
          style={{
            position: 'fixed',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 14px 12px 12px',
            background: 'linear-gradient(135deg, #0b1a30 0%, #172554 100%)',
            color: '#fde047',
            borderTopLeftRadius: '16px',
            borderBottomLeftRadius: '16px',
            border: '1px solid rgba(229, 160, 13, 0.5)',
            borderRight: 'none',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.45)',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            letterSpacing: '1px',
            fontSize: '12px',
            fontWeight: '700'
          }}
          title="Abrir Libros Recomendados"
          aria-label="Abrir panel de libros recomendados"
        >
          <span style={{ transform: 'rotate(90deg)', display: 'inline-block', marginBottom: '4px' }}>📖</span>
          <span>Libros Recomendados</span>
        </button>
      )}

      {/* Barra de Controles Inferior (Abajo) */}
      {!vrMode && (
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
          {/* Boton para Ocultar / Mostrar Botones Abajo */}
          <button
            onClick={() => setShowButtons(!showButtons)}
            style={{
              padding: '12px 22px',
              fontSize: '14px',
              fontWeight: '700',
              letterSpacing: '0.5px',
              color: showButtons ? '#fde047' : '#ffffff',
              background: showButtons
                ? 'rgba(7, 10, 20, 0.90)'
                : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              border: showButtons ? '2px solid #f59e0b' : '2px solid #fde047',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5), 0 0 12px rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              outline: 'none',
              backdropFilter: 'blur(6px)'
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {showButtons ? (
                <>
                  <path d="m2 2 20 20" />
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                </>
              ) : (
                <>
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
            <span>{showButtons ? 'Ocultar Menús' : 'Mostrar Menús'}</span>
          </button>

          {/* Boton flotante para entrar al modo VR */}
          <button
            onClick={enterVR}
            style={{
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: '700',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#ffffff',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              border: '2px solid #38bdf8',
              borderRadius: '50px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(56, 189, 248, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
              outline: 'none'
            }}
          >
            {/* Icono de Gafas VR */}
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
              <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4.5l-2-2.5-2 2.5H5a2 2 0 0 1-2-2V7z" />
              <circle cx="8" cy="12" r="2" />
              <circle cx="16" cy="12" r="2" />
            </svg>
            Entrar a Modo VR
          </button>
        </div>
      )}

      {/* Boton para salir del modo VR manual (solo cuando se activa el fallback estereoscópico) */}
      {vrMode && !navigator.xr && (
        <button
          onClick={exitVR}
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
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
