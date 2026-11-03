#!/usr/bin/env python3
"""
Generador de Sala de Museo Wixárika v14 (.GLB)
Basado en: public/museo_wixarika_v13.glb

Ajustes v14 (Revisión y Feedback del Usuario):
1. Cuadros de las Deidades y Fiestas:
   - Elevados de Y=1.85m a Y=2.95m para quedar centrados verticalmente en la pared de 5.4m.
   - Escalados a 1.30x (lienzo monumental de ~2.0m x 2.0m) aprovechando mejor el espacio vertical.
   - Placas de cédula elevadas de Y=0.88m a Y=1.40m (altura ergonómica de lectura natural).
2. Corrección Integral de Marcos y Fondos en Letreros:
   - En Fiestas: La escala de 1.35x se aplica al nodo PADRE de la placa (placa_fiesta_xxx),
     preservando las escalas idénticas entre la base de madera, cantera, texto blanco y marco de oro.
     El marco rodea perfectamente el fondo blanco sin desbordamientos.
   - En Deidades: Escala de 1.35x en el nodo PADRE (placa_deidad_xxx), marco y texto unificados.
   - En Gastronomía: Escala de 1.35x en el nodo PADRE (letrero_xxx), peana de madera, marco de oro y texto unificados.
3. Altura de paredes y techo:
   - Muro cilíndrico extendido a 5.40m de altura vertical.
   - Cornisa de madera a Y=5.30m.
   - Cenefa sagrada 360 a Y=5.05m.
   - 8 Pilastras estiradas hasta la cornisa.
   - Techo cónico y 16 vigas radiales elevados +1.60m (base en Y=5.30m, óculo en Y=7.00m).
   - Letreros colgantes de sección elevados a Y=4.10m y escalados a 1.50x (despeje total con cuadros).
4. Búfer binario PBR preservado al 100%.
"""

import json
import os
import struct
import sys

def main():
    input_path = os.path.join('public', 'museo_wixarika_v13.glb')
    output_path = os.path.join('public', 'museo_wixarika_v14.glb')

    if not os.path.exists(input_path):
        print(f"Error: No se encontró el archivo base en {input_path}", file=sys.stderr)
        sys.exit(1)

    print(f"=== Generando Museo Wixárika v14 (Centrado de Deidades y Marcos Unificados) ===")
    print(f"Cargando base: {input_path}")

    with open(input_path, 'rb') as f:
        magic = f.read(4)
        version = int.from_bytes(f.read(4), 'little')
        total_len = int.from_bytes(f.read(4), 'little')

        if magic != b'glTF' or version != 2:
            print("Error: El archivo no es un glTF binario v2 válido.", file=sys.stderr)
            sys.exit(1)

        c0_len = int.from_bytes(f.read(4), 'little')
        c0_type = f.read(4)
        c0_data = f.read(c0_len)

        c1_len = int.from_bytes(f.read(4), 'little')
        c1_type = f.read(4)
        c1_data = f.read(c1_len)

    gltf = json.loads(c0_data.decode('utf-8'))
    nodes = gltf['nodes']

    # --------------------------------------------------------------------------
    # 1. Altura de paredes perpendiculares y elevación del techo
    # --------------------------------------------------------------------------
    DELTA_WALL_Y = 1.60
    SCALE_WALL_Y = (3.80 + DELTA_WALL_Y) / 3.80  # ≈ 1.42105

    # Muro cilíndrico vertical (nodo 812)
    muro = nodes[812]
    muro['translation'] = [0.0, 2.70, 0.0]
    muro['scale'] = [1.0, SCALE_WALL_Y, 1.0]

    # Cornisa superior de madera (nodo 730)
    cornisa = nodes[730]
    cornisa['translation'] = [0.0, 3.70 + DELTA_WALL_Y, 0.0]

    # Cenefa sagrada 360 (nodo 729)
    cenefa = nodes[729]
    cenefa['translation'] = [0.0, DELTA_WALL_Y, 0.0]

    # 8 Pilastras perimetrales
    for p_idx in [740, 750, 760, 770, 780, 790, 800, 810]:
        nodes[p_idx]['scale'] = [1.0, SCALE_WALL_Y, 1.0]

    # Techo domo cónico completo (nodo 979)
    techo = nodes[979]
    techo['translation'] = [0.0, DELTA_WALL_Y, 0.0]

    # Nichos de pared (nodos 247 deidades, 477 fiestas, 559 gastronomía)
    for n_idx in [247, 477, 559]:
        nodes[n_idx]['translation'] = [0.0, 2.90, 0.0]
        nodes[n_idx]['scale'] = [1.0, 1.45, 1.0]

    print("✓ Arquitectura de muros y techo: Pared a 5.40m, cornisa a 5.30m, techo elevado +1.60m")

    # --------------------------------------------------------------------------
    # 2. Cuadros de las Deidades: Centrados verticalmente y aprovechando el espacio
    # --------------------------------------------------------------------------
    DEIDADES_Y = 2.95          # Centro vertical del cuadro en el muro de 5.4m
    DEIDADES_SCALE = 1.30      # Cuadros de ~2.0m x 2.0m monumentales
    DEIDADES_PLACA_Y = 1.40    # Placa a nivel de ojos (lectura ergonómica de pie)

    deidades_cuadros = [46, 83, 129, 168, 204, 237]
    for c_idx in deidades_cuadros:
        nodes[c_idx]['translation'] = [0.0, DEIDADES_Y, 0.0]
        nodes[c_idx]['scale'] = [DEIDADES_SCALE, DEIDADES_SCALE, DEIDADES_SCALE]

    deidades_placas = [55, 92, 138, 177, 213, 245]
    for p_idx in deidades_placas:
        nodes[p_idx]['translation'] = [0.0, DEIDADES_PLACA_Y, 0.0]
        nodes[p_idx]['scale'] = [1.35, 1.35, 1.35]

    print(f"✓ Cuadros de Deidades: Elevados a Y={DEIDADES_Y}m y escalados a {DEIDADES_SCALE}x (centrados verticalmente)")
    print(f"✓ Placas de Deidades: Elevadas a Y={DEIDADES_PLACA_Y}m y escaladas a 1.35x (marco y texto unificados)")

    # --------------------------------------------------------------------------
    # 3. Cuadros y Placas de Fiestas y Ceremonias (Corrección de marcos)
    # --------------------------------------------------------------------------
    fiestas_cuadros = [282, 308, 334]
    for fc_idx in fiestas_cuadros:
        nodes[fc_idx]['translation'] = [0.0, DEIDADES_Y, 0.0]
        # v13 tenía scale [1.16, 1.16, 1.16], aplicamos factor para igualar deidades
        nodes[fc_idx]['scale'] = [1.16 * 1.12, 1.16 * 1.12, 1.16 * 1.12]

    # Placas de fiestas: Escalar el nodo PADRE, restaurando escalas idénticas en hijos
    fiestas_placas_config = [
        # (padre_idx, [hijos_indices], scale_hijo_original)
        (287, [283, 284, 285, 286], 1.152711272239685),
        (313, [309, 310, 311, 312], 1.147471308708191),
        (340, [335, 336, 337, 338, 339], 1.144365906715393)
    ]

    for p_padre, hijos, s_hijo in fiestas_placas_config:
        # Elevar placa completa
        nodes[p_padre]['translation'] = [0.0, DEIDADES_PLACA_Y, 0.0]
        # Escalar nodo padre al 1.35x de su base original (1.08 * 1.35 ≈ 1.458)
        nodes[p_padre]['scale'] = [1.08 * 1.35, 1.08 * 1.35, 1.08 * 1.35]
        # Restaurar escala idéntica en TODOS los hijos para que el marco de oro y la madera rodeen perfecto el texto
        for h_idx in hijos:
            nodes[h_idx]['scale'] = [s_hijo, s_hijo, s_hijo]

    print(f"✓ Cuadros de Fiestas: Elevados a Y={DEIDADES_Y}m alineados con Deidades")
    print(f"✓ Placas de Fiestas: Elevadas a Y={DEIDADES_PLACA_Y}m con marco de oro y fondo blanco 100% acoplados sin desbordes")

    # --------------------------------------------------------------------------
    # 4. Letreros de Sección Colgantes (Umbrales despejados)
    # --------------------------------------------------------------------------
    # Colocados a Y=4.10m para flotar sobre el campo de visión sin tapar los cuadros en Y=2.95m
    seccion_indices = [
        (1001, 'letrero_seccion_bienvenida', [0.0688, 4.10, 4.806]),
        (1027, 'letrero_seccion_deidades', [0.0709, 4.10, -4.796]),
        (1051, 'letrero_seccion_fiestas', [-4.800, 4.10, -0.130]),
        (1077, 'letrero_seccion_gastronomia', [4.800, 4.10, 0.130])
    ]
    for s_idx, s_name, new_t in seccion_indices:
        nodes[s_idx]['translation'] = new_t
        nodes[s_idx]['scale'] = [1.50, 1.50, 1.50]

    print("✓ Letreros de sección: Elevados a Y=4.10m a 1.50x (vista limpia hacia los cuadros de las paredes)")

    # --------------------------------------------------------------------------
    # 5. Letreros y Comidas de Gastronomía en las Mesas
    # --------------------------------------------------------------------------
    # Mesa Norte: Tortillas (-1.02), Tamales (0.00), Atole (+1.02)
    nodes[501]['translation'] = [-1.02, 0.885, -0.12]
    nodes[497]['translation'] = [0.00, 0.885, -0.12]
    nodes[490]['translation'] = [1.02, 0.885, -0.08]

    # Letreros (Z = +0.26m -> 38cm libre frontal con comida, Y = 1.05m sobre tablero)
    nodes[513]['translation'] = [-1.02, 1.050, 0.26]
    nodes[513]['scale'] = [1.35, 1.35, 1.35]

    nodes[509]['translation'] = [0.00, 1.050, 0.26]
    nodes[509]['scale'] = [1.35, 1.35, 1.35]

    nodes[505]['translation'] = [1.02, 1.050, 0.26]
    nodes[505]['scale'] = [1.35, 1.35, 1.35]

    # Mesa Sur: Caldo (-1.02), Maíz (0.00), Perruri (+1.02)
    nodes[529]['translation'] = [-1.02, 0.885, -0.12]
    nodes[533]['translation'] = [0.00, 0.885, -0.12]
    nodes[539]['translation'] = [1.02, 0.885, -0.12]

    nodes[543]['translation'] = [-1.02, 1.050, 0.26]
    nodes[543]['scale'] = [1.35, 1.35, 1.35]

    nodes[547]['translation'] = [0.00, 1.050, 0.26]
    nodes[547]['scale'] = [1.35, 1.35, 1.35]

    nodes[551]['translation'] = [1.02, 1.050, 0.26]
    nodes[551]['scale'] = [1.35, 1.35, 1.35]

    # Letrero de elotes en repisa
    nodes[568]['translation'] = [0.45, 0.16, 0.10]
    nodes[568]['scale'] = [1.35, 1.35, 1.35]

    print("✓ Letreros de gastronomía: Escalados a 1.35x con marcos de oro y peanas acopladas, cero encimados")

    # --------------------------------------------------------------------------
    # 6. Re-empaquetado del GLB v14
    # --------------------------------------------------------------------------
    new_json_bytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    padding_needed = (4 - (len(new_json_bytes) % 4)) % 4
    new_json_bytes += b' ' * padding_needed

    new_c0_len = len(new_json_bytes)
    new_total_len = 12 + 8 + new_c0_len + 8 + c1_len

    print(f"\nEscribiendo archivo binario: {output_path}")
    with open(output_path, 'wb') as out_f:
        out_f.write(b'glTF')
        out_f.write(struct.pack('<I', 2))
        out_f.write(struct.pack('<I', new_total_len))

        out_f.write(struct.pack('<I', new_c0_len))
        out_f.write(b'JSON')
        out_f.write(new_json_bytes)

        out_f.write(struct.pack('<I', c1_len))
        out_f.write(b'BIN\x00')
        out_f.write(c1_data)

    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"¡Listo! Archivo generado: {output_path} ({size_mb:.2f} MB)")

if __name__ == '__main__':
    main()
