export function createOrbitController({
  element,
  camera,
  target = { x: 0, y: 0, z: 0 },
  yaw = 0.72,
  pitch = 0.2,
  radius = 12,
  minRadius = 5,
  maxRadius = 22,
  minPitch = -0.45,
  maxPitch = 0.78,
  heightFactor = 1,
  sensitivity = 0.005,
  inertia = 0.86,
}) {
  const initial = { yaw, pitch, radius, target: { ...target } };
  let enabled = true;
  const mutableTarget = { ...target };
  const pointers = new Map();
  let dragging = false;
  let velocityYaw = 0;
  let velocityPitch = 0;
  let zoomVelocity = 0;
  let pinchDistance = 0;
  let pinchRadius = radius;
  let pinchMidpoint = null;
  let lastTapAt = 0;
  let tapOrigin = null;

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const pointerValues = () => [...pointers.values()];
  const pointerDistance = () => {
    const values = pointerValues();
    return values.length < 2 ? 0 : Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y);
  };
  const pointerMidpoint = () => {
    const values = pointerValues();
    return values.length < 2 ? null : { x: (values[0].x + values[1].x) / 2, y: (values[0].y + values[1].y) / 2 };
  };

  function updateCamera() {
    if (enabled && !dragging && pointers.size === 0) {
      yaw += velocityYaw;
      pitch = clamp(pitch + velocityPitch, minPitch, maxPitch);
      radius = clamp(radius + zoomVelocity, minRadius, maxRadius);
      velocityYaw *= inertia;
      velocityPitch *= inertia;
      zoomVelocity *= 0.82;
      if (Math.abs(velocityYaw) < 0.00002) velocityYaw = 0;
      if (Math.abs(velocityPitch) < 0.00002) velocityPitch = 0;
      if (Math.abs(zoomVelocity) < 0.0004) zoomVelocity = 0;
    }
    camera.position.set(
      mutableTarget.x + Math.sin(yaw) * Math.cos(pitch) * radius,
      mutableTarget.y + Math.sin(pitch) * radius * heightFactor,
      mutableTarget.z + Math.cos(yaw) * Math.cos(pitch) * radius,
    );
    camera.lookAt(mutableTarget.x, mutableTarget.y, mutableTarget.z);
  }

  function onPointerDown(event) {
    if (!enabled) return;
    element.focus?.({ preventScroll: true });
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY });
    element.setPointerCapture?.(event.pointerId);
    tapOrigin = { x: event.clientX, y: event.clientY };
    velocityYaw = velocityPitch = zoomVelocity = 0;
    if (pointers.size === 1) dragging = true;
    if (pointers.size >= 2) {
      dragging = false;
      pinchDistance = pointerDistance();
      pinchRadius = radius;
      pinchMidpoint = pointerMidpoint();
    }
  }

  function onPointerMove(event) {
    if (!enabled || !pointers.has(event.pointerId)) return;
    const previous = pointers.get(event.pointerId);
    pointers.set(event.pointerId, { ...previous, x: event.clientX, y: event.clientY });
    if (pointers.size >= 2) {
      const distance = pointerDistance();
      const midpoint = pointerMidpoint();
      if (distance && pinchDistance) radius = clamp(pinchRadius * pinchDistance / distance, minRadius, maxRadius);
      if (midpoint && pinchMidpoint) {
        const factor = radius * 0.00125;
        const dx = (midpoint.x - pinchMidpoint.x) * factor;
        const dy = (midpoint.y - pinchMidpoint.y) * factor;
        mutableTarget.x -= Math.cos(yaw) * dx + Math.sin(yaw) * dy * 0.35;
        mutableTarget.z += Math.sin(yaw) * dx - Math.cos(yaw) * dy * 0.35;
        mutableTarget.y += dy * 0.55;
        pinchMidpoint = midpoint;
      }
      return;
    }
    if (!dragging) return;
    const dx = event.clientX - previous.x;
    const dy = event.clientY - previous.y;
    const yawDelta = -dx * sensitivity;
    const pitchDelta = dy * sensitivity * 0.8;
    yaw += yawDelta;
    pitch = clamp(pitch + pitchDelta, minPitch, maxPitch);
    velocityYaw = yawDelta * 0.72;
    velocityPitch = pitchDelta * 0.72;
  }

  function onPointerUp(event) {
    if (!enabled) return;
    const current = pointers.get(event.pointerId);
    pointers.delete(event.pointerId);
    dragging = pointers.size === 1;
    if (pointers.size >= 2) {
      pinchDistance = pointerDistance();
      pinchRadius = radius;
      pinchMidpoint = pointerMidpoint();
    } else {
      pinchDistance = 0;
      pinchMidpoint = null;
    }
    if (current && tapOrigin) {
      const moved = Math.hypot(current.x - tapOrigin.x, current.y - tapOrigin.y);
      const now = performance.now();
      if (moved < 12 && now - lastTapAt < 320) reset();
      lastTapAt = moved < 12 ? now : 0;
    }
  }

  function onWheel(event) {
    if (!enabled) return;
    event.preventDefault();
    zoomVelocity += event.deltaY * 0.0024;
  }

  function onKeyDown(event) {
    if (!enabled) return;
    const commands = {
      ArrowLeft: () => rotate(0.12), ArrowRight: () => rotate(-0.12), ArrowUp: () => rotate(0, -0.08), ArrowDown: () => rotate(0, 0.08),
      '+': () => zoom(0.88), '=': () => zoom(0.88), '-': () => zoom(1.12), '0': reset,
    };
    const action = commands[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  }

  element.tabIndex = element.tabIndex >= 0 ? element.tabIndex : 0;
  element.style.touchAction = 'none';
  element.addEventListener('pointerdown', onPointerDown);
  element.addEventListener('pointermove', onPointerMove);
  element.addEventListener('pointerup', onPointerUp);
  element.addEventListener('pointercancel', onPointerUp);
  element.addEventListener('wheel', onWheel, { passive: false });
  element.addEventListener('keydown', onKeyDown);
  updateCamera();

  function rotate(deltaYaw, deltaPitch = 0) {
    yaw += deltaYaw;
    pitch = clamp(pitch + deltaPitch, minPitch, maxPitch);
    velocityYaw = velocityPitch = 0;
    updateCamera();
  }
  function zoom(factor = 1) {
    radius = clamp(radius * factor, minRadius, maxRadius);
    zoomVelocity = 0;
    updateCamera();
  }
  function reset() {
    ({ yaw, pitch, radius } = initial);
    Object.assign(mutableTarget, initial.target);
    velocityYaw = velocityPitch = zoomVelocity = 0;
    updateCamera();
  }

  return {
    update: updateCamera,
    rotate,
    zoom,
    reset,
    setRadius(value) { radius = clamp(value, minRadius, maxRadius); updateCamera(); },
    setTarget(value) { Object.assign(mutableTarget, value); updateCamera(); },
    setPose(value = {}) {
      if (Number.isFinite(value.yaw)) yaw = value.yaw;
      if (Number.isFinite(value.pitch)) pitch = clamp(value.pitch, minPitch, maxPitch);
      if (Number.isFinite(value.radius)) radius = clamp(value.radius, minRadius, maxRadius);
      if (value.target) Object.assign(mutableTarget, value.target);
      velocityYaw = velocityPitch = zoomVelocity = 0;
      updateCamera();
    },
    setEnabled(value) { enabled = Boolean(value); if (!enabled) { pointers.clear(); dragging = false; pinchDistance = 0; velocityYaw = velocityPitch = zoomVelocity = 0; } },
    focus(value, nextRadius = radius) { Object.assign(mutableTarget, value); radius = clamp(nextRadius, minRadius, maxRadius); updateCamera(); },
    get isInteracting() { return enabled && (dragging || pointers.size > 0 || Math.abs(velocityYaw) > 0.0001 || Math.abs(velocityPitch) > 0.0001); },
    get enabled() { return enabled; },
    get state() { return { yaw, pitch, radius, target: { ...mutableTarget } }; },
    dispose() {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointercancel', onPointerUp);
      element.removeEventListener('wheel', onWheel);
      element.removeEventListener('keydown', onKeyDown);
      pointers.clear();
    },
  };
}
