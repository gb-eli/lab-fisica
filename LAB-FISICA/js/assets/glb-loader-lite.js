const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

const COMPONENTS = {
  5120: { ArrayType: Int8Array, bytes: 1 },
  5121: { ArrayType: Uint8Array, bytes: 1 },
  5122: { ArrayType: Int16Array, bytes: 2 },
  5123: { ArrayType: Uint16Array, bytes: 2 },
  5125: { ArrayType: Uint32Array, bytes: 4 },
  5126: { ArrayType: Float32Array, bytes: 4 },
};
const TYPE_SIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };

function parseContainer(buffer) {
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== GLB_MAGIC) throw new Error('Arquivo GLB inválido.');
  if (view.getUint32(4, true) !== 2) throw new Error('Somente GLB 2.0 é suportado.');
  const total = view.getUint32(8, true);
  let offset = 12;
  let json;
  let binary;
  while (offset < total) {
    const length = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    offset += 8;
    const chunk = buffer.slice(offset, offset + length);
    if (type === JSON_CHUNK) json = JSON.parse(new TextDecoder().decode(chunk).replace(/\0+$/g, '').trim());
    if (type === BIN_CHUNK) binary = chunk;
    offset += length;
  }
  if (!json || !binary) throw new Error('GLB sem bloco JSON ou BIN.');
  return { json, binary };
}

function readAccessor(gltf, binary, accessorIndex) {
  const accessor = gltf.accessors[accessorIndex];
  const bufferView = gltf.bufferViews[accessor.bufferView];
  const component = COMPONENTS[accessor.componentType];
  const itemSize = TYPE_SIZE[accessor.type];
  if (!component || !itemSize) throw new Error(`Accessor não suportado: ${accessor.componentType}/${accessor.type}`);
  const stride = bufferView.byteStride || component.bytes * itemSize;
  const start = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
  const packed = stride === component.bytes * itemSize && start % component.bytes === 0;
  if (packed) return new component.ArrayType(binary, start, accessor.count * itemSize).slice();
  const out = new component.ArrayType(accessor.count * itemSize);
  const view = new DataView(binary);
  const getters = {
    5120: 'getInt8', 5121: 'getUint8', 5122: 'getInt16', 5123: 'getUint16',
    5125: 'getUint32', 5126: 'getFloat32',
  };
  const getter = getters[accessor.componentType];
  for (let index = 0; index < accessor.count; index += 1) {
    for (let componentIndex = 0; componentIndex < itemSize; componentIndex += 1) {
      const byteOffset = start + index * stride + componentIndex * component.bytes;
      out[index * itemSize + componentIndex] = view[getter](byteOffset, true);
    }
  }
  return out;
}

function createMaterial(THREE, definition = {}) {
  const pbr = definition.pbrMetallicRoughness || {};
  const color = pbr.baseColorFactor || [1, 1, 1, 1];
  const emissive = definition.emissiveFactor || [0, 0, 0];
  const transparent = color[3] < 0.999 || definition.alphaMode === 'BLEND';
  return new THREE.MeshPhysicalMaterial({
    name: definition.name || 'GLB_MATERIAL',
    color: new THREE.Color(color[0], color[1], color[2]),
    opacity: color[3],
    transparent,
    depthWrite: !transparent,
    metalness: pbr.metallicFactor ?? 0,
    roughness: pbr.roughnessFactor ?? 1,
    emissive: new THREE.Color(emissive[0], emissive[1], emissive[2]),
    emissiveIntensity: definition.name?.includes('EMISSIVE') ? 1.25 : 1,
    side: definition.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
  });
}

function applyNodeTransform(THREE, object, node) {
  if (node.matrix) {
    object.matrix.fromArray(node.matrix);
    object.matrix.decompose(object.position, object.quaternion, object.scale);
    return;
  }
  if (node.translation) object.position.fromArray(node.translation);
  if (node.rotation) object.quaternion.fromArray(node.rotation);
  if (node.scale) object.scale.fromArray(node.scale);
}

export async function loadGlbLite(THREE, url, { signal } = {}) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Falha ao carregar ${url}: ${response.status}`);
  const { json: gltf, binary } = parseContainer(await response.arrayBuffer());
  const materials = (gltf.materials || []).map((definition) => createMaterial(THREE, definition));
  const meshObjects = (gltf.meshes || []).map((meshDefinition, meshIndex) => {
    const group = new THREE.Group();
    group.name = meshDefinition.name || `mesh-${meshIndex}`;
    (meshDefinition.primitives || []).forEach((primitive, primitiveIndex) => {
      if ((primitive.mode ?? 4) !== 4) throw new Error('O loader leve aceita somente triângulos.');
      const geometry = new THREE.BufferGeometry();
      Object.entries(primitive.attributes || {}).forEach(([semantic, accessorIndex]) => {
        const accessor = gltf.accessors[accessorIndex];
        const values = readAccessor(gltf, binary, accessorIndex);
        const attributeName = { POSITION: 'position', NORMAL: 'normal', TEXCOORD_0: 'uv', COLOR_0: 'color' }[semantic];
        if (!attributeName) return;
        geometry.setAttribute(attributeName, new THREE.BufferAttribute(values, TYPE_SIZE[accessor.type], accessor.normalized === true));
      });
      if (primitive.indices !== undefined) geometry.setIndex(new THREE.BufferAttribute(readAccessor(gltf, binary, primitive.indices), 1));
      if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      const material = materials[primitive.material] || new THREE.MeshStandardMaterial({ color: 0x8fa2ad, roughness: 0.6 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `${group.name}${primitiveIndex ? `-${primitiveIndex}` : ''}`;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
    });
    return group;
  });
  const nodeObjects = (gltf.nodes || []).map((node, index) => {
    const object = node.mesh !== undefined ? meshObjects[node.mesh] : new THREE.Group();
    object.name = node.name || object.name || `node-${index}`;
    applyNodeTransform(THREE, object, node);
    return object;
  });
  (gltf.nodes || []).forEach((node, index) => (node.children || []).forEach((child) => nodeObjects[index].add(nodeObjects[child])));
  const root = new THREE.Group();
  root.name = gltf.asset?.generator ? `GLB:${gltf.asset.generator}` : 'GLBAsset';
  const activeScene = gltf.scenes?.[gltf.scene || 0];
  (activeScene?.nodes || []).forEach((nodeIndex) => root.add(nodeObjects[nodeIndex]));
  root.userData.gltf = { asset: gltf.asset, extras: gltf.extras };
  return root;
}
