import React from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import { VRView } from './views/VRView.jsx';

export default function App() {
  return (
    <AuthProvider>
      <VRView />
    </AuthProvider>
  );
}
