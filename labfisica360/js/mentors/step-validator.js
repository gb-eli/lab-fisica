export function stepMatchesEvent(step, event, target) {
  if (!step || step.event === 'manual') return false;
  if (event.type !== step.event && !(step.event === 'input' && event.type === 'change')) return false;
  const matched = target.closest?.(step.selector);
  if (!matched) return false;
  if (typeof step.predicate === 'function' && !step.predicate(matched, event)) return false;
  return true;
}

export function findStepTarget(root, step) {
  if (!root || !step?.selector) return null;
  return root.querySelector(step.selector);
}
