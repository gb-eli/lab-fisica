export class LightweightPostFX {
  constructor(THREE, renderer, { enabled = false } = {}) {
    this.THREE = THREE;
    this.renderer = renderer;
    this.enabled = enabled;
    this.target = new THREE.WebGLRenderTarget(1, 1, {
      depthBuffer: true,
      stencilBuffer: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: this.target.texture },
        resolution: { value: new THREE.Vector2(1, 1) },
        bloomStrength: { value: 0.24 },
        vignetteStrength: { value: 0.34 },
        chromaticShift: { value: 0.0007 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec2 resolution;
        uniform float bloomStrength;
        uniform float vignetteStrength;
        uniform float chromaticShift;
        varying vec2 vUv;
        void main(){
          vec2 texel = 1.0 / max(resolution, vec2(1.0));
          vec2 shift = vec2(chromaticShift, 0.0);
          vec3 base;
          base.r = texture2D(tDiffuse, vUv + shift).r;
          base.g = texture2D(tDiffuse, vUv).g;
          base.b = texture2D(tDiffuse, vUv - shift).b;
          vec3 blur = vec3(0.0);
          blur += texture2D(tDiffuse, vUv + texel * vec2(-2.0, 0.0)).rgb;
          blur += texture2D(tDiffuse, vUv + texel * vec2( 2.0, 0.0)).rgb;
          blur += texture2D(tDiffuse, vUv + texel * vec2(0.0, -2.0)).rgb;
          blur += texture2D(tDiffuse, vUv + texel * vec2(0.0,  2.0)).rgb;
          blur *= 0.25;
          vec3 bright = max(blur - vec3(0.62), vec3(0.0));
          vec2 centered = vUv - 0.5;
          float vignette = 1.0 - smoothstep(0.2, 0.76, dot(centered, centered) * 1.55) * vignetteStrength;
          gl_FragColor = vec4((base + bright * bloomStrength) * vignette, 1.0);
        }
      `,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
    this.scene.add(this.quad);
  }

  setEnabled(value) { this.enabled = Boolean(value); }

  setSize(width, height, pixelRatio = 1) {
    const w = Math.max(1, Math.floor(width * pixelRatio));
    const h = Math.max(1, Math.floor(height * pixelRatio));
    this.target.setSize(w, h);
    this.material.uniforms.resolution.value.set(w, h);
  }

  render(scene, camera) {
    if (!this.enabled) {
      this.renderer.setRenderTarget(null);
      this.renderer.render(scene, camera);
      return;
    }
    this.renderer.setRenderTarget(this.target);
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.target.dispose();
    this.quad.geometry.dispose();
    this.material.dispose();
  }
}
