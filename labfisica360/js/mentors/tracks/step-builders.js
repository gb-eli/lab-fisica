export const manual = (id, title, instruction, selector, observation) => ({ id, title, instruction, selector, event: 'manual', observation });
export const click = (id, title, instruction, selector, observation) => ({ id, title, instruction, selector, event: 'click', observation });
export const input = (id, title, instruction, selector, observation, predicate = null) => ({ id, title, instruction, selector, event: 'input', observation, predicate });
export const change = (id, title, instruction, selector, observation, predicate = null) => ({ id, title, instruction, selector, event: 'change', observation, predicate });
