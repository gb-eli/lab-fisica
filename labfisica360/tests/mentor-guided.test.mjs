import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { MENTORS, MENTOR_BY_ID, ROUTE_LABELS } from '../js/mentors/mentor-catalog.js';
import { MENTOR_TRACKS, getMentorTrack, getMentorTrackStats } from '../js/mentors/tracks/core-tracks.js';

const expectedMentors = ['einstein', 'newton', 'faraday', 'curie', 'tesla', 'galileo'];
assert.equal(MENTORS.length, 6);
assert.deepEqual(MENTORS.map((mentor) => mentor.id), expectedMentors);
assert.equal(Object.keys(ROUTE_LABELS).length, 8);
for (const mentor of MENTORS) {
  assert.equal(MENTOR_BY_ID[mentor.id].name, mentor.name);
  assert.equal(mentor.routeOrder.length, 5, `${mentor.id} deve possuir cinco laboratórios na trilha expandida.`);
  assert.equal(new Set(mentor.routeOrder).size, mentor.routeOrder.length);
  for (const route of mentor.routeOrder) {
    assert.ok(ROUTE_LABELS[route], `Rótulo ausente para ${route}.`);
    const track = getMentorTrack(mentor.id, route);
    assert.ok(track, `${mentor.id}/${route} precisa de trilha.`);
    assert.ok(track.question.length > 15);
    assert.ok(track.steps.length >= 4);
    assert.equal(new Set(track.steps.map((step) => step.id)).size, track.steps.length, `${mentor.id}/${route} possui IDs repetidos.`);
    for (const step of track.steps) {
      assert.ok(step.id && step.title && step.instruction && step.selector);
      assert.ok(['click', 'input', 'change', 'manual'].includes(step.event));
    }
  }
}
const stats = getMentorTrackStats();
assert.deepEqual(stats, { mentors: 6, tracks: 33, steps: 138 });
assert.equal(Object.keys(MENTOR_TRACKS).length, 6);

const [app, home, controller, session, storage, css, sw, core, foundation, expansion] = await Promise.all([
  'js/app.js','js/modules/home.js','js/mentors/mentor-controller.js','js/session/student-session.js','js/storage.js','css/mentor-guided.css','sw.js',
  'js/mentors/tracks/core-tracks.js','js/mentors/tracks/foundation-tracks.js','js/mentors/tracks/expansion-tracks.js',
].map((path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')));
assert.match(app, /import\('\.\/mentors\/mentor-controller\.js'\)/, 'Mentores devem carregar por importação dinâmica.');
assert.doesNotMatch(app, /^import .*mentor-controller/m, 'O sistema de mentores não pode entrar no grafo estático inicial.');
assert.match(home, /Modo Guiado por mentor/);
assert.match(controller, /MentorHighlightEngine/);
assert.match(controller, /recordMentorStep/);
assert.match(controller, /expanded-r9-2/);
assert.match(session, /recordLearningMode/);
assert.match(session, /mentorSteps/);
assert.match(storage, /learningMode: 'free'/);
assert.match(css, /mentor-guided-target/);
assert.match(core, /FOUNDATION_TRACKS/);
assert.match(core, /EXPANSION_TRACKS/);
assert.match(foundation, /newton/);
assert.match(expansion, /curie/);
assert.match(expansion, /tesla/);
assert.match(expansion, /galileo/);
assert.doesNotMatch(sw, /mentor-controller\.js/, 'O service worker não deve pré-carregar o sistema de mentores no shell.');
console.log('✓ R9.2: seis mentores, 33 roteiros, 138 etapas e carregamento sob demanda validados.');
