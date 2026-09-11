/* Original Happy Little Pillow movement sketches. Durations are design proposals,
   not measurements taken from the linked references. All transforms return to rest. */
const pillowMovements = {
  listen: { label: 'Listening tilt', duration: 900, description: 'A small 7° lean toward the speaker, a brief attentive hold, then a gentle return. Trigger once when listening begins.', frames: ['none', 'rotate(-7deg) translateY(-2%)', 'rotate(-7deg) translateY(-2%)', 'none'], offsets: [0,.3,.66,1] },
  nod: { label: 'Got it', duration: 620, description: 'A compact downward dip and soft recovery. Use once to acknowledge a choice; keep it subtle.', frames: ['none','translateY(4%) scale(1.04,.962)','translateY(-1%) scale(.99,1.01)','none'], offsets: [0,.38,.7,1] },
  attention: { label: 'Attention hop', duration: 820, description: 'A little compression prepares one short hop. He lands softly and stops. Use for a new prompt, never as a repeating demand.', frames: ['none','scale(1.07,.935)','translateY(-13%) scale(.96,1.04)','translateY(1%) scale(1.05,.952)','none'], offsets: [0,.18,.48,.75,1] },
  celebrate: { label: 'Happy double-bounce', duration: 1150, description: 'Two light hops, the second smaller. A warm response to a completed booking or task; then back to rest.', frames: ['none','scale(1.06,.943)','translateY(-15%) scale(.97,1.03)','scale(1.05,.952)','translateY(-7%) scale(.98,1.02)','scale(1.025,.976)','none'], offsets: [0,.12,.31,.48,.65,.82,1] },
  curious: { label: 'Curious peek', duration: 1050, description: 'A slight lean one way and a smaller return the other. Useful when offering a suggestion, without taking over the screen.', frames: ['none','translateX(3%) rotate(6deg)','translateX(-1%) rotate(-2deg)','none'], offsets: [0,.4,.75,1] },
  settle: { label: 'Soft settle', duration: 650, description: 'A tiny exhale-like compression and release. A quiet way to finish speaking and return to the resting pose.', frames: ['none','scale(1.025,.976)','none'], offsets: [0,.42,1] }
};
const actors = [...document.querySelectorAll('.actor')];
const reduce = document.querySelector('#reduce-motion');
const systemReduce = matchMedia('(prefers-reduced-motion: reduce)');
const status = document.querySelector('#motion-status');
let animations = [];
let run = 0;
function rest() {
  run++;
  animations.forEach(animation => animation.cancel());
  animations = [];
  document.querySelectorAll('[data-motion]').forEach(button => button.setAttribute('aria-pressed', 'false'));
  status.textContent = 'Resting';
}
function playMovement(key) {
  rest();
  const currentRun = run;
  const motion = pillowMovements[key];
  document.querySelector('#motion-description').textContent = motion.description;
  document.querySelectorAll(`[data-motion="${key}"]`).forEach(button => button.setAttribute('aria-pressed', 'true'));
  if (reduce.checked || systemReduce.matches) {
    status.textContent = `${motion.label} selected · motion reduced; resting pose retained`;
    return;
  }
  status.textContent = `${motion.label} · ${motion.duration}ms`;
  const frames = motion.frames.map((transform, i) => ({transform, offset: motion.offsets[i], easing:'cubic-bezier(.4,0,.2,1)'}));
  animations = actors.map(actor => actor.animate(frames, {duration:motion.duration, iterations:1}));
  Promise.all(animations.map(animation => animation.finished)).then(() => {
    if (run === currentRun) status.textContent = `${motion.label} complete · resting`;
  }).catch(() => {}); // A new gesture intentionally cancels the previous one.
}
for (const containerId of ['motion-buttons','video-motions']) {
  const container = document.getElementById(containerId);
  Object.entries(pillowMovements).forEach(([key,motion]) => {
    const button = document.createElement('button');
    button.type = 'button'; button.dataset.motion = key;
    button.textContent = motion.label; button.setAttribute('aria-pressed','false');
    button.addEventListener('click', () => playMovement(key)); container.append(button);
  });
}
document.querySelector('#reset').addEventListener('click',rest);
reduce.checked = systemReduce.matches;
reduce.addEventListener('change',rest);
systemReduce.addEventListener('change',event => {reduce.checked = event.matches; rest();});
document.addEventListener('visibilitychange',() => {if(document.hidden) rest();});
for (const dark of [false,true]) {
  const row = document.createElement('div'); row.className = `size-row${dark?' dark':''}`;
  row.setAttribute('aria-label', dark?'Sizes on forest background':'Sizes on white background');
  [24,32,48,64,96,160].forEach(size => {
    const figure = document.createElement('figure'); figure.className = 'size-item';
    const image = document.createElement('img'); image.src = 'assets/happy-pillow-master-cutout.png';
    image.width = size; image.height = size; image.alt = `Pillow mascot at ${size} pixels`;
    const caption = document.createElement('figcaption'); caption.textContent = `${size}px`;
    figure.append(image,caption); row.append(figure);
  }); document.querySelector('#size-tests').append(row);
}
const overlay = document.querySelector('#film-overlay');
const size = document.querySelector('#overlay-size');
size.addEventListener('input',() => {
  overlay.style.setProperty('--size',`${size.value}px`);
  document.querySelector('#size-output').value = `${size.value}px`;
});
document.querySelector('#overlay-position').addEventListener('change',event => overlay.classList.toggle('left',event.target.value==='left'));
document.querySelector('#show-bubble').addEventListener('change',event => document.querySelector('#bubble').hidden=!event.target.checked);
document.querySelector('#show-overlay').addEventListener('change',event => overlay.hidden=!event.target.checked);
