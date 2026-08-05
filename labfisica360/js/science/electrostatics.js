export const COULOMB_CONSTANT = 8.9875517923e9;
export const DEFAULT_MIN_DISTANCE = 0.05;

function vectorBetween(from, to) {
  return {
    x: (to.x || 0) - (from.x || 0),
    y: (to.y || 0) - (from.y || 0),
    z: (to.z || 0) - (from.z || 0),
  };
}

function magnitude(vector) {
  return Math.hypot(vector.x, vector.y, vector.z);
}

export function normalizedToMeters(point, scale = 3) {
  return {
    x: (point.x - 0.5) * scale,
    y: (0.5 - point.y) * scale,
    z: point.z || 0,
  };
}

export function pairInteraction(q1, p1, q2, p2, minDistance = DEFAULT_MIN_DISTANCE) {
  const from2to1 = vectorBetween(p2, p1);
  const rawDistance = magnitude(from2to1);
  const distance = Math.max(minDistance, rawDistance);
  const invDistance3 = 1 / (distance ** 3);
  const scalar = COULOMB_CONSTANT * q1 * q2 * invDistance3;
  const forceOn1 = {
    x: scalar * from2to1.x,
    y: scalar * from2to1.y,
    z: scalar * from2to1.z,
  };
  const forceOn2 = { x: -forceOn1.x, y: -forceOn1.y, z: -forceOn1.z };
  return {
    distance,
    rawDistance,
    magnitude: COULOMB_CONSTANT * Math.abs(q1 * q2) / (distance ** 2),
    forceOn1,
    forceOn2,
    interaction: q1 * q2 < 0 ? 'attraction' : q1 * q2 > 0 ? 'repulsion' : 'none',
    limited: rawDistance < minDistance,
  };
}

export function electricFieldAt(charges, point, minDistance = DEFAULT_MIN_DISTANCE) {
  const field = { x: 0, y: 0, z: 0 };
  for (const charge of charges) {
    const displacement = vectorBetween(charge.position, point);
    const rawDistance = magnitude(displacement);
    const distance = Math.max(minDistance, rawDistance);
    const scalar = COULOMB_CONSTANT * charge.q / (distance ** 3);
    field.x += scalar * displacement.x;
    field.y += scalar * displacement.y;
    field.z += scalar * displacement.z;
  }
  return { ...field, magnitude: magnitude(field) };
}

export function electricPotentialAt(charges, point, minDistance = DEFAULT_MIN_DISTANCE) {
  return charges.reduce((total, charge) => {
    const displacement = vectorBetween(charge.position, point);
    const distance = Math.max(minDistance, magnitude(displacement));
    return total + (COULOMB_CONSTANT * charge.q) / distance;
  }, 0);
}

export function forceOnCharge(testCharge, field) {
  return {
    x: testCharge * field.x,
    y: testCharge * field.y,
    z: testCharge * field.z,
    magnitude: Math.abs(testCharge) * field.magnitude,
  };
}
