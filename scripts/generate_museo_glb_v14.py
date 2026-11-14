#!/usr/bin/env python3
"""
Generador de Sala de Museo Wixárika v14 (.GLB)
Envuelve y ejecuta scripts/generate_museo_glb_v14.js
para incorporar texto 3D extruido de alta precisión con Three.js
"""

import os
import subprocess
import sys

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    js_script = os.path.join(script_dir, 'generate_museo_glb_v14.js')

    if not os.path.exists(js_script):
        print(f"Error: No se encontró el script JS en {js_script}", file=sys.stderr)
        sys.exit(1)

    result = subprocess.run(['node', js_script], check=True)
    sys.exit(result.returncode)

if __name__ == '__main__':
    main()
