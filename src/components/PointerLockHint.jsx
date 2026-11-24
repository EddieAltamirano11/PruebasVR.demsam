import React, { useEffect, useState } from 'react';

const hasFinePointer = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: fine)').matches;

const isLocked = () => typeof document !== 'undefined' && Boolean(document.pointerLockElement);

/**
 * Aviso de la Experiencia 2D con mouse (estilo juego):
 * - Cursor libre: "Haz clic en la escena para explorar".
 * - Cursor capturado: recuerda unos segundos que cualquier tecla lo libera.
 * No aparece en celulares/tabletas (sin mouse).
 */
export function PointerLockHint() {
  const [locked, setLocked] = useState(isLocked);
  const [showEscTip, setShowEscTip] = useState(false);
  const [finePointer] = useState(hasFinePointer);

  useEffect(() => {
    let timer = null;
    const onChange = () => {
      const now = isLocked();
      setLocked(now);
      clearTimeout(timer);
      setShowEscTip(now);
      if (now) timer = setTimeout(() => setShowEscTip(false), 3500);
    };
    document.addEventListener('pointerlockchange', onChange);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerlockchange', onChange);
    };
  }, []);

  if (!finePointer || (locked && !showEscTip)) return null;

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'max(28px, env(safe-area-inset-bottom))',
        transform: 'translateX(-50%)',
        zIndex: 900,
        pointerEvents: 'none',
        padding: '10px 18px',
        borderRadius: '24px',
        background: 'rgba(11, 26, 48, 0.82)',
        border: '1px solid rgba(229, 160, 13, 0.7)',
        color: '#f8fafc',
        fontSize: '14px',
        fontWeight: 600,
        letterSpacing: '0.2px',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(6px)',
        whiteSpace: 'nowrap',
        maxWidth: 'calc(100vw - 32px)',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}
    >
      {locked ? (
        <>Pulsa <b style={{ color: '#E5A00D' }}>cualquier tecla</b> para mostrar el cursor</>
      ) : (
        <>Haz <b style={{ color: '#E5A00D' }}>clic</b> en la escena para explorar · mueve el mouse para mirar</>
      )}
    </div>
  );
}

export default PointerLockHint;
