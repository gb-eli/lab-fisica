import { captureTransform, applyTransform, transformsEqual } from './command-history.js';
import { createTransformGizmo } from './transform-gizmo.js';

function clamp(value, [min, max]) { return Math.max(min, Math.min(max, value)); }

export function createInteractionManager({
  THREE, camera, renderer, scene, controller, objects = [], constraints = {}, snapSystem, history,
  connectionManager, onSelection = () => {}, onTransform = () => {}, onMode = () => {}, onFeedback = () => {},
} = {}) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hitPoint = new THREE.Vector3();
  const dragOffset = new THREE.Vector3();
  const outlineBox = new THREE.Box3();
  const outline = new THREE.Box3Helper(outlineBox, 0x6fe8ff);
  outline.visible = false; outline.material.transparent = true; outline.material.opacity = .94; outline.renderOrder = 55;
  scene.add(outline);
  const gizmo = createTransformGizmo(THREE); scene.add(gizmo.group);
  let mode = 'select';
  let selected = null;
  let drag = null;
  let pointerStart = null;
  let longPressTimer = 0;
  const interactiveObjects = [...objects];
  const objectSet = new Set(interactiveObjects);

  function resolveObject(object) {
    let current = object;
    while (current && !objectSet.has(current)) current = current.parent;
    return current || null;
  }
  function eventPointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
  }
  function setSelected(object) {
    selected = object;
    if (!selected) {
      outline.visible = false; gizmo.setTarget(null); onSelection(null); return;
    }
    outlineBox.setFromObject(selected); outline.box.copy(outlineBox); outline.visible = true;
    gizmo.setTarget(selected); gizmo.setMode(mode);
    onSelection(selected);
  }
  function setMode(next) {
    mode = next;
    gizmo.setMode(mode);
    connectionManager?.setVisible(mode === 'connect');
    onMode(mode);
    if (mode === 'connect') onFeedback('Modo conexão: selecione dois terminais.', 'measurement');
  }
  function beginTransform(event, object, handle = null) {
    const type = handle?.userData.gizmoType || mode;
    const axis = handle?.userData.gizmoAxis || (mode === 'rotate' ? 'y' : 'free');
    const before = captureTransform(object);
    const rule = constraints[object.userData.componentId || object.userData.assetId] || {};
    drag = { object, type, axis, before, startX: event.clientX, startY: event.clientY, startPosition: object.position.clone(), startRotation: object.rotation.y, rule };
    if (type === 'move' && axis === 'free') {
      dragPlane.set(new THREE.Vector3(0, 1, 0), -object.position.y);
      if (raycaster.ray.intersectPlane(dragPlane, hitPoint)) dragOffset.copy(object.position).sub(hitPoint);
    }
    controller?.setEnabled(false);
    renderer.domElement.classList.add('is-manipulating');
  }
  function applyMovement(event) {
    if (!drag) return;
    const { object, axis, type, rule } = drag;
    if (type === 'rotate') {
      object.rotation.y = drag.startRotation + (event.clientX - drag.startX) * .012;
    } else if (axis === 'free') {
      eventPointer(event);
      if (raycaster.ray.intersectPlane(dragPlane, hitPoint)) object.position.copy(hitPoint.add(dragOffset));
    } else {
      const scale = Math.max(.0025, camera.position.distanceTo(object.position) * .0012);
      const dx = (event.clientX - drag.startX) * scale;
      const dy = (drag.startY - event.clientY) * scale;
      object.position.copy(drag.startPosition);
      if (axis === 'x') object.position.x += dx;
      if (axis === 'y') object.position.y += dy;
      if (axis === 'z') object.position.z += dx;
    }
    if (rule.x) object.position.x = clamp(object.position.x, rule.x);
    if (rule.y) object.position.y = clamp(object.position.y, rule.y);
    if (rule.z) object.position.z = clamp(object.position.z, rule.z);
    object.updateMatrixWorld(true);
    outlineBox.setFromObject(object); outline.box.copy(outlineBox); gizmo.setTarget(object);
    onTransform(object, { transient: true });
  }
  function finishTransform() {
    if (!drag) return;
    const { object, type, before } = drag;
    if (type === 'rotate') snapSystem?.quantizeRotation(object);
    const zone = type === 'move' ? snapSystem?.apply(object) : null;
    const after = captureTransform(object);
    if (!transformsEqual(before, after)) {
      history?.execute({
        label: `${type === 'rotate' ? 'Girar' : 'Mover'} ${object.userData.componentId || object.userData.assetId || object.name}${zone ? ` · encaixe ${zone.label}` : ''}`,
        do: () => { applyTransform(object, after); onTransform(object); setSelected(object); },
        undo: () => { applyTransform(object, before); onTransform(object); setSelected(object); },
      }, { alreadyApplied: true });
      onFeedback(zone ? `Componente encaixado em ${zone.label}.` : 'Transformação registrada.', zone ? 'success' : 'measurement');
    }
    drag = null;
    controller?.setEnabled(true);
    renderer.domElement.classList.remove('is-manipulating');
    onTransform(object);
  }
  function onPointerDown(event) {
    pointerStart = { x: event.clientX, y: event.clientY, time: performance.now() };
    eventPointer(event);
    if (mode === 'connect' && connectionManager?.terminalGroup.visible) {
      const terminalHit = raycaster.intersectObjects(connectionManager.terminalGroup.children, false)[0];
      if (terminalHit) { connectionManager.selectTerminal(terminalHit.object.userData.terminalId); return; }
    }
    const gizmoHit = selected ? raycaster.intersectObjects(gizmo.handles, true)[0] : null;
    if (gizmoHit && mode !== 'select' && mode !== 'connect') {
      const handle = gizmoHit.object.userData.gizmoRoot || gizmoHit.object.parent?.userData.gizmoRoot || gizmoHit.object;
      beginTransform(event, selected, handle); return;
    }
    const hit = raycaster.intersectObjects(interactiveObjects, true)[0];
    const object = hit ? resolveObject(hit.object) : null;
    if (object) {
      setSelected(object);
      if (mode === 'move' || mode === 'rotate') beginTransform(event, object);
      longPressTimer = window.setTimeout(() => { if (!drag && object) { setMode('move'); beginTransform(event, object); } }, 520);
    } else if (mode === 'select') setSelected(null);
  }
  function onPointerMove(event) {
    if (pointerStart && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 7) clearTimeout(longPressTimer);
    if (drag) { event.preventDefault(); eventPointer(event); applyMovement(event); }
  }
  function onPointerUp(event) {
    clearTimeout(longPressTimer);
    if (drag) finishTransform();
    pointerStart = null;
  }
  function onKeyDown(event) {
    const modifier = event.ctrlKey || event.metaKey;
    if (modifier && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? history?.redo() : history?.undo(); }
    if (modifier && event.key.toLowerCase() === 'y') { event.preventDefault(); history?.redo(); }
    if (event.key === 'Escape') { connectionManager?.cancelPending(); if (drag) { applyTransform(drag.object, drag.before); finishTransform(); } setMode('select'); }
    if (event.key.toLowerCase() === 'g') setMode('move');
    if (event.key.toLowerCase() === 'r') setMode('rotate');
    if (event.key.toLowerCase() === 'c') setMode('connect');
  }
  function update() {
    if (selected) {
      outlineBox.setFromObject(selected); outline.box.copy(outlineBox);
      gizmo.setTarget(selected); gizmo.updateScale(camera);
    }
  }

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove, { passive: false });
  renderer.domElement.addEventListener('pointerup', onPointerUp);
  renderer.domElement.addEventListener('pointercancel', onPointerUp);
  window.addEventListener('keydown', onKeyDown);

  function addObject(object) {
    if (!object || objectSet.has(object)) return false;
    objectSet.add(object); interactiveObjects.push(object); return true;
  }
  function removeObject(object) {
    if (!objectSet.has(object)) return false;
    objectSet.delete(object);
    const index = interactiveObjects.indexOf(object);
    if (index >= 0) interactiveObjects.splice(index, 1);
    if (selected === object) setSelected(null);
    return true;
  }

  return {
    setMode, addObject, removeObject,
    select: setSelected,
    update,
    get mode() { return mode; },
    get selected() { return selected; },
    dispose() {
      clearTimeout(longPressTimer);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      scene.remove(outline, gizmo.group);
      outline.material.dispose();
      gizmo.dispose();
    },
  };
}
