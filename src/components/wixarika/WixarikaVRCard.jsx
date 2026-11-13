import React from 'react';
import { Text } from '@react-three/drei';
import { WIXARIKA_VARIANTS, VR_TYPOGRAPHY_PALETTE } from './wixarikaTheme.js';
import { TsikuriDiamond } from './TsikuriDiamond.jsx';
import { WixarikaVRButton } from './WixarikaVRButton.jsx';

/**
 * WixarikaVRCard - Tarjeta 3D Reutilizable con Identidad Cultural Wixárika
 * Diseñada para máxima legibilidad en VR: paleta estricta de 2 colores,
 * tipografías sustancialmente ampliadas para visualización cómoda en cascos/visores
 * y síntesis de contenido por palabras clave.
 */
export function WixarikaVRCard({
  title,
  subtitle,
  category,
  badge,
  description,
  metadata = [],
  actions = [],
  width = 3.20,
  height = 2.05,
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
  const isCantera = variant === 'cantera';
  const theme = WIXARIKA_VARIANTS[variant] || WIXARIKA_VARIANTS.solar;

  // Paleta estricta de 2 colores para tipografía
  const textColor1 = isCantera ? '#1c1917' : VR_TYPOGRAPHY_PALETTE.primary;   // Blanco o carbón profundo
  const textColor2 = isCantera ? '#78350f' : VR_TYPOGRAPHY_PALETTE.secondary; // Oro sagrado cálido o ámbar oscuro

  // Cálculos de espaciado y tamaños tipográficos
  const halfH = height / 2;
  const contentW = width * 0.90;

  const baseBg = isCantera ? '#faf6eb' : (theme.bgIdle || '#070a14');
  const badgeBg = isCantera ? '#f3ebd6' : 'rgba(245, 158, 11, 0.18)';

  // Tipografías sustancialmente ampliadas para garantizar máxima legibilidad en visores VR
  const titleSize = Math.max(0.115, Math.min(0.140, width * 0.042));
  const subtitleSize = Math.max(0.082, Math.min(0.096, width * 0.029));
  const descSize = Math.max(0.086, Math.min(0.100, width * 0.030));
  const metaSize = Math.max(0.078, Math.min(0.088, width * 0.026));
  const badgeSize = Math.max(0.068, Math.min(0.078, width * 0.023));

  // Posicionamiento vertical con suficiente espacio de respiración
  const badgeY = halfH - 0.13;
  const titleY = badgeY - 0.13;
  const isTitleLong = (title?.length || 0) > 26;
  const subtitleY = titleY - (isTitleLong ? 0.20 : 0.16);
  const separatorY = subtitleY - 0.11;
  const descY = separatorY - 0.08;
  const descLineCount = (description?.split('\n')?.length) || 1;
  const metaY = description ? descY - (descLineCount * 0.130 + 0.10) : separatorY - 0.08;
  const actionsY = -halfH + 0.18;

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Marco exterior resplandeciente con borde sagrado */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[width + 0.05, height + 0.05]} />
        <meshBasicMaterial color={theme.borderColor} transparent opacity={0.85} />
      </mesh>

      {/* 2. Placa base (Cantera o fondo sagrado) */}
      <mesh position={[0, 0, -0.002]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={baseBg} transparent opacity={0.96} />
      </mesh>

      {/* 3. Cenefa superior decorativa */}
      <mesh position={[0, halfH - 0.040, 0.001]}>
        <planeGeometry args={[width * 0.94, 0.030]} />
        <meshBasicMaterial color={theme.accentColor} transparent opacity={0.9} />
      </mesh>

      {/* 4. Rombo Tsikuri en el centro del encabezado (Cresta Sagrada) */}
      <TsikuriDiamond
        size={0.14}
        position={[0, halfH + 0.025, 0.005]}
        colors={theme.chaquiraBeads}
      />

      {/* 5. Categoría e insignia destacada (usando paleta de 2 colores) */}
      {category && (
        <group position={[-contentW / 2 + 0.03, badgeY, 0.005]}>
          <Text
            fontSize={badgeSize}
            color={textColor2}
            anchorX="left"
            anchorY="middle"
            letterSpacing={0.06}
          >
            {category.toUpperCase()}
          </Text>
        </group>
      )}

      {badge && (
        <group position={[contentW / 2 - 0.03, badgeY, 0.005]}>
          <mesh position={[-0.24, 0, -0.001]}>
            <planeGeometry args={[0.52, 0.075]} />
            <meshBasicMaterial color={badgeBg} transparent opacity={0.9} />
          </mesh>
          <Text
            position={[-0.24, 0, 0.001]}
            fontSize={badgeSize * 0.95}
            color={textColor2}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.04}
          >
            {badge}
          </Text>
        </group>
      )}

      {/* 6. Título principal (Color 1 - Blanco/Carbón de alto impacto visual) */}
      <Text
        position={[0, titleY, 0.005]}
        fontSize={titleSize}
        color={textColor1}
        anchorX="center"
        anchorY="top"
        maxWidth={contentW * 0.94}
        textAlign="center"
        outlineWidth={isCantera ? 0 : 0.002}
        outlineColor="#040711"
        lineHeight={1.15}
      >
        {title}
      </Text>

      {/* 7. Subtítulo (Color 2 - Oro Sagrado / Ámbar) */}
      {subtitle && (
        <Text
          position={[0, subtitleY, 0.005]}
          fontSize={subtitleSize}
          color={textColor2}
          anchorX="center"
          anchorY="top"
          maxWidth={contentW * 0.94}
          textAlign="center"
        >
          {subtitle}
        </Text>
      )}

      {/* 8. Separador geométrico */}
      <mesh position={[0, separatorY, 0.003]}>
        <planeGeometry args={[contentW * 0.88, 0.005]} />
        <meshBasicMaterial color={theme.borderGlow} transparent opacity={0.6} />
      </mesh>

      {/* 9. Descripción sintetizada en palabras clave de gran tamaño */}
      {description && (
        <Text
          position={[0, descY, 0.005]}
          fontSize={descSize}
          color={textColor1}
          anchorX="center"
          anchorY="top"
          maxWidth={contentW * 0.94}
          textAlign="center"
          lineHeight={1.38}
        >
          {description}
        </Text>
      )}

      {/* 10. Metadatos (Etiqueta en Color 2, Valor en Color 1) */}
      {metadata.length > 0 && (
        <group position={[0, metaY, 0.005]}>
          {metadata.map((item, idx) => {
            const spacing = 0.095;
            const yPos = -idx * spacing;
            return (
              <group key={idx} position={[0, yPos, 0]}>
                <Text
                  position={[-contentW / 2 + 0.05, 0, 0]}
                  fontSize={metaSize}
                  color={textColor2}
                  anchorX="left"
                  anchorY="top"
                >
                  {`${item.label}:`}
                </Text>
                <Text
                  position={[-contentW / 2 + 0.58, 0, 0]}
                  fontSize={metaSize}
                  color={textColor1}
                  anchorX="left"
                  anchorY="top"
                  maxWidth={contentW - 0.64}
                >
                  {item.value}
                </Text>
              </group>
            );
          })}
        </group>
      )}

      {/* 11. Botones de Acción ampliados */}
      {actions.length > 0 && (
        <group position={[0, actionsY, 0.008]}>
          {actions.map((action, idx) => {
            const totalActions = actions.length;
            const btnWidth = Math.min(1.45, (contentW - (totalActions - 1) * 0.12) / totalActions);
            const btnHeight = Math.max(0.24, height * 0.12);
            const totalSpan = totalActions * btnWidth + (totalActions - 1) * 0.12;
            const startX = -totalSpan / 2 + btnWidth / 2;
            const xPos = startX + idx * (btnWidth + 0.12);

            return (
              <WixarikaVRButton
                key={action.id || idx}
                id={action.id || `card-btn-${idx}`}
                label={action.label}
                icon={action.icon}
                iconName={action.iconName}
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
