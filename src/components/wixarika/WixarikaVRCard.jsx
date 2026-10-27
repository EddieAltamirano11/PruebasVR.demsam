import React from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { WIXARIKA_VARIANTS, calculateAngularSize } from './wixarikaTheme.js';
import { TsikuriDiamond, ChaquiraBorder } from './TsikuriDiamond.jsx';
import { WixarikaVRButton } from './WixarikaVRButton.jsx';

/**
 * WixarikaVRCard - Tarjeta 3D Reutilizable con Identidad Cultural Wixárika
 * Diseñada para fichas de libros, estaciones de museo, cédulas culturales y detalles.
 * 
 * @param {Object} props
 * @param {string} props.title - Título principal
 * @param {string} [props.subtitle] - Subtítulo o autor
 * @param {string} [props.category] - Categoría (ej. 'COSMOVISIÓN', 'LIBRO FÍSICO')
 * @param {string} [props.badge] - Insignia destacada (ej. 'DISPONIBLE EN SALA')
 * @param {string} [props.description] - Descripción o sinopsis
 * @param {Array<{label: string, value: string}>} [props.metadata] - Metadatos adicionales
 * @param {Array<Object>} [props.actions] - Botones de acción inferiores
 * @param {number} [props.width=1.8] - Ancho de la tarjeta en metros
 * @param {number} [props.height=1.4] - Alto de la tarjeta en metros
 * @param {Array<number>} [props.position] - Posición 3D [x, y, z]
 * @param {Array<number>} [props.rotation] - Rotación 3D [rx, ry, rz]
 * @param {'solar'|'water'|'hikuri'|'kauyumari'|'obsidian'} [props.variant='solar']
 * @param {Function} [props.onRegister] - Para registrar botones interactivos
 * @param {Function} [props.onUnregister] - Para desregistrar botones
 * @param {string} [props.hoveredId] - ID de botón actualmente enfocado
 * @param {number} [props.fuseProgress=0] - Progreso del Gaze Fuse
 * @param {number} [props.distance=2.2] - Distancia en metros al usuario
 */
export function WixarikaVRCard({
  title,
  subtitle,
  category,
  badge,
  description,
  metadata = [],
  actions = [],
  width = 1.8,
  height = 1.4,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  variant = 'solar',
  onRegister,
  onUnregister,
  registerMesh,
  unregisterMesh,
  hoveredId,
  fuseProgress = 0,
  distance = 2.2
}) {
  const theme = WIXARIKA_VARIANTS[variant] || WIXARIKA_VARIANTS.solar;

  // Cálculos de espaciado y tamaños tipográficos
  const halfW = width / 2;
  const halfH = height / 2;
  const contentW = width * 0.88;

  // Tipografías ajustadas a tamaño angular ergonómico sin riesgo de solapamiento
  const titleSize = Math.max(0.048, Math.min(0.062, width * 0.032));
  const subtitleSize = Math.max(0.034, Math.min(0.040, width * 0.020));
  const descSize = Math.max(0.032, Math.min(0.038, width * 0.019));
  const metaSize = Math.max(0.030, Math.min(0.034, width * 0.017));
  const badgeSize = Math.max(0.030, Math.min(0.034, width * 0.016));

  // Espacio vertical para las secciones (con anclaje superior explícito)
  const badgeY = halfH - 0.08;
  const titleY = badgeY - 0.07;
  const isTitleLong = (title?.length || 0) > 28;
  const subtitleY = titleY - (isTitleLong ? 0.12 : 0.075);
  const separatorY = subtitleY - 0.055;
  const descY = separatorY - 0.025;
  const metaY = description ? descY - 0.14 : separatorY - 0.04;
  const actionsY = -halfH + 0.11;

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Marco exterior resplandeciente con borde sagrado */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[width + 0.04, height + 0.04]} />
        <meshBasicMaterial color={theme.borderColor} transparent opacity={0.85} />
      </mesh>

      {/* 2. Placa base de Obsidiana Sagrada de alto contraste (WCAG AAA) */}
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color="#070a14" transparent opacity={0.96} />
      </mesh>

      {/* 3. Cenefa superior decorativa con chaquiras */}
      <mesh position={[0, halfH - 0.035, 0.001]}>
        <planeGeometry args={[width * 0.94, 0.025]} />
        <meshBasicMaterial color={theme.accentColor} transparent opacity={0.9} />
      </mesh>

      {/* 4. Rombo Tsikuri en el centro del encabezado (Cresta Sagrada) */}
      <TsikuriDiamond
        size={0.12}
        position={[0, halfH + 0.02, 0.005]}
        colors={theme.chaquiraBeads}
      />

      {/* 5. Categoría e insignia destacada */}
      {category && (
        <group position={[-contentW / 2 + 0.02, badgeY, 0.005]}>
          <Text
            fontSize={badgeSize}
            color={theme.accentColor}
            anchorX="left"
            anchorY="middle"
            letterSpacing={0.08}
          >
            {`✦ ${category.toUpperCase()}`}
          </Text>
        </group>
      )}

      {badge && (
        <group position={[contentW / 2 - 0.02, badgeY, 0.005]}>
          {/* Fondo de insignia */}
          <mesh position={[-0.16, 0, -0.001]}>
            <planeGeometry args={[0.38, 0.055]} />
            <meshBasicMaterial color={theme.bgActive} transparent opacity={0.9} />
          </mesh>
          <Text
            position={[-0.16, 0, 0.001]}
            fontSize={badgeSize * 0.9}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {badge}
          </Text>
        </group>
      )}

      {/* 6. Título y Subtítulo con alto contraste (anclaje top para evitar solapamiento) */}
      <Text
        position={[0, titleY, 0.005]}
        fontSize={titleSize}
        color="#ffffff"
        anchorX="center"
        anchorY="top"
        maxWidth={contentW * 0.94}
        textAlign="center"
        outlineWidth={0.002}
        outlineColor="#040711"
        lineHeight={1.15}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          position={[0, subtitleY, 0.005]}
          fontSize={subtitleSize}
          color={theme.textColor}
          anchorX="center"
          anchorY="top"
          maxWidth={contentW * 0.94}
          textAlign="center"
        >
          {subtitle}
        </Text>
      )}

      {/* 7. Separador geométrico */}
      <mesh position={[0, separatorY, 0.003]}>
        <planeGeometry args={[contentW * 0.75, 0.004]} />
        <meshBasicMaterial color={theme.borderGlow} transparent opacity={0.6} />
      </mesh>

      {/* 8. Descripción o sinopsis del libro/estación */}
      {description && (
        <Text
          position={[0, descY, 0.005]}
          fontSize={descSize}
          color="#f8fafc"
          anchorX="center"
          anchorY="top"
          maxWidth={contentW * 0.94}
          textAlign="center"
          lineHeight={1.3}
        >
          {description}
        </Text>
      )}

      {/* 9. Metadatos (Autor, Disponibilidad, Cota de biblioteca) */}
      {metadata.length > 0 && (
        <group position={[0, metaY, 0.005]}>
          {metadata.map((item, idx) => {
            const spacing = 0.052;
            const yPos = -idx * spacing;
            return (
              <group key={idx} position={[0, yPos, 0]}>
                <Text
                  position={[-contentW / 2 + 0.04, 0, 0]}
                  fontSize={metaSize}
                  color={theme.borderGlow}
                  anchorX="left"
                  anchorY="top"
                >
                  {`${item.label}:`}
                </Text>
                <Text
                  position={[-contentW / 2 + 0.38, 0, 0]}
                  fontSize={metaSize}
                  color="#ffffff"
                  anchorX="left"
                  anchorY="top"
                  maxWidth={contentW - 0.42}
                >
                  {item.value}
                </Text>
              </group>
            );
          })}
        </group>
      )}

      {/* 10. Botones de Acción (con soporte Gaze Fuse) */}
      {actions.length > 0 && (
        <group position={[0, actionsY, 0.008]}>
          {actions.map((action, idx) => {
            const totalActions = actions.length;
            const btnWidth = Math.min(1.2, (contentW - (totalActions - 1) * 0.08) / totalActions);
            const btnHeight = Math.max(0.14, height * 0.12);
            const totalSpan = totalActions * btnWidth + (totalActions - 1) * 0.08;
            const startX = -totalSpan / 2 + btnWidth / 2;
            const xPos = startX + idx * (btnWidth + 0.08);

            return (
              <WixarikaVRButton
                key={action.id || idx}
                id={action.id || `card-btn-${idx}`}
                label={action.label}
                icon={action.icon}
                variant={action.variant || variant}
                width={btnWidth}
                height={btnHeight}
                position={[xPos, 0, 0]}
                onClick={action.onClick}
                onRegister={onRegister}
                onUnregister={onUnregister}
                registerMesh={registerMesh}
                unregisterMesh={unregisterMesh}
                hoveredId={hoveredId}
                fuseProgress={fuseProgress}
                distance={distance}
              />
            );
          })}
        </group>
      )}
    </group>
  );
}

export default WixarikaVRCard;
