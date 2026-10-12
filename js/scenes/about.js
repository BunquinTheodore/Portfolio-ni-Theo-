// Scenes 06-10: location, timezone, education, work, work-rest.
import { pad, q, qa, esc, clamp, count } from "./util.js";

const WORLD_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json";
const BONE = "#ededed";
const RED = "#ff0f0f";

// font-size that keeps `text` inside `width` px (approximate Geist 900 uppercase advance)
const fit = (text, max, width, k = 0.62) =>
  Math.max(44, Math.min(max, Math.floor(width / (Math.max(1, String(text).length) * k))));
const mask = (inner, cls = "", style = "") => `<div class="mask ${cls}" style="${style}"><span>${inner}</span></div>`;
const fmtLat = (v) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? "N" : "S"}`;
const fmtLon = (v) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? "E" : "W"}`;
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

/* ------------------------------------------------------------------ 06 location */
function locationScene(C) {
  const L = C.location;
  const R = 330, MID = 380;
  const city = String(L.city).toUpperCase();
  const cityPx = fit(city, 170, 880);
  const labelLen = city.length * 17;
  const start = { lam: -L.lon - 140, phi: -L.lat * 0.4 - 14 };
  const end = { lam: -L.lon, phi: -L.lat };
  const view = { lam: start.lam, phi: start.phi, pin: 0 };
  const hasGeo = typeof d3 !== "undefined" && !!d3.geoOrthographic && !!d3.geoPath;
  const proj = hasGeo ? d3.geoOrthographic().scale(R).translate([MID, MID]).clipAngle(90).precision(0.6) : null;
  const path = hasGeo ? d3.geoPath(proj) : null;
  const graticule = hasGeo && d3.geoGraticule10 ? d3.geoGraticule10() : null;
  let land = null;
  let refs = null;
  let requested = false;

  function redraw() {
    if (!refs || !proj) return;
    proj.rotate([view.lam, view.phi, 0]);
    if (graticule) refs.grat.setAttribute("d", path(graticule) || "");
    if (land) refs.land.setAttribute("d", path(land) || "");
    const xy = proj([L.lon, L.lat]);
    const near = d3.geoDistance ? d3.geoDistance([L.lon, L.lat], [-view.lam, -view.phi]) < 1.45 : true;
    if (!xy) return;
    refs.pin.setAttribute("transform", `translate(${xy[0].toFixed(1)} ${xy[1].toFixed(1)})`);
    refs.pin.setAttribute("opacity", near ? clamp(view.pin).toFixed(3) : "0");
    refs.leader.setAttribute("stroke-dashoffset", (1 - clamp(view.pin)).toFixed(3));
  }

  function loadWorld() {
    if (requested || typeof fetch !== "function" || typeof topojson === "undefined") return;
    requested = true;
    fetch(WORLD_URL)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("world-atlas " + r.status))))
      .then((data) => {
        land = topojson.feature(data, data.objects.countries);
        redraw();
      })
      .catch(() => { /* the globe works without land: graticule + pin only */ });
  }

  return {
    slug: "location", name: "Location", act: "02 · About", field: "ink", dur: 3.6,
    stars: true, ammo: 0, turn: null, rest: null, restAt: null, gun: false,
    html: `
      <div class="abs" style="left:110px;top:238px">${mask(`<span class="eyebrow">Based in</span>`)}</div>
      ${mask(esc(city), "big gl-city", `position:absolute;left:104px;top:300px;font-size:${cityPx}px;white-space:nowrap`)}
      ${mask(esc(String(L.country).toUpperCase()), "mid gl-country", `position:absolute;left:110px;top:${300 + Math.round(cityPx * 0.9) + 34}px;white-space:nowrap;color:var(--ash)`)}
      <div class="abs gl-rule" style="left:110px;top:680px;width:760px;height:2px;background:var(--bone);opacity:.35;transform-origin:0 50%"></div>
      <div class="abs gl-read" style="left:110px;top:722px;width:780px;display:grid;grid-template-columns:1fr 1fr;gap:28px 40px">
        <div><div class="mono dim" style="font-size:15px">Latitude</div>
          <div class="mono" id="gl-lat" style="font-size:34px;margin-top:14px;letter-spacing:.08em">${fmtLat(L.lat)}</div></div>
        <div><div class="mono dim" style="font-size:15px">Longitude</div>
          <div class="mono" id="gl-lon" style="font-size:34px;margin-top:14px;letter-spacing:.08em">${fmtLon(L.lon)}</div></div>
      </div>
      <div class="abs gl-wrap" style="left:1060px;top:160px;width:760px;height:760px">
        <svg viewBox="0 0 760 760" width="760" height="760" style="overflow:visible">
          <circle cx="${MID}" cy="${MID}" r="${R + 22}" fill="none" stroke="${RED}" stroke-width="1.5" stroke-opacity=".45" stroke-dasharray="3 9"/>
          <circle cx="${MID}" cy="${MID}" r="${R}" fill="rgba(8,8,8,.9)" stroke="${BONE}" stroke-opacity=".5" stroke-width="2"/>
          <path class="gl-grat" fill="none" stroke="${BONE}" stroke-opacity=".16" stroke-width="1"/>
          <path class="gl-land" fill="rgba(237,237,237,.1)" stroke="${BONE}" stroke-opacity=".5" stroke-width="1" stroke-linejoin="round"/>
          <g class="gl-pin" opacity="0" transform="translate(${MID} ${MID})">
            <circle class="gl-ring2" r="18" fill="none" stroke="${RED}" stroke-width="2" stroke-opacity=".55"/>
            <circle class="gl-ring" r="10" fill="none" stroke="${RED}" stroke-width="3"/>
            <path class="gl-leader" d="M0 0 L96 -86 L350 -86" pathLength="1" fill="none" stroke="${BONE}" stroke-width="2"
              stroke-dasharray="1" stroke-dashoffset="1"/>
            <text x="110" y="-104" fill="${BONE}" font-family="Geist Mono, ui-monospace, monospace" font-weight="700" font-size="20"
              letter-spacing="3.5" ${labelLen > 230 ? `textLength="230" lengthAdjust="spacingAndGlyphs"` : ""}>${esc(city)}</text>
            <circle r="9" fill="${RED}"/>
          </g>
        </svg>
      </div>`,
    anim(root, tl) {
      root.classList.add("starry");
      refs = {
        grat: q(root, ".gl-grat"), land: q(root, ".gl-land"), pin: q(root, ".gl-pin"),
        ring: q(root, ".gl-ring"), ring2: q(root, ".gl-ring2"), leader: q(root, ".gl-leader"),
      };
      loadWorld();
      redraw();
      tl.from(qa(root, ".mask > span"), { yPercent: 115, duration: 0.8, ease: "power4.out", stagger: 0.1 }, 0.1);
      tl.from(q(root, ".gl-rule"), { scaleX: 0, duration: 0.9, ease: "power3.inOut" }, 0.5);
      tl.from(q(root, ".gl-read"), { opacity: 0, y: 24, duration: 0.7, ease: "power3.out" }, 0.8);
      tl.from(q(root, ".gl-wrap"), { opacity: 0, scale: 0.82, duration: 1.1, ease: "power3.out" }, 0);
      tl.fromTo(view, { lam: start.lam, phi: start.phi }, {
        lam: end.lam, phi: end.phi, duration: 2.7, ease: "power3.out", immediateRender: false, onUpdate: redraw,
      }, 0.2);
      tl.fromTo(view, { pin: 0 }, { pin: 1, duration: 0.7, ease: "power2.out", immediateRender: false, onUpdate: redraw }, 2.4);
      count(tl, (v) => { const e = q(root, "#gl-lat"); if (e) e.textContent = fmtLat(v); }, 0, L.lat, 0.4, 2.4, "power3.out");
      count(tl, (v) => { const e = q(root, "#gl-lon"); if (e) e.textContent = fmtLon(v); }, 0, L.lon, 0.4, 2.4, "power3.out");
    },
    tick(root, st, env) {
      if (!refs) return;
      const k = (env.clock * 0.55) % 1;
      refs.ring.setAttribute("r", (10 + 62 * k).toFixed(1));
      refs.ring.setAttribute("stroke-opacity", ((1 - k) * 0.9).toFixed(3));
    },
  };
}

/* ------------------------------------------------------------------ 07 timezone */
function timezoneScene(C) {
  const L = C.location;
  const CX = 350, FACE = 330;
  let fmt;
  try {
    fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: L.tz, hourCycle: "h23", hour: "2-digit", minute: "2-digit", second: "2-digit",
      weekday: "short", day: "2-digit", month: "short",
    });
  } catch (e) {
    fmt = new Intl.DateTimeFormat("en-GB", {
      hourCycle: "h23", hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short", day: "2-digit", month: "short",
    });
  }
  let clk = null;

  let ticks = "";
  for (let i = 0; i < 60; i++) {
    const major = i % 5 === 0;
    ticks += `<line class="tz-t" x1="${CX}" y1="${CX - FACE + 18}" x2="${CX}" y2="${CX - FACE + (major ? 54 : 34)}"
      stroke="${BONE}" stroke-width="${major ? 5 : 2}" stroke-opacity="${major ? 1 : 0.55}" transform="rotate(${i * 6} ${CX} ${CX})"/>`;
  }
  let nums = "";
  for (let i = 1; i <= 12; i++) {
    const a = (i * 30 * Math.PI) / 180, r = FACE - 92;
    nums += `<text class="tz-n" x="${(CX + Math.sin(a) * r).toFixed(1)}" y="${(CX - Math.cos(a) * r).toFixed(1)}" fill="${BONE}"
      font-family="Geist Mono, ui-monospace, monospace" font-weight="700" font-size="30" text-anchor="middle"
      dominant-baseline="central">${i}</text>`;
  }

  const sub = `${esc(L.tz)}`;
  return {
    slug: "timezone", name: "Timezone", act: "02 · About", field: "red", dur: 3.0,
    stars: false, ammo: 0, turn: null, rest: null, restAt: null, gun: false,
    html: `
      <style>.tz-digits{font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}</style>
      <div class="abs tz-clock" style="left:150px;top:190px;width:700px;height:700px">
        <svg viewBox="0 0 700 700" width="700" height="700">
          <circle cx="${CX}" cy="${CX}" r="${FACE}" fill="#050505"/>
          ${ticks}${nums}
          <g class="tz-h"><line x1="${CX}" y1="${CX + 34}" x2="${CX}" y2="${CX - 168}" stroke="${BONE}" stroke-width="16" stroke-linecap="round"/></g>
          <g class="tz-m"><line x1="${CX}" y1="${CX + 34}" x2="${CX}" y2="${CX - 250}" stroke="${BONE}" stroke-width="9" stroke-linecap="round"/></g>
          <g class="tz-s"><line x1="${CX}" y1="${CX + 56}" x2="${CX}" y2="${CX - 292}" stroke="${RED}" stroke-width="4" stroke-linecap="round"/></g>
          <circle cx="${CX}" cy="${CX}" r="15" fill="${RED}"/><circle cx="${CX}" cy="${CX}" r="5" fill="#050505"/>
        </svg>
      </div>
      <div class="abs" style="left:930px;top:214px">${mask(`<span class="eyebrow ink">Local time</span>`)}</div>
      ${mask(`<span id="tz-hm" class="tz-digits">00:00</span>`, "mega", "position:absolute;left:918px;top:262px;font-size:250px;white-space:nowrap")}
      <div class="abs tz-sec" style="left:930px;top:530px;display:flex;align-items:flex-end;gap:36px">
        <div class="big tz-digits" id="tz-ss" style="min-width:210px">00</div>
        <div style="padding-bottom:14px">
          <div class="mono dim" style="font-size:18px">Seconds</div>
          <div class="mono" id="tz-date" style="font-size:26px;margin-top:12px;letter-spacing:.14em">---</div>
        </div>
      </div>
      <div class="abs tz-rule" style="left:930px;top:722px;width:830px;height:3px;background:var(--ink);transform-origin:0 50%"></div>
      ${mask(esc(L.tzLabel), "mid", "position:absolute;left:926px;top:752px;white-space:nowrap")}
      <div class="abs tz-meta" style="left:930px;top:870px">
        <div class="mono" style="font-size:22px;letter-spacing:.2em">${sub}</div>
        <div class="mono dim" style="font-size:18px;margin-top:14px">${esc(L.city)}, ${esc(L.country)}</div>
      </div>`,
    anim(root, tl) {
      clk = {
        h: q(root, ".tz-h"), m: q(root, ".tz-m"), s: q(root, ".tz-s"),
        hm: q(root, "#tz-hm"), ss: q(root, "#tz-ss"), date: q(root, "#tz-date"), last: "",
      };
      tl.from(q(root, ".tz-clock"), { scale: 0.7, rotation: -40, opacity: 0, duration: 1.2, ease: "power4.out" }, 0);
      tl.from(qa(root, ".tz-t"), { opacity: 0, duration: 0.2, stagger: 0.012 }, 0.1);
      tl.from(qa(root, ".tz-n"), { opacity: 0, duration: 0.4, stagger: 0.04 }, 0.5);
      tl.from(qa(root, ".mask > span"), { yPercent: 115, duration: 0.8, ease: "power4.out", stagger: 0.12 }, 0.2);
      tl.from(q(root, ".tz-sec"), { opacity: 0, x: 40, duration: 0.7, ease: "power3.out" }, 0.55);
      tl.from(q(root, ".tz-rule"), { scaleX: 0, duration: 0.8, ease: "power3.inOut" }, 0.7);
      tl.from(q(root, ".tz-meta"), { opacity: 0, y: 20, duration: 0.6, ease: "power3.out" }, 1.0);
    },
    tick(root, st) {
      if (!clk) return;
      const now = new Date();
      const p = {};
      for (const part of fmt.formatToParts(now)) p[part.type] = part.value;
      const nowSec = (+p.hour) * 3600 + (+p.minute) * 60 + (+p.second) + now.getMilliseconds() / 1000;
      const k = easeOutCubic(clamp(st / 1.9));
      const disp = nowSec * k;
      const hh = Math.floor(disp / 3600) % 24, mm = Math.floor(disp / 60) % 60, ss = Math.floor(disp) % 60;
      const key = `${hh}:${mm}:${ss}`;
      if (key !== clk.last) {
        clk.last = key;
        clk.hm.textContent = `${pad(hh)}:${pad(mm)}`;
        clk.ss.textContent = pad(ss);
        clk.date.textContent = `${p.weekday || ""} ${p.day || ""} ${p.month || ""}`.toUpperCase();
      }
      // hands: the second hand takes one extra turn during the sweep so it lands on the live second
      const secAngle = ((nowSec % 60) + 60) * 6 * k;
      const rot = (a) => `rotate(${a.toFixed(2)} ${CX} ${CX})`;
      clk.h.setAttribute("transform", rot(((disp / 43200) % 1) * 360));
      clk.m.setAttribute("transform", rot(((disp / 3600) % 1) * 360));
      clk.s.setAttribute("transform", rot(secAngle));
    },
  };
}

/* ------------------------------------------------------------------ 08 education */
function educationScene(C) {
  const E = C.education;
  const parts = String(E.degree).split(/\s+in\s+/i);
  const top = parts.length > 1 ? parts[0] : "";
  const main = (parts.length > 1 ? parts.slice(1).join(" in ") : parts[0]).toUpperCase();
  const mainPx = fit(main, 170, 1660);
  const schoolPx = fit(E.school.toUpperCase(), 84, 1660, 0.6);
  const years = String(E.years).match(/\d{4}/g) || [];
  const klass = years.length ? `Class of ${years[years.length - 1]}` : "Graduate";
  const mainTop = top ? 300 : 250;
  const ruleTop = mainTop + Math.round(mainPx * 0.9) + 56;
  return {
    slug: "education", name: "Education", act: "02 · About", field: "bone", dur: 3.4,
    stars: false, ammo: 0, turn: null, rest: null, restAt: null, gun: false,
    html: `
      <div class="abs ed-bar" style="left:90px;top:176px;width:12px;height:${ruleTop - 176}px;background:var(--red);transform-origin:50% 0"></div>
      <div class="abs" style="left:140px;top:176px">${mask(`<span class="eyebrow ink">Education</span>`)}</div>
      <div class="abs mono dim" style="right:110px;top:176px;font-size:20px;letter-spacing:.3em">${esc(klass)}</div>
      ${top ? mask(esc(top.toUpperCase()), "mid", "position:absolute;left:136px;top:226px;white-space:nowrap") : ""}
      ${mask(esc(main), "big", `position:absolute;left:130px;top:${mainTop}px;font-size:${mainPx}px;white-space:nowrap`)}
      <div class="abs ed-rule" style="left:140px;top:${ruleTop}px;width:1650px;height:3px;background:var(--ink);transform-origin:0 50%"></div>
      ${mask(esc(E.school.toUpperCase()), "mid", `position:absolute;left:136px;top:${ruleTop + 44}px;font-size:${schoolPx}px;white-space:nowrap`)}
      <div class="abs mono dim ed-place" style="left:140px;top:${ruleTop + 44 + Math.round(schoolPx * 1.0) + 24}px;font-size:22px;letter-spacing:.24em">${esc(E.place)}</div>
      ${mask(esc(E.years), "big ol ed-years", `position:absolute;left:130px;top:${ruleTop + 44 + Math.round(schoolPx) + 80}px;white-space:nowrap`)}`,
    anim(root, tl) {
      tl.from(q(root, ".ed-bar"), { scaleY: 0, duration: 1.0, ease: "power4.inOut" }, 0);
      tl.from(qa(root, ".mask > span"), { yPercent: 115, duration: 0.9, ease: "power4.out", stagger: 0.14 }, 0.2);
      tl.from(q(root, ".ed-rule"), { scaleX: 0, duration: 1.0, ease: "power3.inOut" }, 0.7);
      tl.from(q(root, ".ed-place"), { opacity: 0, x: -30, duration: 0.7, ease: "power3.out" }, 1.3);
      tl.from(q(root, ".ed-years"), { x: 90, duration: 1.4, ease: "power3.out" }, 1.2);
    },
  };
}

/* ------------------------------------------------------------------ 09 work */
function workScene(C) {
  const roles = C.work;
  const sinceYears = roles.map((r) => parseInt(r.since, 10)).filter((n) => !isNaN(n));
  const since = sinceYears.length ? Math.min(...sinceYears) : null;
  const sub = `${pad(roles.length)} roles${since ? ` · since ${since}` : ""}`;
  return {
    slug: "work", name: "Work", act: "03 · Experience", field: "red", dur: 2.0,
    stars: false, ammo: 1, turn: [1.45, "ink"], rest: null, restAt: null, gun: false,
    html: `
      <div class="abs wk-flood" style="left:50%;top:50%;width:2600px;height:2600px;margin:-1300px 0 0 -1300px;border-radius:50%;background:var(--ink);z-index:1"></div>
      <div class="abs wk-eye" style="left:100px;top:332px;z-index:2">${mask(`<span class="eyebrow ink">Work</span>`)}</div>
      <div class="abs" style="left:90px;top:396px;width:1740px;z-index:2;overflow:hidden">
        <h2 class="mega wk-mega" style="font-size:270px;white-space:nowrap;color:var(--ink)"><span class="wk-slide" style="display:block">EXPERIENCE</span></h2>
      </div>
      <div class="abs mono wk-sub" style="left:104px;top:690px;font-size:24px;z-index:2;color:var(--ink)">${esc(sub)}</div>`,
    anim(root, tl) {
      const text = [q(root, ".wk-mega"), q(root, ".wk-sub")];
      tl.from(q(root, ".wk-slide"), { xPercent: 110, duration: 0.85, ease: "power4.out" }, 0);
      tl.to(q(root, ".wk-slide"), { x: -50, duration: 1.4, ease: "none" }, 0.85);
      tl.from(q(root, ".wk-eye .mask > span"), { yPercent: 115, duration: 0.6, ease: "power3.out" }, 0.25);
      tl.from(q(root, ".wk-sub"), { opacity: 0, y: 20, duration: 0.5, ease: "power3.out" }, 0.5);
      // iris to ink; text flips to bone as the circle passes under it
      tl.fromTo(q(root, ".wk-flood"), { scale: 0.01 }, { scale: 1, duration: 0.55, ease: "power3.inOut", immediateRender: false }, 1.05);
      tl.set(text, { color: BONE }, 1.3);
      tl.set(q(root, ".wk-eye .eyebrow"), { color: RED }, 1.3);
    },
  };
}

/* ------------------------------------------------------------------ 10 work-rest */
function workRestScene(C) {
  const roles = C.work.slice(0, 4);
  const ROW = 175, TOP = 200;
  const rows = roles.map((r, i) => {
    const px = fit(r.company.toUpperCase(), 104, 980, 0.6);
    return `
      <a class="wr" href="${esc(r.url)}" target="_blank" rel="noopener" style="top:${TOP + i * ROW}px">
        <span class="mono wr-i">${pad(i + 1)}</span>
        <span class="mask wr-co"><span style="font-size:${px}px">${esc(r.company.toUpperCase())}</span></span>
        <span class="wr-meta"><b>${esc(r.role)}</b><i>${esc(r.domain || "")}</i></span>
        <span class="mono wr-since">Since ${esc(r.since)}</span>
        <svg class="wr-arrow" viewBox="0 0 32 32" width="40" height="40" fill="none" stroke="currentColor" stroke-width="3"
          stroke-linecap="square"><path d="M6 26 L26 6 M10 6 H26 V22"/></svg>
      </a>`;
  }).join("");
  const lines = Array.from({ length: roles.length + 1 }, (_, i) =>
    `<div class="abs wr-line" style="left:90px;top:${TOP + i * ROW}px;width:1740px;height:2px;background:var(--bone);opacity:.4;transform-origin:0 50%"></div>`).join("");
  return {
    slug: "work-rest", name: "Roles", act: "03 · Experience", field: "ink", dur: 3.0,
    stars: true, ammo: 1, turn: null, rest: "click a role to visit", restAt: 1.7, gun: false,
    html: `
      <style>
        .wr{position:absolute;left:90px;width:1740px;height:${ROW}px;display:grid;grid-template-columns:70px 1fr 400px 170px 56px;
          align-items:center;padding:0 22px 0 24px;color:var(--bone);text-decoration:none;transition:background-color .25s,color .25s}
        .wr:hover,.wr:focus-visible{background:var(--red);color:var(--ink)}
        .wr .wr-i{font-size:20px;opacity:.7}
        .wr .wr-co span{font:900 104px/1 var(--sans);letter-spacing:-.04em;white-space:nowrap}
        .wr .wr-meta{display:grid;gap:10px}
        .wr .wr-meta b{font:700 22px/1.1 var(--mono);letter-spacing:.14em;text-transform:uppercase}
        .wr .wr-meta i{font:600 16px/1 var(--mono);font-style:normal;letter-spacing:.14em;color:var(--ash);transition:color .25s}
        .wr:hover .wr-meta i,.wr:focus-visible .wr-meta i{color:var(--ink)}
        .wr .wr-since{font-size:18px;opacity:.85}
        .wr .wr-arrow{justify-self:end;transition:transform .25s}
        .wr:hover .wr-arrow{transform:translate(6px,-6px)}
      </style>
      <div class="abs" style="left:100px;top:112px">${mask(`<span class="eyebrow">Experience</span>`)}</div>
      <div class="abs mono dim wr-count" style="right:100px;top:116px;font-size:20px">${pad(roles.length)} roles</div>
      ${lines}${rows}`,
    anim(root, tl) {
      root.classList.add("starry");
      tl.from(q(root, ".eyebrow"), { opacity: 0, x: -30, duration: 0.6, ease: "power3.out" }, 0);
      tl.from(q(root, ".wr-count"), { opacity: 0, duration: 0.6 }, 0.2);
      tl.from(qa(root, ".wr-line"), { scaleX: 0, duration: 0.8, ease: "power3.inOut", stagger: 0.1 }, 0.2);
      tl.from(qa(root, ".wr-co > span"), { yPercent: 115, duration: 0.8, ease: "power4.out", stagger: 0.12 }, 0.35);
      tl.from(qa(root, ".wr-i, .wr-meta, .wr-since"), { opacity: 0, y: 18, duration: 0.6, ease: "power3.out", stagger: 0.02 }, 0.6);
    },
  };
}

export function scenes(C, P) {
  return [locationScene(C), timezoneScene(C), educationScene(C), workScene(C), workRestScene(C)];
}
