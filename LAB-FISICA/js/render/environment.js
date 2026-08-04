export function createProceduralEnvironment(THREE, renderer, {
  upper = '#071929', horizon = '#2488ad', lower = '#02050a', accent = '#83e7ff',
} = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, upper);
  gradient.addColorStop(0.48, horizon);
  gradient.addColorStop(0.58, '#0b2333');
  gradient.addColorStop(1, lower);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const glow = context.createRadialGradient(710, 210, 8, 710, 210, 230);
  glow.addColorStop(0, `${accent}cc`);
  glow.addColorStop(0.18, `${accent}36`);
  glow.addColorStop(1, 'transparent');
  context.fillStyle = glow;
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < canvas.width; x += 128) {
    context.fillStyle = 'rgba(255,255,255,.025)';
    context.fillRect(x, 0, 2, canvas.height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const target = pmrem.fromEquirectangular(texture);
  texture.dispose();
  pmrem.dispose();
  return {
    texture: target.texture,
    dispose() { target.dispose(); },
  };
}
