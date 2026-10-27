import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { AdminLayout } from './components/AdminLayout.jsx';
import { DashboardView } from './views/DashboardView.jsx';
import { BooksManagementView } from './views/BooksManagementView.jsx';
import { WireframesView } from './views/WireframesView.jsx';
import { VRPrototypeView } from './views/VRPrototypeView.jsx';
import { LoginView } from './views/LoginView.jsx';

/**
 * Contenedor principal de la aplicación con control de rutas y autenticación
 */
function AppContent() {
  const { user, signOut } = useAuth();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'books' | 'wireframes' | 'vr'

  const isAuthenticated = Boolean(user) || isDemoMode;

  const handleSignOut = async () => {
    if (isDemoMode) {
      setIsDemoMode(false);
    } else {
      await signOut();
    }
    setActiveTab('dashboard');
  };

  // 1. Si no está autenticado, renderizar la pantalla de Login con los colores de BiblioVR
  if (!isAuthenticated) {
    return <LoginView onBypassDemo={() => setIsDemoMode(true)} />;
  }

  // 2. Si está autenticado, renderizar el Panel de Control General con su Sidebar lateral
  return (
    <AdminLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onSignOut={handleSignOut}
    >
      {activeTab === 'dashboard' && (
        <DashboardView onNavigate={(tab) => setActiveTab(tab)} />
      )}

      {activeTab === 'books' && <BooksManagementView />}

      {activeTab === 'wireframes' && <WireframesView />}

      {activeTab === 'vr' && (
        <VRPrototypeView onBackToDashboard={() => setActiveTab('dashboard')} />
      )}
    </AdminLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
