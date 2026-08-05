export class CommandHistory {
  constructor({ limit = 80, onChange = () => {} } = {}) {
    this.limit = limit;
    this.onChange = onChange;
    this.undoStack = [];
    this.redoStack = [];
  }

  execute(command, { alreadyApplied = false } = {}) {
    if (!command || typeof command.do !== 'function' || typeof command.undo !== 'function') return false;
    if (!alreadyApplied) command.do();
    this.undoStack.push(command);
    if (this.undoStack.length > this.limit) this.undoStack.shift();
    this.redoStack.length = 0;
    this.notify();
    return true;
  }

  undo() {
    const command = this.undoStack.pop();
    if (!command) return false;
    command.undo();
    this.redoStack.push(command);
    this.notify();
    return true;
  }

  redo() {
    const command = this.redoStack.pop();
    if (!command) return false;
    command.do();
    this.undoStack.push(command);
    this.notify();
    return true;
  }

  clear() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
    this.notify();
  }

  notify() {
    this.onChange({
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
      undoLabel: this.undoStack.at(-1)?.label || '',
      redoLabel: this.redoStack.at(-1)?.label || '',
      entries: this.undoStack.slice(-8).map((entry) => entry.label || 'Ação'),
    });
  }
}

export function captureTransform(object) {
  return {
    position: object.position.toArray(),
    quaternion: object.quaternion.toArray(),
    scale: object.scale.toArray(),
  };
}

export function applyTransform(object, transform) {
  object.position.fromArray(transform.position);
  object.quaternion.fromArray(transform.quaternion);
  object.scale.fromArray(transform.scale);
  object.updateMatrixWorld(true);
}

export function transformsEqual(a, b, epsilon = 1e-5) {
  const valuesA = [...a.position, ...a.quaternion, ...a.scale];
  const valuesB = [...b.position, ...b.quaternion, ...b.scale];
  return valuesA.every((value, index) => Math.abs(value - valuesB[index]) <= epsilon);
}
