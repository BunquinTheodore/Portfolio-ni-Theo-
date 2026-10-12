// Scenes 01-05: biometric-scan, access-granted, collapse-to-the-dot, name, word-burst.
import { pad, q, qa, esc, decode, count } from "./util.js";

const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- 01 fingerprint ----------
const FP_RINGS = 24;
function fingerprintPaths() {
  const cx = 280, cy = 350, out = [];
  for (let i = 0; i < FP_RINGS; i++) {
    const rx = 14 + i * 10.6, ry = 20 + i * 13.2;
    const gap0 = hash(i * 3.1) * Math.PI * 2, gapLen = 0.3 + hash(i * 5.7) * 0.9;
    const span = Math.PI * 2 - gapLen, steps = 96;
    let d = "";
    for (let k = 0; k <= steps; k++) {
      const a = gap0 + gapLen + (span * k) / steps;
      const w = 1 + 0.035 * Math.sin(a * 3 + i) + 0.02 * Math.sin(a * 7 - i * 2);
      const x = cx + rx * Math.cos(a) * w;
      const y = cy + ry * Math.sin(a) * w * (Math.sin(a) > 0 ? 0.94 : 1);
      d += (k ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    out.push(`<path d="${d}" pathLength="1" stroke-dasharray="1" />`);
  }
  return out.join("");
}

const SCAN_TOP = 190, SCAN_H = 660;

function biometricHtml() {
  const paths = fingerprintPaths();
  const brk = (l, t, bw) => `<i class="bs-br" style="left:${l}px;top:${t}px;border-width:${bw}"></i>`;
  return `
<style>
  .bs-br { position:absolute; width:64px; height:64px; border:0 solid var(--bone); opacity:.75; }
  .bs-mono { position:absolute; font:600 20px/1.5 var(--mono); letter-spacing:.22em; text-transform:uppercase; color:var(--ash); white-space:nowrap; }
  .bs-mono b { color:var(--bone); font-weight:700; }
  .bs-ticks { position:absolute; width:26px; height:660px; top:${SCAN_TOP}px;
    background:repeating-linear-gradient(to bottom, rgba(237,237,237,.38) 0 2px, transparent 2px 14px); transform-origin:50% 0; }
  .bs-fp path { fill:none; stroke-width:3; stroke-linecap:butt; }
  .bs-st { position:absolute; left:0; top:0; white-space:nowrap; }
</style>
<div class="eyebrow abs bs-eye" style="left:130px;top:128px">Biometric scan</div>
<div class="bs-mono abs bs-l1" style="left:130px;top:186px">Subject <b>001</b><br>Dermal ridge map<br>Sensor 500 dpi</div>
<div class="bs-mono abs bs-r1" style="right:130px;top:128px;text-align:right">Channel <b>01 / 05</b><br>Link <b>encrypted</b></div>

<div class="bs-ticks bs-t" style="left:620px"></div>
<div class="bs-ticks bs-t" style="left:1274px"></div>
${brk(640, 150, "3px 0 0 3px")}${brk(1216, 150, "3px 3px 0 0")}${brk(640, 866, "0 0 3px 3px")}${brk(1216, 866, "0 3px 3px 0")}

<svg class="abs bs-fp" style="left:680px;top:${SCAN_TOP}px;filter:drop-shadow(0 0 7px rgba(255,15,15,.55))" width="560" height="700" viewBox="0 0 560 700">
  <defs>
    <clipPath id="bsFpShape"><ellipse cx="280" cy="350" rx="272" ry="338"/></clipPath>
    <clipPath id="bsClip"><rect class="bs-clip" x="0" y="0" width="560" height="0"/></clipPath>
  </defs>
  <g clip-path="url(#bsFpShape)">
    <g class="fpb" stroke="rgba(237,237,237,.26)">${paths}</g>
    <g clip-path="url(#bsClip)"><g class="fpr" stroke="#ff0f0f">${paths}</g></g>
  </g>
</svg>
<div class="scanline bs-scan" style="top:${SCAN_TOP}px"></div>

<div class="abs bs-num" style="left:130px;top:760px;display:flex;align-items:flex-end;gap:14px">
  <div class="mono" style="position:absolute;left:0;top:-42px;font-size:18px;color:var(--ash);white-space:nowrap">Match probability</div>
  <span class="bs-val" style="font:900 170px/.82 var(--sans);letter-spacing:-.05em">00</span>
  <span style="font:900 64px/.9 var(--sans);color:var(--red)">%</span>
</div>

<div class="bs-mono abs bs-r2" style="right:130px;top:690px;text-align:right;line-height:1.9">
  Ridges <b>mapped</b><br>
  Minutiae <b class="bs-min">000</b><br>
  <span style="position:relative;display:inline-block;min-width:330px;height:38px">
    <span class="bs-st bs-s1" style="right:0;left:auto">Status <b style="color:var(--red)">scanning</b></span>
    <span class="bs-st bs-s2" style="right:0;left:auto">Status <b style="color:var(--red)">verified</b></span>
  </span>
</div>`;
}

function biometricAnim(root, tl) {
  const rect = q(root, ".bs-clip");
  const scan = q(root, ".bs-scan");
  const val = q(root, ".bs-val");
  const minu = q(root, ".bs-min");

  tl.from(qa(root, ".bs-eye, .bs-l1, .bs-r1"), { opacity: 0, x: -24, duration: 0.5, ease: "power3.out", stagger: 0.08 }, 0.05);
  tl.from(qa(root, ".bs-br"), { opacity: 0, scale: 1.4, duration: 0.5, ease: "power3.out", stagger: 0.05 }, 0.05);
  tl.from(qa(root, ".bs-t"), { scaleY: 0, duration: 0.7, ease: "power3.out" }, 0.15);
  tl.from(qa(root, ".fpb path"), { strokeDashoffset: 1, duration: 0.9, ease: "power2.out", stagger: 0.035 }, 0.1);
  tl.from(qa(root, ".fpr path"), { strokeDashoffset: 1, duration: 0.9, ease: "power2.out", stagger: 0.035 }, 0.1);

  // scan sweep: red reveal clip and the scanline travel together
  tl.fromTo(rect, { attr: { height: 0 } }, { attr: { height: SCAN_H }, duration: 2, ease: "power1.inOut", immediateRender: false }, 0.3);
  tl.fromTo(scan, { y: 0 }, { y: SCAN_H, duration: 2, ease: "power1.inOut" }, 0.3);
  tl.fromTo(scan, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none" }, 0.3);

  tl.from(q(root, ".bs-num"), { opacity: 0, y: 30, duration: 0.5, ease: "power3.out" }, 0.1);
  count(tl, (v) => { val.textContent = pad(Math.round(v)); }, 0, 97, 0.15, 2.15, "power2.out");
  count(tl, (v) => { val.textContent = v >= 99.5 ? "100" : pad(Math.round(v)); }, 97, 100, 2.3, 0.1);

  tl.from(q(root, ".bs-r2"), { opacity: 0, x: 24, duration: 0.5, ease: "power3.out" }, 0.5);
  count(tl, (v) => { minu.textContent = pad(Math.round(v), 3); }, 0, 142, 0.3, 1.9, "power1.out");
  tl.fromTo(q(root, ".bs-s2"), { opacity: 0 }, { opacity: 1, duration: 0.01 }, 2.0);
  tl.fromTo(q(root, ".bs-s1"), { opacity: 1 }, { opacity: 0, duration: 0.01, immediateRender: false }, 2.0);
}

// ---------- 02 / 03 shared "ACCESS GRANTED" block ----------
function accessBlock(p) {
  const br = (l, t, bw) => `<i class="${p}br" style="position:absolute;left:${l}px;top:${t}px;width:64px;height:64px;border:0 solid var(--red);border-width:${bw}"></i>`;
  return `
<div class="${p}grp" style="position:absolute;inset:0;transform-origin:960px 540px">
  ${br(200, 220, "4px 0 0 4px")}${br(1656, 220, "4px 4px 0 0")}${br(200, 836, "0 0 4px 4px")}${br(1656, 836, "0 4px 4px 0")}
  <div class="eyebrow ${p}eye" style="position:absolute;left:0;width:1920px;justify-content:center;top:262px">Identity confirmed</div>
  <div class="mega ${p}l1" style="position:absolute;left:0;width:1920px;text-align:center;top:330px;font-size:236px">ACCESS</div>
  <div class="mega ${p}l2" style="position:absolute;left:0;width:1920px;text-align:center;top:538px;font-size:236px;color:var(--red)">GRANTED</div>
  <div class="${p}bar" style="position:absolute;left:660px;width:600px;top:800px;height:4px;background:var(--red);box-shadow:0 0 18px var(--red);transform-origin:0 50%"></div>
  <div class="mono ${p}foot" style="position:absolute;left:0;width:1920px;text-align:center;top:836px;font-size:18px;color:var(--ash)">Clearance level 04 &nbsp;·&nbsp; session open</div>
  <i class="${p}line" style="position:absolute;left:160px;width:1600px;top:539px;height:3px;background:var(--red);box-shadow:0 0 22px var(--red),0 0 50px var(--red);opacity:0"></i>
</div>`;
}

function accessHtml() {
  return accessBlock("ag-") + `<div class="ag-flash" style="position:absolute;inset:0;background:var(--red);opacity:0;z-index:9"></div>`;
}

function accessAnim(root, tl) {
  tl.fromTo(q(root, ".ag-flash"), { opacity: 0.5 }, { opacity: 0, duration: 0.35, ease: "power2.out" }, 0);
  tl.from(qa(root, ".ag-br"), { opacity: 0, scale: 1.8, duration: 0.45, ease: "power4.out", transformOrigin: "50% 50%" }, 0);
  const eye = q(root, ".ag-eye"), l1 = q(root, ".ag-l1"), l2 = q(root, ".ag-l2");
  for (const [el, t, at, dur] of [[eye, "IDENTITY CONFIRMED", 0.05, 0.45], [l1, "ACCESS", 0.1, 0.45], [l2, "GRANTED", 0.3, 0.5]]) {
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.01 }, at);
    decode(tl, el, t, at, dur);
  }
  tl.from(q(root, ".ag-bar"), { scaleX: 0, duration: 0.6, ease: "power3.out" }, 0.4);
  tl.from(q(root, ".ag-foot"), { opacity: 0, y: 14, duration: 0.4, ease: "power3.out" }, 0.7);
}

function collapseHtml() {
  return accessBlock("cd-") + `
<i class="cd-r1" style="position:absolute;left:918px;top:498px;width:84px;height:84px;border-radius:50%;border:2px solid var(--red)"></i>
<i class="cd-r2" style="position:absolute;left:918px;top:498px;width:84px;height:84px;border-radius:50%;border:2px solid var(--bone)"></i>
<i class="cd-hx" style="position:absolute;left:760px;width:400px;top:539px;height:1px;background:rgba(237,237,237,.45)"></i>
<i class="cd-vx" style="position:absolute;top:340px;height:400px;left:959px;width:1px;background:rgba(237,237,237,.45)"></i>
<i class="cd-dot" style="position:absolute;left:948px;top:528px;width:24px;height:24px;border-radius:50%;background:var(--red);box-shadow:0 0 27px var(--red),0 0 70px rgba(255,15,15,.65);z-index:12"></i>
<div class="mono cd-cap" style="position:absolute;left:0;width:1920px;text-align:center;top:630px;font-size:18px;color:var(--ash)">Origin &nbsp;·&nbsp; 0,0</div>`;
}

function collapseAnim(root, tl) {
  root.classList.add("starry");
  const grp = q(root, ".cd-grp");
  // squash to a line, then the line to a point
  tl.fromTo(q(root, ".cd-line"), { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power2.out" }, 0.3);
  tl.fromTo(grp, { scaleY: 1 }, { scaleY: 0.012, duration: 0.5, ease: "power3.in" }, 0);
  tl.fromTo(grp, { scaleX: 1 }, { scaleX: 0, duration: 0.42, ease: "power3.in", immediateRender: false }, 0.5);
  tl.fromTo(grp, { opacity: 1 }, { opacity: 0, duration: 0.05, immediateRender: false }, 0.9);

  const dot = q(root, ".cd-dot");
  tl.fromTo(dot, { scale: 0 }, { scale: 1.9, duration: 0.14, ease: "power2.out" }, 0.84);
  tl.fromTo(dot, { scale: 1.9 }, { scale: 1, duration: 0.3, ease: "power2.inOut", immediateRender: false }, 0.98);
  tl.fromTo(q(root, ".cd-r1"), { scale: 0.1, opacity: 0.9 }, { scale: 9, opacity: 0, duration: 0.8, ease: "power2.out" }, 0.9);
  tl.fromTo(q(root, ".cd-r2"), { scale: 0.1, opacity: 0.6 }, { scale: 6, opacity: 0, duration: 0.7, ease: "power2.out" }, 1.1);
  tl.from(q(root, ".cd-hx"), { scaleX: 0, duration: 0.5, ease: "power3.out" }, 1.1);
  tl.from(q(root, ".cd-vx"), { scaleY: 0, duration: 0.5, ease: "power3.out" }, 1.1);
  tl.from(q(root, ".cd-cap"), { opacity: 0, y: 12, duration: 0.4, ease: "power3.out" }, 1.25);
}

// ---------- 04 name ----------
const NAME_FS = 290;

function nameHtml(C) {
  const p = C.person, L = p.lines;
  const fs = `font-size:${NAME_FS}px`;
  return `
<style>
  .nm-meta { position:absolute; font:600 20px/1.6 var(--mono); letter-spacing:.22em; text-transform:uppercase; color:var(--ink); white-space:nowrap; }
  .nm-row { display:flex; }
  .nm-pw { position:relative; display:inline-block; width:.16em; height:.16em; margin-left:.05em; margin-bottom:.07em; align-self:flex-end; }
  .nm-pw .iris { width:3400px; height:3400px; background:var(--ink); z-index:30; margin:0; }
</style>
<div class="nm-meta nm-top" style="left:130px;top:104px">Portfolio &nbsp;/&nbsp; 2026</div>
<div class="nm-meta nm-top" style="right:130px;top:104px;text-align:right">N&deg; 001 &nbsp;/&nbsp; Hero</div>
<i class="nm-rule" style="position:absolute;left:130px;width:1660px;top:150px;height:3px;background:var(--ink);transform-origin:0 50%"></i>

<div class="nm-block" style="position:absolute;left:130px;top:196px;z-index:5;transform-origin:0 100%">
  <h1 class="mega nm-l" style="margin:0;${fs};line-height:.84"><span class="mask nm-m"><span>${esc(L[0])}</span></span></h1>
  <div class="nm-row" style="align-items:center;gap:76px">
    <div class="mega nm-l" style="${fs};line-height:.84"><span class="mask nm-m"><span>${esc(L[1])}</span></span></div>
    <div class="nm-title" style="margin-top:6px">
      <div class="eyebrow ink">${esc(p.title)}</div>
      <p style="margin:26px 0 0;font:600 34px/1.3 var(--sans);max-width:860px;color:var(--ink)">${esc(p.tagline)}</p>
    </div>
  </div>
  <div class="nm-row" style="${fs};line-height:.84">
    <div class="mega nm-l" style="${fs};line-height:.84"><span class="mask nm-m"><span>${esc(L[2])}</span></span></div>
    <span class="nm-pw"><i class="iris nm-iris" style="left:50%;top:50%"></i></span>
  </div>
</div>

<div class="nm-meta nm-bot" style="right:130px;top:900px;text-align:right">Based in ${esc(C.location.city)}, ${esc(C.location.country)}<br>${esc(C.location.tzLabel)}</div>`;
}

function nameAnim(root, tl) {
  const fsW = (NAME_FS * 0.16) / 3400; // iris scale that matches a full stop
  const iris = q(root, ".nm-iris");
  tl.set(iris, { xPercent: -50, yPercent: -50 }, 0);
  tl.from(q(root, ".nm-rule"), { scaleX: 0, duration: 0.8, ease: "power4.out" }, 0.1);
  tl.from(qa(root, ".nm-top"), { opacity: 0, y: -14, duration: 0.5, ease: "power3.out", stagger: 0.08 }, 0.15);
  tl.from(qa(root, ".nm-m > span"), { yPercent: 118, duration: 0.8, ease: "power4.out", stagger: 0.14 }, 0.0);
  tl.from(q(root, ".nm-title"), { opacity: 0, x: 40, duration: 0.6, ease: "power3.out" }, 0.55);
  tl.from(q(root, ".nm-bot"), { opacity: 0, y: 16, duration: 0.5, ease: "power3.out" }, 0.75);
  // full stop pops in, then (post rest) swells to flood the frame in ink
  tl.fromTo(iris, { scale: 0 }, { scale: fsW, duration: 0.35, ease: "back.out(3)" }, 0.9);
  tl.fromTo(q(root, ".nm-block"), { scale: 1 }, { scale: 1.035, duration: 1.0, ease: "sine.inOut", immediateRender: false }, 1.55);
  tl.fromTo(iris, { scale: fsW }, { scale: 1, duration: 0.85, ease: "power3.in", immediateRender: false }, 2.5);
}

// ---------- 05 word burst ----------
const CELLS = [
  { x: 0, y: 0, bg: "var(--red)", fg: "var(--ink)", dot: "var(--ink)", org: "100% 100%" },
  { x: 960, y: 0, bg: "var(--bone)", fg: "var(--ink)", dot: "var(--red)", org: "0% 100%" },
  { x: 0, y: 540, bg: "var(--blood)", fg: "var(--bone)", dot: "var(--red)", org: "100% 0%" },
  { x: 960, y: 540, bg: "#0b0b0b", fg: "var(--bone)", dot: "var(--red)", org: "0% 0%", edge: true },
];

function burstHtml(C) {
  const words = (C.words && C.words.length ? C.words : ["BUILD", "SHIP", "ITERATE", "REPEAT"]).slice(0, 4);
  return words.map((w, i) => {
    const c = CELLS[i];
    const edge = c.edge ? "box-shadow:inset 0 0 0 4px var(--red);" : "";
    return `
<div class="wb-cell" style="position:absolute;left:${c.x}px;top:${c.y}px;width:960px;height:540px;overflow:hidden;background:${c.bg};color:${c.fg};transform-origin:${c.org};${edge}">
  <div class="mono" style="position:absolute;left:90px;top:90px;font-size:20px;opacity:.75">${pad(i + 1)} / ${pad(words.length)}</div>
  <div class="ol" style="position:absolute;right:90px;top:70px;font:900 220px/.8 var(--sans);letter-spacing:-.05em;opacity:.22;-webkit-text-stroke:3px currentColor">${pad(i + 1)}</div>
  <div class="wb-word" style="position:absolute;left:90px;bottom:86px;font:900 172px/.9 var(--sans);letter-spacing:-.045em;text-transform:uppercase;white-space:nowrap;transform-origin:0 100%">${esc(w)}<i style="display:inline-block;width:.15em;height:.15em;border-radius:50%;background:${c.dot};margin-left:.05em"></i></div>
</div>`;
  }).join("");
}

function burstAnim(root, tl) {
  const cells = qa(root, ".wb-cell"), words = qa(root, ".wb-word");
  cells.forEach((cell, i) => {
    const at = i * 0.3;
    tl.from(cell, { scale: 0, duration: 0.4, ease: "power3.out" }, at);
    tl.from(words[i], { scale: 1.9, opacity: 0, duration: 0.4, ease: "power4.out" }, at + 0.16);
  });
  // everything pulls back to the centre point, leaving ink
  tl.fromTo(cells, { scale: 1 }, { scale: 0, duration: 0.32, ease: "power3.in", stagger: 0.04, immediateRender: false }, 1.5);
}

// ---------- export ----------
export function scenes(C, P) {
  return [
    {
      slug: "biometric-scan", name: "Biometric scan", act: "00 · Boot", field: "ink", dur: 2.4,
      stars: false, ammo: 0, turn: null, rest: null, restAt: null, gun: false,
      html: biometricHtml(), anim: biometricAnim,
    },
    {
      slug: "access-granted", name: "Access granted", act: "00 · Boot", field: "ink", dur: 1.2,
      stars: false, ammo: 0, turn: null, rest: null, restAt: null, gun: false,
      html: accessHtml(), anim: accessAnim,
    },
    {
      slug: "collapse-to-the-dot", name: "Collapse to the dot", act: "00 · Boot", field: "ink", dur: 1.8,
      stars: true, ammo: 0, turn: null, rest: null, restAt: null, gun: false,
      html: collapseHtml(), anim: collapseAnim,
    },
    {
      slug: "name", name: C.person.first + " " + C.person.last, act: "01 · Hero", field: "red", dur: 3.4,
      stars: false, ammo: 0, turn: [3.1, "ink"], rest: "scroll to enter", restAt: 1.5, gun: false,
      html: nameHtml(C), anim: nameAnim,
    },
    {
      slug: "word-burst", name: "Word burst", act: "01 · Hero", field: "quad", dur: 2.0,
      stars: false, ammo: 0, turn: null, rest: null, restAt: null, gun: false,
      html: burstHtml(C), anim: burstAnim,
    },
  ];
}
