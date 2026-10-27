const fs = require('fs');

function parseGlb(filePath) {
  const buf = fs.readFileSync(filePath);
  const jsonLen = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
  return { gltf, buf };
}

const { gltf: v3, buf: v3Buf } = parseGlb('public/museo_wixarika_v3.glb');
const { gltf: v4, buf: v4Buf } = parseGlb('public/museo_wixarika_v4.glb');

console.log('=== V3 vs V4 Global Metrics ===');
console.log('V3 - Size:', (v3Buf.length / 1024).toFixed(2), 'KB | Generator:', v3.asset?.generator);
console.log('V4 - Size:', (v4Buf.length / 1024).toFixed(2), 'KB | Generator:', v4.asset?.generator);
console.log('V3 - Nodes:', v3.nodes.length, '| Meshes:', v3.meshes.length, '| Materials:', v3.materials.length);
console.log('V4 - Nodes:', v4.nodes.length, '| Meshes:', v4.meshes.length, '| Materials:', v4.materials.length);

function getMeshStats(gltf) {
  let totalVerts = 0;
  let totalTris = 0;
  gltf.meshes.forEach(mesh => {
    mesh.primitives.forEach(prim => {
      const posAccIdx = prim.attributes.POSITION;
      if (posAccIdx !== undefined) {
        totalVerts += gltf.accessors[posAccIdx].count;
      }
      if (prim.indices !== undefined) {
        totalTris += gltf.accessors[prim.indices].count / 3;
      } else if (posAccIdx !== undefined) {
        totalTris += gltf.accessors[posAccIdx].count / 3;
      }
    });
  });
  return { totalVerts, totalTris: Math.round(totalTris) };
}

const v3Stats = getMeshStats(v3);
const v4Stats = getMeshStats(v4);

console.log('V3 - Vertices:', v3Stats.totalVerts, '| Triangles:', v3Stats.totalTris);
console.log('V4 - Vertices:', v4Stats.totalVerts, '| Triangles:', v4Stats.totalTris);

function cleanName(n) {
  if (!n) return '';
  return n.replace(/\.\d+$/, '').trim();
}

function getNodeHierarchy(gltf, nodeIdx, parentPath = '') {
  const node = gltf.nodes[nodeIdx];
  const rawName = node.name || '';
  const currentPath = parentPath ? (parentPath + ' / ' + (rawName || ('idx_' + nodeIdx))) : (rawName || ('idx_' + nodeIdx));
  const result = [{ rawName, cleanName: cleanName(rawName), path: currentPath, node, idx: nodeIdx }];
  if (node.children) {
    node.children.forEach(cIdx => {
      result.push(...getNodeHierarchy(gltf, cIdx, currentPath));
    });
  }
  return result;
}

const v3RootIdx = v3.scenes[v3.scene || 0].nodes[0];
const v3Tree = getNodeHierarchy(v3, v3RootIdx);

const v4RootIdx = v4.scenes[v4.scene || 0].nodes.find(idx => v4.nodes[idx].name && v4.nodes[idx].name.startsWith('museo_wixarika_base'));
const v4Tree = getNodeHierarchy(v4, v4RootIdx);

// Filter out unnamed or pure Node_###
const isSemanticName = (name) => {
  if (!name) return false;
  if (/^Node_\d+$/.test(name)) return false;
  if (/^Mesh_\d+$/.test(name)) return false;
  return true;
};

const v3SemanticNodes = v3Tree.filter(n => isSemanticName(n.cleanName));
const v4SemanticNodes = v4Tree.filter(n => isSemanticName(n.cleanName));

const v4CleanNamesSet = new Set(v4SemanticNodes.map(n => n.cleanName));
const v3CleanNamesSet = new Set(v3SemanticNodes.map(n => n.cleanName));

const semanticMissing = v3SemanticNodes.filter(n => !v4CleanNamesSet.has(n.cleanName));
const semanticAdded = v4SemanticNodes.filter(n => !v3CleanNamesSet.has(n.cleanName));

console.log('\n========================================');
console.log('SEMANTIC NODES IN V3 BUT MISSING IN V4 (' + semanticMissing.length + '):');
const uniqueMissing = [...new Set(semanticMissing.map(n => n.cleanName))];
uniqueMissing.forEach(name => {
  const example = semanticMissing.find(n => n.cleanName === name);
  console.log('  * ' + name + ' (path: ' + example.path + ')');
});

console.log('\n========================================');
console.log('SEMANTIC NODES IN V4 NOT IN V3 (' + semanticAdded.length + '):');
const uniqueAdded = [...new Set(semanticAdded.map(n => n.cleanName))];
uniqueAdded.forEach(name => {
  const example = semanticAdded.find(n => n.cleanName === name);
  console.log('  + ' + name + ' (path: ' + example.path + ')');
});

// Check Tatewari aura in V4
console.log('\n========================================');
console.log('TATEWARI AURA IN V4:');
const tatewariNodesInV4 = v4Tree.filter(n => n.path.includes('tatewari'));
console.log('Found', tatewariNodesInV4.length, 'nodes mentioning tatewari in v4:');
tatewariNodesInV4.forEach(n => console.log('  - ' + n.rawName));

// Check textures & images in V4
console.log('\n========================================');
console.log('TEXTURES & IMAGES IN V4:');
console.log('V4 textures:', v4.textures);
console.log('V4 images:', v4.images);
if (v4.images && v4.images[0]) {
  console.log('V4 image 0 name:', v4.images[0].name, 'mimeType:', v4.images[0].mimeType);
}
