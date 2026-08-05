function visible(node) {
  if (!node) return false;
  if (node.hidden) return false;
  const style = getComputedStyle(node);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

export class MentorHighlightEngine {
  constructor({ reduceMotion = false } = {}) {
    this.reduceMotion = reduceMotion;
    this.target = null;
    this.marker = document.createElement('span');
    this.marker.className = 'mentor-target-marker';
    this.marker.setAttribute('aria-hidden', 'true');
    this.marker.textContent = '➜';
  }

  reveal(target) {
    if (!target) return;
    const controls = target.closest('[data-experience-controls]');
    const stage = target.closest('[data-experience-stage]');
    const summary = target.closest('[data-experience-summary]');
    const view = controls ? 'controls' : stage ? 'scene' : summary ? 'results' : null;
    if (view) document.querySelector(`[data-experience-view="${view}"]`)?.click();
    let ancestor = target.parentElement;
    while (ancestor && ancestor !== document.body) {
      if (ancestor.hidden) ancestor.hidden = false;
      if (ancestor.classList.contains('is-workspace-collapsed')) {
        ancestor.querySelector(':scope > .workspace-card-header .workspace-card-toggle')?.click();
      }
      ancestor = ancestor.parentElement;
    }
  }

  focus(target, label = 'Próxima ação') {
    this.clear();
    if (!target) return false;
    this.reveal(target);
    this.target = target;
    target.classList.add('mentor-guided-target');
    target.setAttribute('data-mentor-guided-label', label);
    target.setAttribute('aria-describedby', 'mentor-guided-instruction');
    target.parentElement?.append(this.marker);
    requestAnimationFrame(() => {
      if (!visible(target)) return;
      target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: this.reduceMotion ? 'auto' : 'smooth' });
      if (/^(BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) target.focus({ preventScroll: true });
    });
    return true;
  }

  clear() {
    if (this.target) {
      this.target.classList.remove('mentor-guided-target');
      this.target.removeAttribute('data-mentor-guided-label');
      this.target.removeAttribute('aria-describedby');
    }
    this.marker.remove();
    this.target = null;
  }

  dispose() { this.clear(); }
}
