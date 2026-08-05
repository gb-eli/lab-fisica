import { FOUNDATION_TRACKS } from './foundation-tracks.js';
import { EXPANSION_TRACKS } from './expansion-tracks.js';

function mergeTracks(...sources) {
  const result = {};
  for (const source of sources) {
    for (const [mentorId, routes] of Object.entries(source)) {
      result[mentorId] = { ...(result[mentorId] || {}), ...routes };
    }
  }
  return result;
}

export const MENTOR_TRACKS = Object.freeze(mergeTracks(FOUNDATION_TRACKS, EXPANSION_TRACKS));

export function getMentorTrack(mentorId, route) {
  return MENTOR_TRACKS[mentorId]?.[route] || null;
}

export function getMentorTrackStats() {
  const mentors = Object.keys(MENTOR_TRACKS).length;
  const tracks = Object.values(MENTOR_TRACKS).reduce((sum, routes) => sum + Object.keys(routes).length, 0);
  const steps = Object.values(MENTOR_TRACKS).reduce((sum, routes) => sum + Object.values(routes).reduce((routeSum, track) => routeSum + track.steps.length, 0), 0);
  return { mentors, tracks, steps };
}
