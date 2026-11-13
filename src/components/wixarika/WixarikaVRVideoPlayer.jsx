import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { WixarikaVRButton } from './WixarikaVRButton.jsx';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';
import { LucideVRIcon } from './LucideVRIcon.jsx';
import { SoundFX } from '../../services/audioService.js';
import {
  DEFAULT_VIDEO_POSTER,
  formatVideoTime,
  resolveVideoSource
} from '../../services/videoService.js';

/**
 * WixarikaVRVideoPlayer - Reproductor audiovisual 3D en sala cultural.
 */
export function WixarikaVRVideoPlayer({
  video,
  quality = '720p',
  onQualityChange,
  cinemaMode = false,
  onToggleCinemaMode,
  onPlaybackChange,
  onRegister,
  onUnregister,
  registerMesh,
  unregisterMesh,
  hoveredId,
  fuseProgress = 0
}) {
  const videoElRef = useRef(null);
  const videoTextureRef = useRef(null);
  const lastTrackIdRef = useRef(null);
  const lastQualityRef = useRef(quality);
  const pendingMetaCleanupRef = useRef(null);
  const seekBarGroupRef = useRef(null);

  const [videoTexture, setVideoTexture] = useState(null);
  const [posterTexture, setPosterTexture] = useState(null);
  const [hasFrame, setHasFrame] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedRatio, setBufferedRatio] = useState(0);
  const [statusNote, setStatusNote] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  const sourceUrl = useMemo(
    () => resolveVideoSource(video, quality),
    [video, quality]
  );

  const posterUrl = video?.poster || DEFAULT_VIDEO_POSTER;

  useEffect(() => {
    if (!posterUrl || typeof document === 'undefined') {
      setPosterTexture(null);
      return;
    }

    let isMounted = true;
    let loadedRef = null;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    loader.load(
      posterUrl,
      (tex) => {
        if (!isMounted) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        loadedRef = tex;
        setPosterTexture(tex);
      },
      undefined,
      () => {
        if (isMounted) setPosterTexture(null);
      }
    );

    return () => {
      isMounted = false;
      if (loadedRef) loadedRef.dispose();
    };
  }, [posterUrl]);

  const startSafePlayback = useCallback(async () => {
    const el = videoElRef.current;
    if (!el) return;

    try {
      setErrorMsg(null);
      if (
        el.ended ||
        (Number.isFinite(el.duration) && el.duration > 0 && el.currentTime >= el.duration - 0.1)
      ) {
        el.currentTime = 0;
      }
      if (!el.muted && SoundFX.ambientPlaying) {
        SoundFX.toggleAmbient();
      }
      await el.play();
    } catch (err) {
      if (err?.name === 'NotAllowedError' && !el.muted) {
        try {
          el.muted = true;
          setIsMuted(true);
          setStatusNote('Pulsa Audio para activar sonido');
          await el.play();
        } catch (_retryErr) {
          setErrorMsg('Pulsa Iniciar para reproducir');
        }
      } else if (err?.name !== 'AbortError') {
        setErrorMsg('No se pudo reproducir el video');
      }
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const el = document.createElement('video');
    el.crossOrigin = 'anonymous';
    el.playsInline = true;
    el.preload = 'metadata';
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');

    let vTex = null;
    try {
      vTex = new THREE.VideoTexture(el);
      vTex.colorSpace = THREE.SRGBColorSpace;
      vTex.minFilter = THREE.LinearFilter;
      vTex.magFilter = THREE.LinearFilter;
      vTex.generateMipmaps = false;
      videoTextureRef.current = vTex;
      setVideoTexture(vTex);
    } catch (_err) {
      videoTextureRef.current = null;
    }

    videoElRef.current = el;

    const syncBuffered = () => {
      try {
        if (el.buffered && el.buffered.length > 0 && Number.isFinite(el.duration) && el.duration > 0) {
          const end = el.buffered.end(el.buffered.length - 1);
          setBufferedRatio(Math.min(1, Math.max(0, end / el.duration)));
        }
      } catch (_err) {
        // Ignorar rangos inválidos durante cambio de fuente
      }
    };

    const onLoadedMetadata = () => {
      if (Number.isFinite(el.duration)) setDuration(el.duration);
      syncBuffered();
    };

    const onDurationChange = () => {
      if (Number.isFinite(el.duration)) setDuration(el.duration);
    };

    const onLoadedData = () => {
      if (el.readyState >= 2) setHasFrame(true);
      setIsBuffering(false);
      syncBuffered();
    };

    const onCanPlay = () => {
      if (el.readyState >= 2) setHasFrame(true);
      setIsBuffering(false);
    };

    const onPlaying = () => {
      setIsPlaying(true);
      setIsBuffering(false);
      if (el.readyState >= 2) setHasFrame(true);
      onPlaybackChange?.(true);
    };

    const onPause = () => {
      setIsPlaying(false);
      onPlaybackChange?.(false);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      onPlaybackChange?.(false);
    };

    const onWaiting = () => {
      setIsBuffering(true);
    };

    const onSeeked = () => {
      setIsBuffering(false);
      if (el.readyState >= 2) setHasFrame(true);
      syncBuffered();
    };

    const onTimeUpdate = () => {
      if (Number.isFinite(el.currentTime)) setCurrentTime(el.currentTime);
      syncBuffered();
    };

    const onProgress = () => {
      syncBuffered();
    };

    const onVolumeChange = () => {
      setIsMuted(Boolean(el.muted || el.volume === 0));
    };

    const onError = () => {
      setIsPlaying(false);
      setIsBuffering(false);
      setErrorMsg('No se pudo reproducir el video');
      onPlaybackChange?.(false);
    };

    el.addEventListener('loadedmetadata', onLoadedMetadata);
    el.addEventListener('durationchange', onDurationChange);
    el.addEventListener('loadeddata', onLoadedData);
    el.addEventListener('canplay', onCanPlay);
    el.addEventListener('playing', onPlaying);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);
    el.addEventListener('waiting', onWaiting);
    el.addEventListener('seeked', onSeeked);
    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('progress', onProgress);
    el.addEventListener('volumechange', onVolumeChange);
    el.addEventListener('error', onError);

    return () => {
      if (pendingMetaCleanupRef.current) {
        pendingMetaCleanupRef.current();
        pendingMetaCleanupRef.current = null;
      }

      el.removeEventListener('loadedmetadata', onLoadedMetadata);
      el.removeEventListener('durationchange', onDurationChange);
      el.removeEventListener('loadeddata', onLoadedData);
      el.removeEventListener('canplay', onCanPlay);
      el.removeEventListener('playing', onPlaying);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('waiting', onWaiting);
      el.removeEventListener('seeked', onSeeked);
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('progress', onProgress);
      el.removeEventListener('volumechange', onVolumeChange);
      el.removeEventListener('error', onError);

      try {
        el.pause();
        el.removeAttribute('src');
        el.load();
      } catch (_cleanupErr) {
        // Ignorar al desmontar
      }

      if (vTex) {
        vTex.dispose();
      }
      videoElRef.current = null;
      videoTextureRef.current = null;
      onPlaybackChange?.(false);
    };
  }, [onPlaybackChange]);

  useEffect(() => {
    const el = videoElRef.current;
    if (!el || !sourceUrl) return;

    const trackId = video?.id || 'default';
    const isSameTrack = lastTrackIdRef.current === trackId;
    const isQualitySwitch = isSameTrack && lastQualityRef.current !== quality;

    lastTrackIdRef.current = trackId;
    lastQualityRef.current = quality;

    if (pendingMetaCleanupRef.current) {
      pendingMetaCleanupRef.current();
      pendingMetaCleanupRef.current = null;
    }

    if (isQualitySwitch) {
      const resumeTime = Number.isFinite(el.currentTime) ? el.currentTime : 0;
      const shouldResume = !el.paused && !el.ended;

      setIsBuffering(true);
      setErrorMsg(null);
      setStatusNote('');

      el.pause();
      el.src = sourceUrl;
      el.load();

      const onSwitchMeta = () => {
        el.removeEventListener('loadedmetadata', onSwitchMeta);
        pendingMetaCleanupRef.current = null;

        if (resumeTime > 0.2 && Number.isFinite(el.duration) && el.duration > 0) {
          el.currentTime = Math.min(resumeTime, Math.max(0, el.duration - 0.1));
        }
        if (shouldResume) {
          startSafePlayback();
        } else {
          setIsBuffering(false);
        }
      };

      el.addEventListener('loadedmetadata', onSwitchMeta);
      pendingMetaCleanupRef.current = () => {
        el.removeEventListener('loadedmetadata', onSwitchMeta);
      };
    } else {
      setIsPlaying(false);
      setIsBuffering(false);
      setHasFrame(false);
      setCurrentTime(0);
      setDuration(0);
      setBufferedRatio(0);
      setErrorMsg(null);
      setStatusNote('');

      el.pause();
      el.src = sourceUrl;
      el.load();
    }
  }, [video?.id, sourceUrl, quality, startSafePlayback]);

  useFrame(() => {
    const el = videoElRef.current;
    const tex = videoTextureRef.current;
    if (el && tex && hasFrame && !el.paused && !el.ended) {
      if (!('requestVideoFrameCallback' in el) && el.readyState >= 2) {
        tex.needsUpdate = true;
      }
    }
  });

  const handleTogglePlay = useCallback(() => {
    const el = videoElRef.current;
    if (!el) return;
    SoundFX.playClick();
    setStatusNote('');

    if (el.paused || el.ended) {
      startSafePlayback();
    } else {
      el.pause();
    }
  }, [startSafePlayback]);

  const handleSeekBy = useCallback(
    (deltaSeconds) => {
      const el = videoElRef.current;
      if (!el) return;
      SoundFX.playClick();

      const maxDur = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : duration;
      const baseTime = Number.isFinite(el.currentTime) ? el.currentTime : 0;
      const nextTime = Math.max(
        0,
        Math.min(maxDur || baseTime + deltaSeconds, baseTime + deltaSeconds)
      );
      el.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [duration]
  );

  const handleToggleMute = useCallback(() => {
    const el = videoElRef.current;
    if (!el) return;
    SoundFX.playClick();
    const nextMuted = !el.muted;
    el.muted = nextMuted;
    setIsMuted(nextMuted);
    setStatusNote('');
    if (!nextMuted && SoundFX.ambientPlaying) {
      SoundFX.toggleAmbient();
    }
  }, []);

  const handleSelect720p = useCallback(() => {
    SoundFX.playClick();
    if (quality !== '720p') {
      onQualityChange?.('720p');
    }
  }, [quality, onQualityChange]);

  const handleSelect480p = useCallback(() => {
    SoundFX.playClick();
    if (quality !== '480p') {
      onQualityChange?.('480p');
    }
  }, [quality, onQualityChange]);

  const handleSeekBarClick = useCallback(
    (e) => {
      e.stopPropagation?.();
      const el = videoElRef.current;
      const group = seekBarGroupRef.current;
      if (!el || !group || !e?.point) return;

      const maxDur = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : duration;
      if (!maxDur || maxDur <= 0) return;

      const barW = cinemaMode ? 2.00 : 1.72;
      const localPoint = e.point.clone();
      group.worldToLocal(localPoint);
      const ratio = Math.max(0, Math.min(1, (localPoint.x + barW / 2) / barW));
      const nextTime = ratio * maxDur;

      SoundFX.playClick();
      el.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [cinemaMode, duration]
  );

  const screenWidth = cinemaMode ? 2.00 : 1.72;
  const screenHeight = cinemaMode ? 1.125 : 0.9675; // Relación exacta 16:9
  const columnX = cinemaMode ? 0 : -0.68;
  const screenY = cinemaMode ? 0.03 : 0.10;
  const seekBarY = cinemaMode ? -0.605 : -0.455;
  const timeY = cinemaMode ? -0.685 : -0.535;

  const progressRatio = duration > 0 ? Math.max(0, Math.min(1, currentTime / duration)) : 0;
  const fillWidth = Math.max(0.001, screenWidth * progressRatio);
  const bufferedWidth = Math.max(0.001, screenWidth * bufferedRatio);

  const timeLabel = `${formatVideoTime(currentTime)} / ${
    duration > 0 ? formatVideoTime(duration) : video?.duration || '03:22'
  }`;

  const activeTexture = hasFrame && videoTexture ? videoTexture : posterTexture;
  const showOverlay = Boolean(errorMsg || isBuffering || statusNote || (!isPlaying && !hasFrame));

  return (
    <group>
      {/* 1. ÁREA DEL REPRODUCTOR */}
      <group position={[columnX, 0, 0]}>
        {/* Marco y Pantalla 16:9 */}
        <group position={[0, screenY, 0.01]}>
          <mesh position={[0, 0, -0.004]}>
            <planeGeometry args={[screenWidth + 0.036, screenHeight + 0.036]} />
            <meshBasicMaterial color="#5c381e" />
          </mesh>

          <mesh position={[0, 0, -0.002]}>
            <planeGeometry args={[screenWidth + 0.016, screenHeight + 0.016]} />
            <meshBasicMaterial color="#d4af37" />
          </mesh>

          <mesh position={[0, 0, 0]} onClick={handleTogglePlay}>
            <planeGeometry args={[screenWidth, screenHeight]} />
            {activeTexture ? (
              <meshBasicMaterial map={activeTexture} toneMapped={false} />
            ) : (
              <meshBasicMaterial color="#111827" />
            )}
          </mesh>

          <TsikuriDiamond
            size={0.038}
            position={[-screenWidth / 2 + 0.022, screenHeight / 2 - 0.022, 0.006]}
            colors={['#d4af37', '#b45309', '#ffffff']}
          />
          <TsikuriDiamond
            size={0.038}
            position={[screenWidth / 2 - 0.022, screenHeight / 2 - 0.022, 0.006]}
            colors={['#d4af37', '#b45309', '#ffffff']}
          />

          {showOverlay && (
            <group position={[0, 0, 0.004]}>
              <mesh position={[0, 0, -0.001]}>
                <planeGeometry args={[screenWidth, screenHeight]} />
                <meshBasicMaterial color="#070a14" transparent opacity={hasFrame ? 0.32 : 0.40} />
              </mesh>

              <mesh position={[0, 0, -0.0005]}>
                <planeGeometry args={[cinemaMode ? 1.12 : 1.04, 0.22]} />
                <meshBasicMaterial color={errorMsg ? '#dc2626' : '#c69214'} />
              </mesh>
              <mesh position={[0, 0, 0]}>
                <planeGeometry args={[cinemaMode ? 1.09 : 1.01, 0.195]} />
                <meshBasicMaterial color="#faf6eb" transparent opacity={0.96} />
              </mesh>

              {!errorMsg && !isBuffering && !statusNote && (
                <LucideVRIcon
                  name="play"
                  size={0.09}
                  color="#b45309"
                  position={[-(cinemaMode ? 0.42 : 0.38), 0, 0.002]}
                />
              )}

              <Text
                position={[!errorMsg && !isBuffering && !statusNote ? 0.06 : 0, 0, 0.002]}
                fontSize={0.070}
                color={errorMsg ? '#991b1b' : '#1c1917'}
                anchorX="center"
                anchorY="middle"
                maxWidth={0.86}
                textAlign="center"
              >
                {errorMsg ||
                  (isBuffering
                    ? 'Cargando video...'
                    : statusNote || 'Iniciar documental')}
              </Text>
            </group>
          )}
        </group>

        {/* Barra de Progreso */}
        <group ref={seekBarGroupRef} position={[0, seekBarY, 0.012]}>
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[screenWidth + 0.012, 0.054]} />
            <meshBasicMaterial color="#c69214" />
          </mesh>

          <mesh position={[0, 0, 0]} onClick={handleSeekBarClick}>
            <planeGeometry args={[screenWidth, 0.042]} />
            <meshBasicMaterial color="#e7dec8" />
          </mesh>

          {bufferedRatio > 0 && (
            <mesh position={[-screenWidth / 2 + bufferedWidth / 2, 0, 0.001]}>
              <planeGeometry args={[bufferedWidth, 0.042]} />
              <meshBasicMaterial color="#fde68a" />
            </mesh>
          )}

          {progressRatio > 0 && (
            <mesh position={[-screenWidth / 2 + fillWidth / 2, 0, 0.002]}>
              <planeGeometry args={[fillWidth, 0.042]} />
              <meshBasicMaterial color="#b45309" />
            </mesh>
          )}

          <mesh position={[-screenWidth / 2 + screenWidth * progressRatio, 0, 0.003]}>
            <planeGeometry args={[0.028, 0.066]} />
            <meshBasicMaterial color="#1c1917" />
          </mesh>
        </group>

        {/* Tiempo actual / Duración */}
        <Text
          position={[0, timeY, 0.012]}
          fontSize={0.066}
          color="#1c1917"
          anchorX="center"
          anchorY="middle"
        >
          {timeLabel}
        </Text>

        {/* Controles */}
        {cinemaMode ? (
          <group position={[0, -0.845, 0.014]}>
            <WixarikaVRButton
              id="btn-video-back10"
              label="-10s"
              variant="cantera"
              width={0.30}
              height={0.165}
              position={[-1.39, 0, 0]}
              onClick={() => handleSeekBy(-10)}
              onRegister={onRegister}
              onUnregister={onUnregister}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
            <WixarikaVRButton
              id="btn-video-play"
              label={isPlaying ? 'Pausar' : 'Iniciar'}
              iconName={isPlaying ? 'pause' : 'play'}
              variant="cantera"
              active={isPlaying}
              width={0.48}
              height={0.165}
              position={[-0.96, 0, 0]}
              onClick={handleTogglePlay}
              onRegister={onRegister}
              onUnregister={onUnregister}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
            <WixarikaVRButton
              id="btn-video-fwd10"
              label="+10s"
              variant="cantera"
              width={0.30}
              height={0.165}
              position={[-0.53, 0, 0]}
              onClick={() => handleSeekBy(10)}
              onRegister={onRegister}
              onUnregister={onUnregister}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
            <WixarikaVRButton
              id="btn-video-mute"
              label={isMuted ? 'Silencio' : 'Audio'}
              iconName={isMuted ? 'volume-x' : 'volume-2'}
              variant="cantera"
              active={isMuted}
              width={0.48}
              height={0.165}
              position={[-0.10, 0, 0]}
              onClick={handleToggleMute}
              onRegister={onRegister}
              onUnregister={onUnregister}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
            <WixarikaVRButton
              id="btn-video-q720"
              label="720p"
              variant="cantera"
              active={quality === '720p'}
              width={0.36}
              height={0.165}
              position={[0.36, 0, 0]}
              onClick={handleSelect720p}
              onRegister={onRegister}
              onUnregister={onUnregister}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
            <WixarikaVRButton
              id="btn-video-q480"
              label="480p"
              variant="cantera"
              active={quality === '480p'}
              width={0.36}
              height={0.165}
              position={[0.76, 0, 0]}
              onClick={handleSelect480p}
              onRegister={onRegister}
              onUnregister={onUnregister}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
            <WixarikaVRButton
              id="btn-video-cinema"
              label="Ver Ficha"
              iconName="minimize-2"
              variant="cantera"
              width={0.56}
              height={0.165}
              position={[1.26, 0, 0]}
              onClick={onToggleCinemaMode}
              onRegister={onRegister}
              onUnregister={onUnregister}
              registerMesh={registerMesh}
              unregisterMesh={unregisterMesh}
              hoveredId={hoveredId}
              fuseProgress={fuseProgress}
              showDiamonds={false}
            />
          </group>
        ) : (
          <group>
            {/* Fila 1: Transporte de reproducción */}
            <group position={[0, -0.68, 0.014]}>
              <WixarikaVRButton
                id="btn-video-back10"
                label="-10s"
                variant="cantera"
                width={0.28}
                height={0.165}
                position={[-0.72, 0, 0]}
                onClick={() => handleSeekBy(-10)}
                onRegister={onRegister}
                onUnregister={onUnregister}
                registerMesh={registerMesh}
                unregisterMesh={unregisterMesh}
                hoveredId={hoveredId}
                fuseProgress={fuseProgress}
                showDiamonds={false}
              />
              <WixarikaVRButton
                id="btn-video-play"
                label={isPlaying ? 'Pausar' : 'Iniciar'}
                iconName={isPlaying ? 'pause' : 'play'}
                variant="cantera"
                active={isPlaying}
                width={0.52}
                height={0.165}
                position={[-0.28, 0, 0]}
                onClick={handleTogglePlay}
                onRegister={onRegister}
                onUnregister={onUnregister}
                registerMesh={registerMesh}
                unregisterMesh={unregisterMesh}
                hoveredId={hoveredId}
                fuseProgress={fuseProgress}
                showDiamonds={false}
              />
              <WixarikaVRButton
                id="btn-video-fwd10"
                label="+10s"
                variant="cantera"
                width={0.28}
                height={0.165}
                position={[0.16, 0, 0]}
                onClick={() => handleSeekBy(10)}
                onRegister={onRegister}
                onUnregister={onUnregister}
                registerMesh={registerMesh}
                unregisterMesh={unregisterMesh}
                hoveredId={hoveredId}
                fuseProgress={fuseProgress}
                showDiamonds={false}
              />
              <WixarikaVRButton
                id="btn-video-mute"
                label={isMuted ? 'Silencio' : 'Audio'}
                iconName={isMuted ? 'volume-x' : 'volume-2'}
                variant="cantera"
                active={isMuted}
                width={0.52}
                height={0.165}
                position={[0.60, 0, 0]}
                onClick={handleToggleMute}
                onRegister={onRegister}
                onUnregister={onUnregister}
                registerMesh={registerMesh}
                unregisterMesh={unregisterMesh}
                hoveredId={hoveredId}
                fuseProgress={fuseProgress}
                showDiamonds={false}
              />
            </group>

            {/* Fila 2: Resolución y Pantalla Completa */}
            <group position={[0, -0.88, 0.014]}>
              <WixarikaVRButton
                id="btn-video-q720"
                label="720p"
                variant="cantera"
                active={quality === '720p'}
                width={0.42}
                height={0.16}
                position={[-0.65, 0, 0]}
                onClick={handleSelect720p}
                onRegister={onRegister}
                onUnregister={onUnregister}
                registerMesh={registerMesh}
                unregisterMesh={unregisterMesh}
                hoveredId={hoveredId}
                fuseProgress={fuseProgress}
                showDiamonds={false}
              />
              <WixarikaVRButton
                id="btn-video-q480"
                label="480p"
                variant="cantera"
                active={quality === '480p'}
                width={0.42}
                height={0.16}
                position={[-0.19, 0, 0]}
                onClick={handleSelect480p}
                onRegister={onRegister}
                onUnregister={onUnregister}
                registerMesh={registerMesh}
                unregisterMesh={unregisterMesh}
                hoveredId={hoveredId}
                fuseProgress={fuseProgress}
                showDiamonds={false}
              />
              <WixarikaVRButton
                id="btn-video-cinema"
                label="Ampliar"
                iconName="maximize-2"
                variant="cantera"
                width={0.80}
                height={0.16}
                position={[0.46, 0, 0]}
                onClick={onToggleCinemaMode}
                onRegister={onRegister}
                onUnregister={onUnregister}
                registerMesh={registerMesh}
                unregisterMesh={unregisterMesh}
                hoveredId={hoveredId}
                fuseProgress={fuseProgress}
                showDiamonds={false}
              />
            </group>
          </group>
        )}
      </group>

      {/* 2. COLUMNA DERECHA: FICHA CULTURAL AMPLIA Y LEGIBLE */}
      {!cinemaMode && video && (
        <group position={[0.96, -0.16, 0.01]}>
          <mesh position={[0, 0, -0.004]}>
            <planeGeometry args={[1.44, 1.68]} />
            <meshBasicMaterial color="#c69214" transparent opacity={0.9} />
          </mesh>

          <mesh position={[0, 0, -0.002]}>
            <planeGeometry args={[1.40, 1.64]} />
            <meshBasicMaterial color="#faf6eb" />
          </mesh>

          <mesh position={[0, 0.78, 0.001]}>
            <planeGeometry args={[1.30, 0.024]} />
            <meshBasicMaterial color="#b45309" />
          </mesh>

          {/* Categoría */}
          <Text
            position={[0, 0.68, 0.003]}
            fontSize={0.072}
            color="#b45309"
            anchorX="center"
            anchorY="middle"
            maxWidth={1.28}
            textAlign="center"
          >
            {(video.category || 'DOCUMENTAL').toUpperCase()}
          </Text>

          {/* Título principal grande */}
          <Text
            position={[0, 0.56, 0.003]}
            fontSize={0.102}
            color="#1c1917"
            anchorX="center"
            anchorY="top"
            maxWidth={1.28}
            textAlign="center"
            lineHeight={1.16}
          >
            {video.title}
          </Text>

          {/* Producción y año */}
          <Text
            position={[0, 0.24, 0.003]}
            fontSize={0.078}
            color="#78350f"
            anchorX="center"
            anchorY="top"
            maxWidth={1.28}
            textAlign="center"
            lineHeight={1.2}
          >
            {`${video.director} (${video.year || '2024'})`}
          </Text>

          {/* Divisor */}
          <mesh position={[0, 0.06, 0.002]}>
            <planeGeometry args={[1.20, 0.005]} />
            <meshBasicMaterial color="#d4af37" transparent opacity={0.7} />
          </mesh>

          {/* Sinopsis con tipografía amplia */}
          <Text
            position={[0, -0.02, 0.003]}
            fontSize={0.082}
            color="#292524"
            anchorX="center"
            anchorY="top"
            maxWidth={1.28}
            textAlign="center"
            lineHeight={1.32}
          >
            {video.synopsis}
          </Text>

          {/* Sello cultural inferior limpio */}
          <group position={[0, -0.66, 0.003]}>
            <mesh position={[0, 0, -0.001]}>
              <planeGeometry args={[1.24, 0.12]} />
              <meshBasicMaterial color="#f3ebd6" />
            </mesh>
            <Text
              position={[0, 0, 0.001]}
              fontSize={0.070}
              color="#78350f"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.18}
            >
              {video.badge || 'ACERVO CULTURAL'}
            </Text>
          </group>
        </group>
      )}
    </group>
  );
}

export default WixarikaVRVideoPlayer;
