import { createDynamicCableSystem } from '../render/cables.js';

function connectionKey(a, b) { return [a, b].sort().join('::'); }

export class ConnectionManager {
  constructor(THREE, scene, { terminals = [], history, onChange = () => {}, onFeedback = () => {} } = {}) {
    this.THREE = THREE;
    this.scene = scene;
    this.history = history;
    this.onChange = onChange;
    this.onFeedback = onFeedback;
    this.terminals = new Map(terminals.map((terminal) => [terminal.id, terminal]));
    this.connections = new Map();
    this.pendingTerminal = null;
    this.terminalGroup = new THREE.Group();
    this.terminalGroup.name = 'ELECTRICAL_TERMINALS';
    this.terminalGroup.visible = false;
    scene.add(this.terminalGroup);
    this.createTerminalVisuals();
  }

  createTerminalVisual(terminal) {
    const color = terminal.polarity === 'positive' ? 0xff3f4f : terminal.polarity === 'negative' ? 0x65bfff : 0xffd766;
    const mesh = new this.THREE.Mesh(
      new this.THREE.SphereGeometry(.075, 16, 16),
      new this.THREE.MeshBasicMaterial({ color, transparent: true, opacity: .82, toneMapped: false, depthTest: false }),
    );
    mesh.name = `TERMINAL_${terminal.id}`;
    mesh.userData.terminalId = terminal.id;
    mesh.renderOrder = 60;
    mesh.visible = terminal.enabled !== false;
    terminal.visual = mesh;
    this.terminalGroup.add(mesh);
    return mesh;
  }

  createTerminalVisuals() {
    for (const terminal of this.terminals.values()) this.createTerminalVisual(terminal);
  }

  addTerminal(terminal) {
    if (!terminal?.id || this.terminals.has(terminal.id)) return false;
    this.terminals.set(terminal.id, terminal);
    this.createTerminalVisual(terminal);
    return true;
  }

  removeTerminal(id) {
    const terminal = this.terminals.get(id);
    if (!terminal) return false;
    for (const [key, edge] of [...this.connections]) if (edge.from === id || edge.to === id) this.removeConnection(key, { record: false });
    if (terminal.visual) {
      this.terminalGroup.remove(terminal.visual);
      terminal.visual.geometry?.dispose?.(); terminal.visual.material?.dispose?.();
    }
    this.terminals.delete(id);
    if (this.pendingTerminal === id) this.pendingTerminal = null;
    return true;
  }

  setTerminalEnabled(id, enabled) {
    const terminal = this.terminals.get(id);
    if (!terminal) return false;
    terminal.enabled = Boolean(enabled);
    if (terminal.visual) terminal.visual.visible = terminal.enabled;
    if (!terminal.enabled) {
      for (const [key, edge] of [...this.connections]) if (edge.from === id || edge.to === id) this.removeConnection(key, { record: false });
      if (this.pendingTerminal === id) this.pendingTerminal = null;
    }
    return true;
  }

  setVisible(value) {
    this.terminalGroup.visible = Boolean(value);
    if (!value) this.cancelPending();
  }

  worldPosition(terminalId, target = new this.THREE.Vector3()) {
    const terminal = this.terminals.get(terminalId);
    if (!terminal) return target.set(0, 0, 0);
    if (terminal.enabled === false || !terminal.object?.visible) return target.set(0, -1000, 0);
    return terminal.object.localToWorld(target.fromArray(terminal.local));
  }

  updateTerminalVisuals() {
    for (const terminal of this.terminals.values()) {
      terminal.visual.visible = this.terminalGroup.visible && terminal.enabled !== false && terminal.object?.visible !== false;
      this.worldPosition(terminal.id, terminal.visual.position);
      terminal.visual.scale.setScalar(this.pendingTerminal === terminal.id ? 1.65 : 1);
    }
  }

  addInitial(from, to, options = {}) { this.addConnection(from, to, options, { record: false }); }

  addConnection(from, to, options = {}, { record = true } = {}) {
    if (!this.terminals.has(from) || !this.terminals.has(to) || from === to) return false;
    if (this.terminals.get(from).enabled === false || this.terminals.get(to).enabled === false) return false;
    const key = connectionKey(from, to);
    if (this.connections.has(key)) return false;
    const usage = (terminalId) => [...this.connections.values()].filter((connection) => connection.from === terminalId || connection.to === terminalId).length;
    const capacity = (terminalId) => this.terminals.get(terminalId)?.capacity ?? 1;
    if (usage(from) >= capacity(from) || usage(to) >= capacity(to)) {
      this.onFeedback('Terminal sem capacidade livre. Remova um cabo ou utilize um borne de derivação.', 'attention');
      return false;
    }
    const apply = () => {
      const cable = createDynamicCableSystem(this.THREE, { color: options.color ?? 0xb52d35, radius: .028, particles: 15, particleColor: options.particleColor ?? 0xffd67a });
      this.scene.add(cable.group);
      this.connections.set(key, { key, from, to, cable, options });
      this.onChange(this.serialize());
    };
    const revert = () => {
      const connection = this.connections.get(key);
      if (connection) { this.scene.remove(connection.cable.group); connection.cable.dispose(); this.connections.delete(key); }
      this.onChange(this.serialize());
    };
    if (record && this.history) this.history.execute({ label: `Conectar ${from} → ${to}`, do: apply, undo: revert }); else apply();
    return true;
  }

  removeConnection(key, { record = true } = {}) {
    const existing = this.connections.get(key);
    if (!existing) return false;
    const snapshot = { from: existing.from, to: existing.to, options: existing.options };
    const remove = () => {
      const connection = this.connections.get(key);
      if (connection) { this.scene.remove(connection.cable.group); connection.cable.dispose(); this.connections.delete(key); }
      this.onChange(this.serialize());
    };
    const restore = () => this.addConnection(snapshot.from, snapshot.to, snapshot.options, { record: false });
    if (record && this.history) this.history.execute({ label: `Remover cabo ${snapshot.from} ↔ ${snapshot.to}`, do: remove, undo: restore }); else remove();
    return true;
  }

  selectTerminal(id) {
    if (!this.terminals.has(id) || this.terminals.get(id).enabled === false) return;
    if (!this.pendingTerminal) {
      this.pendingTerminal = id;
      this.onFeedback(`Terminal ${id} selecionado. Escolha o segundo terminal.`, 'measurement');
      return;
    }
    if (this.pendingTerminal === id) { this.cancelPending(); return; }
    const from = this.pendingTerminal;
    this.pendingTerminal = null;
    const existingKey = connectionKey(from, id);
    if (this.connections.has(existingKey)) this.removeConnection(existingKey);
    else this.addConnection(from, id, { color: this.terminals.get(from).polarity === 'negative' ? 0x151a20 : 0xb52d35 });
  }

  cancelPending() { this.pendingTerminal = null; }

  update(time, active = false, speed = .2) {
    this.updateTerminalVisuals();
    for (const connection of this.connections.values()) {
      const start = this.worldPosition(connection.from, new this.THREE.Vector3());
      const end = this.worldPosition(connection.to, new this.THREE.Vector3());
      connection.cable.setEndpoints(start, end);
      connection.cable.setActive(active);
      connection.cable.update(time, speed);
    }
  }

  hasElectricalPath(startId, endId, internalEdges = []) {
    const graph = new Map();
    const link = (a, b) => {
      if (!graph.has(a)) graph.set(a, new Set());
      if (!graph.has(b)) graph.set(b, new Set());
      graph.get(a).add(b); graph.get(b).add(a);
    };
    for (const connection of this.connections.values()) link(connection.from, connection.to);
    internalEdges.forEach(([a, b]) => link(a, b));
    const queue = [startId];
    const visited = new Set(queue);
    while (queue.length) {
      const current = queue.shift();
      if (current === endId) return true;
      for (const next of graph.get(current) || []) if (!visited.has(next)) { visited.add(next); queue.push(next); }
    }
    return false;
  }

  serialize() { return [...this.connections.values()].map(({ from, to, options }) => ({ from, to, options })); }

  restore(connections = []) {
    [...this.connections.keys()].forEach((key) => this.removeConnection(key, { record: false }));
    connections.forEach(({ from, to, options }) => this.addConnection(from, to, options, { record: false }));
  }

  dispose() {
    [...this.connections.keys()].forEach((key) => this.removeConnection(key, { record: false }));
    this.terminalGroup.traverse((object) => { object.geometry?.dispose?.(); object.material?.dispose?.(); });
    this.scene.remove(this.terminalGroup);
  }
}
