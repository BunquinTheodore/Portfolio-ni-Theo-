# Build contract: cinematic scroll-film portfolio

A clone (own code, own content) of the *style* of hyowonbernabe.me: a fixed 1920x1080 "stage" scaled to the
window, 24 scenes ("shots") scrubbed by scroll with GSAP, Lenis smooth scroll, HUD corners, film grain, a red
cursor ring, star particles, a three.js pistol that moves between scenes (exploded view, per-part skills),
iris transitions between colour fields. Palette: ink #050505, red #ff0f0f, bone #ededed, ash #8a8585.
Fonts: Geist (900 for display, uppercase, tight tracking) and Geist Mono (labels, wide tracking).

Already written (do not rewrite, read them): `index.html`, `css/style.css`, `js/content.js`, `js/scenes/util.js`.
Libraries are globals from CDN script tags: `gsap`, `Lenis`, `d3` (d3-geo only: `d3.geoOrthographic`,
`d3.geoPath`, `d3.geoGraticule10`), `topojson` (topojson-client). three.js is an import map entry `"three"`.
No build step; ES modules served statically (`python -m http.server`). Plain JS, no TypeScript.

Files and owners:
- `js/scenes/boot.js`     scenes 01-05
- `js/scenes/about.js`    scenes 06-10
- `js/scenes/arsenal.js`  scenes 11-19
- `js/scenes/projects.js` scenes 20-24
- `js/scenes/index.js`    concatenates the four, in order
- `js/gun.js`             three.js pistol
- `js/main.js`            engine

## Scene module interface

Each scene file: `export function scenes(C, P) { return [ ...sceneObjects ] }` where `C` is `CONTENT` and `P` is the
shared gun poser from `makePoser` (util.js). A scene object:

```js
{ slug, name, act, field,      // field: "ink" | "red" | "bone" | "quad" (quad = ink root with four coloured cells)
  dur,                          // seconds
  stars: bool,                  // star particles show behind it (ink scenes only; root is then transparent: add class "starry")
  ammo: 0..3,                   // how many magazine pips glow
  turn: null | [sec, "ink"|"red"|"bone"],  // the field changes mid-scene; the scene animates that itself
  rest: null | "hint text",     // resting frame: the scroll holds here so people can read/click
  restAt: null | seconds,       // where in the scene it holds (default: dur*0.55)
  gun: bool,                    // the 3D gun canvas is visible in this scene
  html: `...`,                  // inner HTML of the scene root (a 1920x1080 absolute box). Use position:absolute px layout.
  anim(root, tl, env),          // add tweens to the paused GSAP timeline `tl` (time 0..dur). Must be scrub-safe.
  tick(root, st, env)           // optional, every frame while active; st = seconds into the scene
}
```
`env` = `{ gun: gunApi, mouse: {sx, sy}, clock, C }` (`mouse.sx/sy` are smoothed -1..1; `clock` = wall seconds).

Rules for `anim`: use `tl.from/fromTo/to/set` only; every tween must be reversible (the user scrubs both ways);
no `tl.call` for visual state, no timers, no Math.random/Date (use util `hash`-style deterministic values).
Element start states come from `from`/`fromTo`; do not rely on CSS initial hidden states. Text reveals: wrap
lines in `.mask > span` and animate `yPercent`. Put an iris/flood circle inside the scene for `turn` changes
(`position:absolute; border-radius:50%`, scale from ~0.01 to 1 covering the frame) and flip text colours with
`tl.set(el, {color}, t)`. Only `<a>` and `.chip` receive pointer events (`.scene * {pointer-events:none}`).
Do NOT build the generic scene-to-scene iris in the scene: main.js appends it at the end of every scene whose
ending field differs from the next scene's starting field (a quad scene ends ink: animate its cells away).
Every link is a real `<a href target="_blank" rel="noopener">` (mailto without target).

Gun scenes: `P.pose(tl, at, dur, {px,py,rx,ry,rz,s,ex}, ease)` tweens the shared gun state from the previous pose.
The first P.pose call in each gun scene must be at = 0 (duration may be tiny). The first gun scene starts the gun
off-screen left (poser default px = -16). The last gun scene must fly it off-screen (px: 16) before it ends.
Gun world units: camera fov 30 at z 14, so the stage shows 13.3 x 7.5 units (144 px per unit at 1080 tall);
`px,py` are in those units (+x right, +y up), `s` uniform scale, `ex` explode 0..1, rotations in radians.
Model faces +x (muzzle right). Assembled part centres (model units, before scale) are exported by gun.js as
`PART_CENTER = { suppressor:[4.3,.55], barrel:[2.6,.55], slide:[.3,.65], frame:[-.1,.15], sights:[.3,1.05], grip:[-1.5,-.9] }`.
To frame a part at screen position (sx, sy) units with scale s and ry≈0: `px = sx - cx*s`, `py = sy - cy*s`.
`env.gun.project(partName)` -> `[x, y]` in stage px (0..1920, 0..1080) of the part's current centre, or null.
Part names: `suppressor barrel slide frame sights grip` (skills for each live in `C.skills[part]`).

## gun.js interface

```js
export const PARTS = ["suppressor","barrel","slide","frame","sights","grip"];
export const PART_CENTER = {...};
export async function mountGun(canvas, state, opts) // canvas is #gun (1920x1080 css px); opts: {pixelRatio, interactive}
  -> { render({sway:[rx,ry], light:[x,y], t}), pick(clientX, clientY) -> partName|null,
       project(partName) -> [x,y]|null, highlight(partName|null), setVisible(bool), setPixelRatio(n) }
```
`state` = the live pose object `{px,py,pz,rx,ry,rz,s,ex}` mutated by GSAP; read it every render. Procedural
low-poly pistol (boxes/cylinders, no external model files): gunmetal MeshStandardMaterial plus bone-coloured
EdgesGeometry outlines, a red point light that follows `light`, transparent background. Each part is a Group named
by part so picking/highlighting (emissive red) works. Explode offsets move parts apart as `ex` goes 0->1.

## main.js responsibilities

Imports `scenes/index.js`, `gun.js`, `content.js`. Builds scenes (build order = film order, one shared poser),
mounts each as `div.scene.<field>[data-slug]` in `#stage` before `#gun`, inserts `html`, runs `anim` against a
paused timeline. Fits the stage (contain, centred; `#viewport` background follows the current field). Film clock
`t` autoplays the boot until the landing pause (`name` scene at 1.5s) holding at 97% (`biometric-scan` 2.3s)
until the gun is ready, then unlocks Lenis scroll; scroll position maps to film time via segments with hold
pixels at `rest` frames. Draws stars, grain (generated noise data-URL on `#grain`), custom cursor ring, HUD
light/dark by field, `#ammo` pips, `#act` label, `#cue`. Generic iris between scenes (colour = next field).
Gun hover panel `#skills` + `#ring` (see css) active only in `loaded-rest`, wired to `.chip[data-part]` and
raycast picking. Fills `#about-text` with plain-text copy from CONTENT. `window.__seek(slug, sec)` debug helper.
Respects prefers-reduced-motion. Exposes `window.__shots`.

## Scene list (slug | field | dur | notes)

01 biometric-scan | ink | 2.4 | fingerprint rings, red scanline, % counter to 97 at 2.3 then 100
02 access-granted | ink | 1.2 | ACCESS GRANTED decode, bracket flash
03 collapse-to-the-dot | ink | 1.8 | everything collapses into one red dot, stars on
04 name | red | 3.4 | huge 3-line name, period; landing rest at 1.5s; period swells to cover (ink) at the end
05 word-burst | quad | 2.0 | four coloured cells, four big words slam in, cells shrink away to ink at the end
06 location | ink | 3.6 | stars, rotating orthographic globe (d3-geo + world-atlas countries-110m from jsDelivr, fetched async) to the pin
07 timezone | red | 3.0 | analog clock + digital time, live in C.location.tz, sweeps from midnight to now
08 education | bone | 3.4 | degree, school, years, outline type
09 work | red | 2.0 | turn [1.45,"ink"] "EXPERIENCE" slides, flood to ink
10 work-rest | ink | 3.0 | rest; stars; four role rows linking out
11 arsenal | red | 2.0 | turn [1.75,"bone"]; gun slides in, "ARSENAL." gun scene
12 exploded | bone | 3.0 | gun explodes, six labelled parts (tag3 + leader) tracked with env.gun.project in tick
13-18 | ink | 2.5 each | suppressor-ai-ml, barrel-backend, slide-frameworks, frame-languages, sights-tools, grip-creative: camera pushes onto the part, outline name, group title, skills tick in (primary skills in red). Names: "Suppressor · AI & ML" etc (name = "<Part> · <Group>")
19 loaded-rest | ink | 4.0 | rest at ~1.15; gun reassembled centre idle; "LOADED." ; six `.chip[data-part]` tabindex=0 chips; hint "hover a part to see its skills"; gun flies off at the end
20 deployed-rest | red | 7.0 | rest at 6.27; projects as a belt/grid of linked cards entering in turn, "N AND COUNTING" counter
21 showcase-1 | per C.showcases[0].field | 4.0 | rest links; phone mock, big title, ghost letter, strikes, stack, rotating badge star
22 showcase-2 | per C.showcases[1].field | 4.0 | same layout
23 credentials-rest | ink | 4.6 | rest; four linked certificate cards, rotating badge
24 blast | ink | 5.0 | turn [0.2,"red"]; "LET'S TALK" mega; contact rows (links) with arrows; footer line

Slugs for 21/22: `showcase-1`, `showcase-2`. Act labels: "00 · Boot", "01 · Hero", "02 · About", "03 · Experience",
"04 · Arsenal", "05 · Projects", "06 · Showcases", "07 · Credentials", "08 · Contact".

## Quality bar

Looks like a premium dark/red/bone editorial film; everything inside 1920x1080 with margins ≥ 90px, no overflow
or overlapping text; type sizes legible when the stage is scaled to ~0.6; no console errors; all links real.
Keep each file under ~700 lines. Do not touch files you do not own; report interface issues instead.
