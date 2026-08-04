const DEFAULT_ATTRIBUTES = Object.freeze({
  alpha: false,
  antialias: false,
  depth: true,
  stencil: false,
  preserveDrawingBuffer: true,
  failIfMajorPerformanceCaveat: false,
  powerPreference: 'high-performance',
});

let lastPreflight = null;

function now() { return typeof performance !== 'undefined' ? performance.now() : Date.now(); }
function safeParameter(gl, parameter) { try { return gl.getParameter(parameter); } catch { return null; } }
function safeExtension(gl, name) { try { return gl.getExtension(name); } catch { return null; } }

function createContext(canvas, preferWebGL2, attributes) {
  const attempts = preferWebGL2 ? ['webgl2', 'webgl', 'experimental-webgl'] : ['webgl', 'experimental-webgl', 'webgl2'];
  for (const kind of attempts) {
    try {
      const gl = canvas.getContext(kind, attributes);
      if (gl) return { gl, kind: kind === 'experimental-webgl' ? 'webgl' : kind };
    } catch { /* A próxima opção será tentada. */ }
  }
  return { gl: null, kind: 'none' };
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('O navegador não criou o shader de validação.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || 'Erro desconhecido de compilação.';
    gl.deleteShader(shader);
    throw new Error(`Falha ao compilar shader: ${log}`);
  }
  return shader;
}

function drawProbe(gl, webgl2) {
  const vertexSource = webgl2
    ? `#version 300 es\nin vec2 position; out vec3 vColor; void main(){ vColor=vec3(position*.5+.5,1.0); gl_Position=vec4(position,0.0,1.0); }`
    : `attribute vec2 position; varying vec3 vColor; void main(){ vColor=vec3(position*.5+.5,1.0); gl_Position=vec4(position,0.0,1.0); }`;
  const fragmentSource = webgl2
    ? `#version 300 es\nprecision mediump float; in vec3 vColor; out vec4 outColor; void main(){ outColor=vec4(vColor,1.0); }`
    : `precision mediump float; varying vec3 vColor; void main(){ gl_FragColor=vec4(vColor,1.0); }`;
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!program) throw new Error('O navegador não criou o programa de validação.');
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, 'position');
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || 'Erro desconhecido de linkagem.';
    gl.deleteProgram(program); gl.deleteShader(vertex); gl.deleteShader(fragment);
    throw new Error(`Falha ao ligar shaders: ${log}`);
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-0.85,-0.75, 0.85,-0.75, 0,0.85]), gl.STATIC_DRAW);
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.015, 0.035, 0.075, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.finish();
  const pixel = new Uint8Array(4);
  gl.readPixels(Math.floor(gl.drawingBufferWidth / 2), Math.floor(gl.drawingBufferHeight / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  const error = gl.getError();
  gl.disableVertexAttribArray(0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.deleteBuffer(buffer);
  gl.deleteProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  return { pixel: [...pixel], error, passed: error === gl.NO_ERROR && pixel[3] > 0 && (pixel[0] + pixel[1] + pixel[2]) > 15 };
}

function classifyTier(capabilities, softwareRenderer) {
  if (!capabilities.drawPassed) return 'unsupported';
  if (softwareRenderer || capabilities.maxTextureSize < 4096 || capabilities.maxRenderbufferSize < 4096 || capabilities.maxVertexTextureUnits < 4) return 'minimal';
  if (capabilities.webglVersion === 1 || capabilities.maxTextureSize < 8192 || capabilities.maxVertexTextureUnits < 8) return 'balanced';
  return 'advanced';
}

async function testContextRecovery(gl, timeoutMs = 1400) {
  const extension = safeExtension(gl, 'WEBGL_lose_context');
  if (!extension) return { supported: false, lost: false, restored: false, durationMs: 0 };
  const canvas = gl.canvas;
  const started = now();
  return new Promise((resolve) => {
    let lost = false;
    let restored = false;
    let timer = 0;
    const finish = () => {
      clearTimeout(timer);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      resolve({ supported: true, lost, restored, durationMs: Math.round((now() - started) * 10) / 10 });
    };
    const onLost = (event) => { event.preventDefault(); lost = true; setTimeout(() => extension.restoreContext(), 60); };
    const onRestored = () => { restored = true; finish(); };
    canvas.addEventListener('webglcontextlost', onLost, { once: true });
    canvas.addEventListener('webglcontextrestored', onRestored, { once: true });
    timer = setTimeout(finish, timeoutMs);
    extension.loseContext();
  });
}

export async function runWebGLPreflight({
  canvas = null,
  preferWebGL2 = true,
  testRecovery = false,
  width = 96,
  height = 96,
  attributes = {},
} = {}) {
  const started = now();
  const target = canvas || document.createElement('canvas');
  target.width = Math.max(16, width);
  target.height = Math.max(16, height);
  const context = createContext(target, preferWebGL2, { ...DEFAULT_ATTRIBUTES, ...attributes });
  if (!context.gl) {
    lastPreflight = {
      generatedAt: new Date().toISOString(), available: false, context: 'none', webglVersion: 0,
      drawPassed: false, shaderPassed: false, tier: 'unsupported', durationMs: Math.round((now() - started) * 10) / 10,
      error: 'O navegador não criou um contexto WebGL 1 ou WebGL 2.',
    };
    window.dispatchEvent(new CustomEvent('fisica:webgl-preflight', { detail: lastPreflight }));
    return { ...lastPreflight };
  }

  const gl = context.gl;
  const debug = safeExtension(gl, 'WEBGL_debug_renderer_info');
  const renderer = debug ? safeParameter(gl, debug.UNMASKED_RENDERER_WEBGL) : safeParameter(gl, gl.RENDERER);
  const vendor = debug ? safeParameter(gl, debug.UNMASKED_VENDOR_WEBGL) : safeParameter(gl, gl.VENDOR);
  const softwareRenderer = /swiftshader|llvmpipe|software|microsoft basic render/i.test(`${renderer || ''} ${vendor || ''}`);
  let draw = { passed: false, pixel: [0,0,0,0], error: -1 };
  let error = '';
  try { draw = drawProbe(gl, context.kind === 'webgl2'); } catch (caught) { error = caught?.message || String(caught); }
  const capabilities = {
    webglVersion: context.kind === 'webgl2' ? 2 : 1,
    drawPassed: draw.passed,
    maxTextureSize: safeParameter(gl, gl.MAX_TEXTURE_SIZE) || 0,
    maxRenderbufferSize: safeParameter(gl, gl.MAX_RENDERBUFFER_SIZE) || 0,
    maxViewportDims: Array.from(safeParameter(gl, gl.MAX_VIEWPORT_DIMS) || [0,0]),
    maxVertexAttribs: safeParameter(gl, gl.MAX_VERTEX_ATTRIBS) || 0,
    maxVertexTextureUnits: safeParameter(gl, gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) || 0,
    maxCombinedTextureUnits: safeParameter(gl, gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS) || 0,
    antialias: Boolean(gl.getContextAttributes()?.antialias),
  };
  const recovery = testRecovery && draw.passed ? await testContextRecovery(gl) : { supported: Boolean(safeExtension(gl, 'WEBGL_lose_context')), lost: false, restored: false, durationMs: 0 };
  if (recovery.restored) {
    try {
      const redraw = drawProbe(gl, context.kind === 'webgl2');
      recovery.redrawPassed = redraw.passed;
      recovery.redrawPixel = redraw.pixel;
    } catch { recovery.redrawPassed = false; }
  }
  lastPreflight = {
    generatedAt: new Date().toISOString(), available: draw.passed, context: context.kind,
    webglVersion: capabilities.webglVersion, shaderPassed: !error, drawPassed: draw.passed,
    readPixel: draw.pixel, glError: draw.error, renderer: renderer || 'não informado', vendor: vendor || 'não informado',
    version: safeParameter(gl, gl.VERSION) || '', shadingLanguageVersion: safeParameter(gl, gl.SHADING_LANGUAGE_VERSION) || '',
    softwareRenderer, capabilities, recovery, tier: classifyTier(capabilities, softwareRenderer),
    durationMs: Math.round((now() - started) * 10) / 10, error: error || null,
  };
  window.dispatchEvent(new CustomEvent('fisica:webgl-preflight', { detail: lastPreflight }));
  return JSON.parse(JSON.stringify(lastPreflight));
}

export function getLastWebGLPreflight() { return lastPreflight ? JSON.parse(JSON.stringify(lastPreflight)) : null; }

export function formatWebGLPreflight(report) {
  if (!report) return 'O teste WebGL ainda não foi executado.';
  if (!report.available) return `WebGL indisponível · ${report.error || 'o teste de desenho falhou'}`;
  const caps = report.capabilities || {};
  const recovery = report.recovery?.supported ? (report.recovery.restored ? 'recuperação aprovada' : 'recuperação não testada') : 'recuperação não suportada';
  return [
    `WebGL ${report.webglVersion} · nível ${report.tier} · ${report.softwareRenderer ? 'renderização por software' : 'renderização gráfica'}`,
    `${report.renderer} · textura máx. ${caps.maxTextureSize || 0}px · renderbuffer ${caps.maxRenderbufferSize || 0}px`,
    `Shader e desenho: ${report.drawPassed ? 'aprovados' : 'falharam'} · pixel ${report.readPixel?.join(', ') || 'n/d'} · ${recovery}`,
    `Pré-teste concluído em ${report.durationMs} ms.`,
  ].join('\n');
}
