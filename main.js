/* =========================================================
   Shipra Gupta · interactive cover letter
   Vanilla JS, no dependencies.
   Personalize per company:  ?company=Contoso&role=Senior%20Software%20Engineer&name=Priya
   ========================================================= */
(() => {
  'use strict';
  window.__sgReady = true;

  const CONFIG = {
    email: 'shipragupta1411@gmail.com',
    careerStart: [2019, 1],
    defaultRole: 'Senior Backend Engineer',
    roles: [
      { key: 'ms', label: 'Microsoft', sub: 'Software Engineer 2', from: [2022, 4], to: null, color: '#4f8cff' },
      { key: 'sam', label: 'Samsung', sub: 'SWE + intern', from: [2019, 1], to: [2021, 3], gap: [[2019, 4], [2019, 6]], color: '#8b5cf6' },
      { key: 'pay', label: 'Paytm', sub: 'Software Engineer', from: [2021, 3], to: [2022, 3], color: '#22d3ee' },
    ],
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const now = new Date();
  const nowYM = [now.getFullYear(), now.getMonth() + 1];
  const monthsBetween = (a, b) => (b[0] - a[0]) * 12 + (b[1] - a[1]);

  function onVisible(el, cb, threshold = 0.25) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(el); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); cb(e.target); } });
    }, { threshold });
    io.observe(el);
  }

  function watchVisibility(el, onChange) {
    if (!el || !('IntersectionObserver' in window)) { onChange(true); return; }
    new IntersectionObserver((entries) => entries.forEach((e) => onChange(e.isIntersecting)), { threshold: 0 }).observe(el);
  }

  /* ---------------- personalization ---------------- */
  const qs = new URLSearchParams(location.search);
  const clean = (v) => (v || '').replace(/[<>"`{}]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
  const company = clean(qs.get('company') || qs.get('to') || qs.get('c'));
  const role = clean(qs.get('role') || qs.get('r')) || CONFIG.defaultRole;
  const contact = clean(qs.get('name') || qs.get('n'));
  const years = Math.max(1, Math.floor(monthsBetween(CONFIG.careerStart, nowYM) / 12));
  const target = `${role} @ ${company || 'your team'}`;

  function personalize() {
    $$('[data-years]').forEach((e) => (e.textContent = `${years}+`));
    $$('[data-role]').forEach((e) => (e.textContent = role));
    $$('[data-target]').forEach((e) => (e.textContent = target));
    $$('[data-company-name]').forEach((e) => (e.textContent = company || 'your team'));
    $$('[data-recipient]').forEach((e) => (e.textContent = contact || (company ? `${company} Hiring Team` : 'Hiring Team')));
    $$('[data-at-company]').forEach((e) => (e.textContent = company ? ` at ${company}` : ''));
    $$('[data-approver]').forEach((e) => (e.textContent = contact ? `${contact}${company ? ` · ${company}` : ''}` : company ? `${company} hiring team` : 'You'));
    const hello = $('#hello');
    if (hello) hello.textContent = contact ? `Hi ${contact} 👋` : company ? `Hello, ${company} team 👋` : 'Hello there 👋';
    if (company) {
      const p = $('#prepared');
      if (p) p.hidden = false;
      document.title = `Shipra Gupta × ${company} · ${role}`;
    }
    $('#year') && ($('#year').textContent = now.getFullYear());
    const mail = $('#mail-link');
    if (mail) mail.href = mailtoHref();
  }

  function mailtoHref() {
    const subject = `Interview invitation: ${role}${company ? ` at ${company}` : ''}`;
    const body = [
      `Hi Shipra,`,
      ``,
      `Thanks for the interactive cover letter. We'd like to invite you to interview for the ${role} role${company ? ` at ${company}` : ''}.`,
      ``,
      `Could you share a few times that work for you this week or next?`,
      ``,
      `Best regards,`,
      contact || '',
    ].join('\n');
    return `mailto:${CONFIG.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  /* ---------------- nav, progress, menu ---------------- */
  function initNav() {
    const nav = $('#nav');
    const bar = $('#progress-bar');
    const menuBtn = $('#menu-btn');
    const links = $('#nav-links');
    let ticking = false;
    const update = () => {
      const st = window.scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      nav.classList.toggle('scrolled', st > 20);
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, st / max) : 0})`;
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();

    const setMenu = (open) => {
      menuBtn.setAttribute('aria-expanded', String(open));
      links.classList.toggle('open', open);
    };
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && links.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    });

    const map = new Map($$('.nav-links a').map((a) => [a.getAttribute('href').slice(1), a]));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            map.forEach((a) => a.classList.remove('active'));
            const a = map.get(e.target.id);
            if (a) a.classList.add('active');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
    }
  }

  /* ---------------- reveal + counters ---------------- */
  function initReveal() {
    $$('.reveal').forEach((el) => onVisible(el, (t) => {
      t.classList.add('in');
      $$('[data-count]', t).forEach(runCounter);
    }, 0.15));
    $$('[data-count]').forEach((el) => { if (!el.closest('.reveal')) onVisible(el, runCounter); });
  }

  function runCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const to = parseFloat(el.dataset.to);
    const from = parseFloat(el.dataset.from || '0');
    const pre = el.dataset.prefix || '';
    const suf = el.dataset.suffix || '';
    const fmt = (v) => (el.dataset.format === 'comma' ? Math.round(v).toLocaleString('en-US') : Math.round(v));
    if (reduce) { el.textContent = pre + fmt(to) + suf; return; }
    const dur = 1800;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + fmt(from + (to - from) * e) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------------- spotlight + magnetic + cursor glow ---------------- */
  function initPointerFx() {
    if (!finePointer) return;
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest && e.target.closest('.spot');
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--sx', `${e.clientX - r.left}px`);
        card.style.setProperty('--sy', `${e.clientY - r.top}px`);
      }
    }, { passive: true });

    if (!reduce) {
      $$('.magnetic').forEach((b) => {
        b.addEventListener('pointermove', (e) => {
          const r = b.getBoundingClientRect();
          b.style.setProperty('--mx', `${(e.clientX - r.left - r.width / 2) * 0.22}px`);
          b.style.setProperty('--my', `${(e.clientY - r.top - r.height / 2) * 0.3}px`);
        });
        b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
      });

      const glow = $('#cursor-glow');
      let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, raf = 0;
      const loop = () => {
        gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
        glow.style.transform = `translate(${gx}px, ${gy}px)`;
        raf = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(loop) : 0;
      };
      addEventListener('pointermove', (e) => {
        tx = e.clientX; ty = e.clientY; glow.classList.add('on');
        if (!raf) raf = requestAnimationFrame(loop);
      }, { passive: true });
      document.addEventListener('pointerleave', () => glow.classList.remove('on'));
    }
  }

  /* ---------------- hero network canvas ---------------- */
  function initHeroCanvas() {
    const c = $('#hero-canvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    const COLORS = ['#4f8cff', '#8b5cf6', '#ec4899', '#22d3ee'];
    const LINK = 150;
    let w = 0, h = 0, nodes = [], packets = [], running = true, raf = 0;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(95, Math.max(28, (w * h) / 15000)));
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.7,
      }));
      packets = [];
      if (reduce) draw(false);
    }

    function neighbor(a) {
      const opts = [];
      for (const b of nodes) {
        if (b === a) continue;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) opts.push(b);
      }
      return opts.length ? opts[(Math.random() * opts.length) | 0] : null;
    }

    function draw(move = true) {
      ctx.clearRect(0, 0, w, h);
      if (move) {
        for (const n of nodes) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
          const dx = n.x - mouse.x, dy = n.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 130 * 130) { const d = Math.sqrt(d2) || 1; n.x += (dx / d) * 0.9; n.y += (dy / d) * 0.9; }
        }
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          if (Math.abs(dx) > LINK || Math.abs(dy) > LINK) continue;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(130,140,255,${(1 - d / LINK) * 0.22})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = 'rgba(200,210,255,.55)';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
      if (!move) return;
      if (packets.length < 22 && Math.random() < 0.12) {
        const a = nodes[(Math.random() * nodes.length) | 0];
        const b = neighbor(a);
        if (b) packets.push({ a, b, t: 0, s: 0.012 + Math.random() * 0.018, c: COLORS[(Math.random() * COLORS.length) | 0], hops: 0 });
      }
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += p.s;
        if (p.t >= 1) {
          const nb = p.hops < 6 && Math.random() < 0.75 ? neighbor(p.b) : null;
          if (nb) { p.a = p.b; p.b = nb; p.t = 0; p.hops++; } else { packets.splice(i, 1); continue; }
        }
        const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.strokeStyle = p.c; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(p.a.x, p.a.y); ctx.lineTo(x, y); ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowColor = p.c; ctx.shadowBlur = 14; ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function loop() { if (!running) { raf = 0; return; } draw(true); raf = requestAnimationFrame(loop); }
    resize();
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
    c.parentElement.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; }, { passive: true });
    c.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
    if (reduce) return;
    watchVisibility(c, (vis) => { running = vis && !document.hidden; if (running && !raf) loop(); });
    document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running && !raf) loop(); });
  }

  /* ---------------- text scramble ---------------- */
  class Scramble {
    constructor(el) { this.el = el; this.chars = '!<>-_\\/[]{}=+*^?#01'; this.update = this.update.bind(this); }
    set(text) {
      const old = this.el.textContent;
      const len = Math.max(old.length, text.length);
      this.queue = [];
      for (let i = 0; i < len; i++) {
        const start = (Math.random() * 18) | 0;
        this.queue.push({ from: old[i] || '', to: text[i] || '', start, end: start + ((Math.random() * 18) | 0) });
      }
      cancelAnimationFrame(this.raf);
      this.frame = 0;
      return new Promise((res) => { this.resolve = res; this.update(); });
    }
    update() {
      let out = '', done = 0;
      for (const q of this.queue) {
        if (this.frame >= q.end) { done++; out += esc(q.to); }
        else if (this.frame >= q.start) {
          if (!q.ch || Math.random() < 0.28) q.ch = this.chars[(Math.random() * this.chars.length) | 0];
          out += `<span class="sc">${esc(q.ch)}</span>`;
        } else out += esc(q.from);
      }
      this.el.innerHTML = out;
      if (done === this.queue.length) this.resolve();
      else { this.raf = requestAnimationFrame(this.update); this.frame++; }
    }
  }
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function initScramble() {
    const el = $('#scramble');
    if (!el || reduce) return;
    const words = ['backend systems.', 'low-latency APIs.', 'microservices.', 'AI-powered tools.', 'systems at scale.'];
    el.textContent = words[0];
    const s = new Scramble(el);
    let i = 0;
    const next = async () => { await sleep(2600); i = (i + 1) % words.length; await s.set(words[i]); next(); };
    next();
  }

  /* ---------------- hero terminal ---------------- */
  async function initHeroTerminal() {
    const body = $('#hero-term');
    if (!body) return;
    const profile = JSON.stringify({
      name: 'Shipra Gupta',
      role: 'SWE 2 @ Microsoft',
      focus: 'backend · APIs · distributed',
      years,
      open_to: role,
    }, null, 2).split('\n');
    const lines = [
      ['cmd', 'curl -s :8080/v1/engineers/shipra | jq'],
      ...profile.map((l) => ['json', l]),
      ['cmd', `http POST :8080/v1/interviews${company ? ` team="${company}"` : ''}`],
      ['warn', 'HTTP/1.1 202 Accepted'],
      ['json', '{ "status": "awaiting your response" }'],
    ];
    const cursor = document.createElement('span');
    cursor.className = 'cur';
    const put = (cls, text) => {
      const d = document.createElement('div');
      d.className = cls;
      if (cls === 'json') d.innerHTML = highlightJSON(text); else d.textContent = text;
      body.appendChild(d);
      return d;
    };
    if (reduce) { lines.forEach(([c, t]) => put(c, t)); return; }
    await sleep(700);
    for (const [cls, text] of lines) {
      if (cls === 'cmd') {
        const d = put(cls, '');
        for (let i = 1; i <= text.length; i++) { d.textContent = text.slice(0, i); d.appendChild(cursor); await sleep(18 + Math.random() * 34); }
        await sleep(300);
      } else { put(cls, text); await sleep(cls === 'json' ? 70 : 220); }
    }
    body.lastChild.appendChild(cursor);
  }

  function highlightJSON(s) {
    return esc(s).replace(/("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g, (m, str, colon, bool, num) => {
      if (str) return colon ? `<span class="jk">${str}</span>${colon}` : `<span class="js">${str}</span>`;
      if (bool) return `<span class="jb">${bool}</span>`;
      return `<span class="jn">${num}</span>`;
    });
  }

  /* ---------------- bento visuals ---------------- */
  function initBento() {
    $$('[data-cells]').forEach((box) => {
      const n = +box.dataset.cells;
      const cols = ['#4f8cff', '#8b5cf6', '#ec4899'];
      box.innerHTML = Array.from({ length: n }, (_, i) => `<i style="--i:${i};--c:${cols[Math.floor((i / n) * cols.length)]}"></i>`).join('');
    });
    $$('[data-dots]').forEach((box) => {
      const n = +box.dataset.dots;
      box.innerHTML = Array.from({ length: n }, (_, i) => `<i style="--i:${i}"></i>`).join('');
    });

    // Years donut
    const svg = $('#donut');
    const legend = $('#donut-legend');
    if (!svg) return;
    const data = CONFIG.roles.map((r) => {
      let m = monthsBetween(r.from, r.to || nowYM);
      if (r.gap) m -= monthsBetween(r.gap[0], r.gap[1]);
      return { ...r, months: Math.max(1, m) };
    });
    const total = data.reduce((s, d) => s + d.months, 0);
    const R = 70, C = 2 * Math.PI * R, GAP = 4;
    svg.innerHTML = `<circle cx="90" cy="90" r="${R}" stroke="rgba(255,255,255,.06)" stroke-width="22" fill="none"/>` +
      data.map((d) => `<circle class="seg" cx="90" cy="90" r="${R}" stroke="${d.color}" stroke-dasharray="0 ${C}" stroke-dashoffset="0"><title>${d.label}: ${(d.months / 12).toFixed(1)} yrs</title></circle>`).join('');
    legend.innerHTML = data.map((d) => `<li><i style="background:${d.color}"></i><span><b>${d.label}</b><small>${d.sub}</small></span><em>${(d.months / 12).toFixed(1)} y</em></li>`).join('');
    onVisible(svg, () => {
      let acc = 0;
      $$('.seg', svg).forEach((seg, i) => {
        const len = (data[i].months / total) * C;
        seg.setAttribute('stroke-dashoffset', String(-acc));
        requestAnimationFrame(() => seg.setAttribute('stroke-dasharray', `${Math.max(0, len - GAP)} ${C}`));
        acc += len;
      });
    }, 0.3);
  }

  /* ---------------- journey: distributed trace ---------------- */
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'your-team';
  const fmtDur = (m) => { const y = Math.floor(m / 12), r = m % 12; return y ? `${y}y${r ? ` ${r}m` : ''}` : `${r}m`; };
  const AXIS = { from: [2015, 1], to: [now.getFullYear() + 1, 7] };
  const NOW_END = [nowYM[0], nowYM[1] + 1];

  const SPANS = [
    {
      svc: 'career', op: 'GET /careers/shipra-gupta', depth: 0, title: 'Shipra Gupta', sub: 'Backend Software Engineer · Noida, India',
      from: [2015, 7], to: NOW_END, color: '#64748b',
      tags: { focus: 'backend · APIs · distributed systems', companies: 'Microsoft · Paytm · Samsung' },
      events: [['info', 'Request received: looking for a backend engineer?'], ['ok', '5 child spans completed with 200 OK'], ['warn', '1 child span pending: interview']],
    },
    {
      svc: 'lnmiit', op: 'education.btech_cse', depth: 1, title: 'B.Tech, Computer Science', sub: 'The LNMIIT, Jaipur · 2015–2019',
      from: [2015, 7], to: [2019, 5], color: '#94a3b8',
      tags: { degree: 'B.Tech CSE', coursework: 'DSA · DBMS · OS · OOP · SOLID' },
      events: [['ok', 'Coursework: basic and advanced data structures, DBMS, OS, OOP, SOLID'], ['ok', 'IIT-JEE Advanced 2015: All India Rank 10,558'], ['ok', 'Shipped Time Speaks, published on Mozilla Add-ons (Jul 2017)'], ['ok', 'Built URL-Shortener and MusicMania (Java, JSP/Servlets, MySQL)'], ['ok', 'Represented college in badminton, 2016–2018']],
    },
    {
      svc: 'samsung', op: 'intern.adaptive_brightness', depth: 1, title: 'Software Engineer Intern', sub: 'Samsung, Noida · Jan–Apr 2019',
      from: [2019, 1], to: [2019, 5], color: '#a78bfa',
      tags: { platform: 'Android' },
      events: [['ok', 'Worked on adaptive brightness for Samsung mobile devices'], ['ok', 'Camera-based ambient-light detection adjusts screen brightness'], ['ok', 'Better user experience and battery efficiency']],
    },
    {
      svc: 'samsung', op: 'health.wear_os', depth: 1, title: 'Software Engineer', sub: 'Samsung, Noida · Jun 2019–Mar 2021',
      from: [2019, 6], to: [2021, 4], color: '#8b5cf6',
      tags: { platform: 'Wear OS · Android', users: 'millions' },
      events: [['ok', 'Developed Stress and SpO2 trackers in Samsung Health on Wear OS'], ['ok', 'Used by millions of smartwatch owners during COVID-19'], ['ok', 'Samsung Pass: secure storage for credentials and payment cards'], ['ok', 'Fixed API and UI issues, improving stability and performance']],
    },
    {
      svc: 'paytm', op: 'iot.device_api', depth: 1, title: 'Software Engineer', sub: 'Paytm, Noida · Mar 2021–Mar 2022',
      from: [2021, 3], to: [2022, 4], color: '#22d3ee',
      tags: { stack: 'AWS IoT · Redis · REST', auth_id_lookup: '200 ms → ~80 ms' },
      events: [['ok', 'REST APIs for IoT device onboarding with X.509 registration'], ['ok', 'APIs for transaction notifications and transaction summaries'], ['ok', 'Redis cache: ~1M fewer DB hits/day, auth latency 200 ms → ~80 ms'], ['ok', 'Integrated AWS IoT Device Defender for fleet security']],
    },
    {
      svc: 'microsoft', op: 'services.platform', depth: 1, title: 'Software Engineer 2', sub: 'Microsoft, Noida · Apr 2022–now',
      from: [2022, 4], to: NOW_END, color: '#4f8cff', live: true,
      tags: { stack: 'Azure · Cognitive Search · Claude', scope: '40+ microservices' },
      events: [['ok', 'Framework that stands up 40+ microservices: ~95% less manual work'], ['ok', 'Claude-based sprint-reporting agent on live ADO data: 30–60 min → ~90 s'], ['ok', 'ODSPDoc Buddy on Azure Cognitive Search: ~50% faster answers'], ['ok', 'Designed the migration of 100+ stages; aligned China and US teams'], ['ok', 'Automated security and compliance checks: ~40% less risk, ~10 h/week saved']],
    },
    {
      svc: slug(company || 'your-team'), op: 'interview.pending', depth: 1, title: role, sub: `${company || 'Your team'} · next`,
      from: nowYM, to: AXIS.to, color: '#ec4899', pending: true,
      tags: { role, company: company || 'your team', status: 'awaiting response' },
      events: [['ok', `Pre-checks passed: ${years}+ yrs · APIs · distributed systems · system design · AI`], ['warn', `Awaiting response from ${company ? `the ${company} hiring team` : 'you'}`], ['info', `Respond below, or email ${CONFIG.email}`]],
    },
  ];

  let approvedState = false;
  let userPicked = false;
  let detailToken = 0;

  async function showSpan(i, animate = true) {
    const s = SPANS[i];
    const box = $('#span-detail');
    if (!box) return;
    const token = ++detailToken;
    $$('.wf-row').forEach((r, j) => r.setAttribute('aria-pressed', String(j === i)));
    const m = monthsBetween(s.from, s.to === NOW_END ? nowYM : s.to);
    const durText = s.pending ? (approvedState ? 'invite drafted' : 'pending') : fmtDur(Math.max(1, m)) + (s.live ? ' · live' : '');
    const tags = { 'service.name': s.svc, ...s.tags };
    if (s.pending && approvedState) tags.status = 'invite drafted';
    box.innerHTML = `
      <div class="sd-head"><i style="background:${s.color}"></i><b></b><span class="op"></span><span class="sd-dur"></span></div>
      <div class="sd-title"></div><div class="sd-sub"></div>
      <div class="sd-tags">${Object.keys(tags).map(() => '<span><em></em>=<b></b></span>').join('')}</div>
      <div class="sd-events"></div>`;
    $('.sd-head b', box).textContent = s.svc;
    $('.sd-head .op', box).textContent = s.op;
    $('.sd-dur', box).textContent = durText;
    $('.sd-title', box).textContent = s.title;
    $('.sd-sub', box).textContent = s.sub;
    $$('.sd-tags span', box).forEach((el, k) => { const key = Object.keys(tags)[k]; el.querySelector('em').textContent = key; el.querySelector('b').textContent = tags[key]; });
    const ev = $('.sd-events', box);
    const events = s.pending && approvedState ? [...s.events.slice(0, 1), ['done', 'Invite drafted in your email app. One click on Send to go ✉']] : s.events;
    for (let k = 0; k < events.length; k++) {
      if (token !== detailToken) return;
      const [lv, msg] = events[k];
      const row = document.createElement('div');
      row.className = `log-line ${lv}`;
      const icon = { ok: '✔', info: '›', warn: '⏳', done: '★' }[lv];
      row.innerHTML = `<span class="ts">+${String(k * 12 + 3).padStart(3, '0')}ms</span><span class="lv ${lv}">${icon}</span><span class="msg"></span>`;
      row.querySelector('.msg').textContent = msg;
      ev.appendChild(row);
      if (animate && !reduce) await sleep(90);
    }
  }

  function initTrace() {
    const wf = $('#waterfall');
    if (!wf) return;
    const total = monthsBetween(AXIS.from, AXIS.to);
    const pos = (ym) => (monthsBetween(AXIS.from, ym) / total) * 100;
    const nowPos = pos(nowYM);
    wf.style.setProperty('--yr', `${(12 / total) * 100}%`);
    const hex = () => Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) => b.toString(16).padStart(2, '0')).join('');
    $('#trace-id').textContent = `${hex()}…${hex().slice(0, 3)}`;
    $('#span-count').textContent = SPANS.length;

    wf.innerHTML = SPANS.map((s, i) => {
      const l = pos(s.from);
      const w = Math.max(0.9, pos(s.to) - l);
      const m = monthsBetween(s.from, s.to === NOW_END ? nowYM : s.to);
      const label = s.pending ? 'pending' : fmtDur(Math.max(1, m));
      const inside = w > 12;
      const durStyle = inside ? '' : l + w < 80 ? `left:calc(${l + w}% + 8px)` : `right:calc(${100 - l}% + 8px)`;
      return `<button class="wf-row${s.depth === 0 ? ' root' : ''}" type="button" aria-pressed="false" data-i="${i}" style="--depth:${s.depth}">
        <span class="sp-label"><i style="background:${s.color}"></i><b></b><span class="op"></span></span>
        <span class="sp-track"><span class="sp-now" style="left:${nowPos}%"></span>
          <span class="sp-bar${s.live ? ' live' : ''}${s.pending ? ' pending' : ''}" style="left:${l}%;width:${w}%;--c:${s.color}">${inside ? `<span class="sp-dur in">${label}</span>` : ''}</span>
          ${inside ? '' : `<span class="sp-dur" style="${durStyle}">${label}</span>`}
        </span>
      </button>`;
    }).join('') +
      `<div class="wf-axis" aria-hidden="true"><span></span><div class="wf-ticks">${Array.from({ length: AXIS.to[0] - AXIS.from[0] + 1 }, (_, k) => [AXIS.from[0] + k, pos([AXIS.from[0] + k, 1])]).filter(([, p]) => Math.abs(p - nowPos) > 3.5).map(([y, p]) => `<span style="left:${p}%">${y}</span>`).join('')}<i class="wf-nowlabel" style="left:${nowPos}%">now</i></div></div>`;

    $$('.wf-row', wf).forEach((row, i) => {
      $('.sp-label b', row).textContent = SPANS[i].svc;
      $('.sp-label .op', row).textContent = SPANS[i].op;
      row.addEventListener('click', () => { userPicked = true; showSpan(i); });
    });

    const rows = $$('.wf-row', wf);
    const status = $('#trace-status');
    const done = () => {
      status.className = approvedState ? 'badge success' : 'badge waiting';
      status.textContent = approvedState ? '202 · invite drafted' : '200 OK · 1 pending';
    };
    onVisible($('#trace'), async () => {
      if (reduce) { rows.forEach((r) => r.classList.add('loaded')); done(); if (!userPicked) showSpan(SPANS.length - 1, false); return; }
      status.className = 'badge running';
      status.textContent = 'loading…';
      for (let i = 0; i < rows.length; i++) {
        rows[i].classList.add('loaded');
        if (i > 0 && !userPicked) { showSpan(i); await sleep(SPANS[i].events.length * 90 + 380); } else await sleep(userPicked ? 160 : 350);
      }
      done();
      if (!userPicked) showSpan(SPANS.length - 1);
    }, 0.3);
  }

  function markApproved() {
    approvedState = true;
    const rows = $$('.wf-row');
    const last = rows[rows.length - 1];
    if (last) last.classList.add('approved');
    const status = $('#trace-status');
    if (status) { status.className = 'badge success'; status.textContent = '202 · invite drafted'; }
  }

  /* ---------------- demo: AI agent race ---------------- */
  function initAgentDemo() {
    const btn = $('#agent-run');
    if (!btn) return;
    const log = $('#agent-log'), report = $('#agent-report');
    const mBar = $('#race-manual'), aBar = $('#race-agent'), mT = $('#t-manual'), aT = $('#t-agent');
    const SPEED = 20; // simulated seconds per real second
    const AGENT = 90, MANUAL = 45 * 60;
    const steps = [
      [0, 'run', 'Pulling live sprint data from Azure DevOps'],
      [8, 'ok', 'Fetched sprint backlog, PBIs and PR activity (live data)'],
      [28, 'ok', 'Aggregated completion, scope change and carry-overs'],
      [46, 'warn', 'Flagged risks: carry-overs, PBI and PR bottlenecks'],
      [64, 'ok', 'Claude drafted 3 role-specific report views'],
      [90, 'fin', 'Report ready in ~90 s. Shared with the team.'],
    ];
    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    let running = false;

    async function run() {
      if (running) return;
      running = true; btn.disabled = true; btn.textContent = '● running';
      log.innerHTML = ''; report.hidden = true;
      let si = 0;
      const t0 = performance.now();
      await new Promise((done) => {
        const tick = (t) => {
          const sim = Math.min(AGENT, ((t - t0) / 1000) * SPEED * (reduce ? 50 : 1));
          aBar.style.width = `${(sim / AGENT) * 100}%`;
          mBar.style.width = `${(sim / MANUAL) * 100}%`;
          aT.textContent = fmt(sim); mT.textContent = fmt(sim);
          while (si < steps.length && sim >= steps[si][0]) {
            const [ts, cls, msg] = steps[si++];
            const row = document.createElement('div');
            row.className = `row ${cls}`;
            row.innerHTML = `<span class="t">[${fmt(ts)}]</span><span class="m"></span>`;
            row.querySelector('.m').textContent = msg;
            log.appendChild(row);
          }
          if (sim < AGENT) requestAnimationFrame(tick); else done();
        };
        requestAnimationFrame(tick);
      });
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `<span class="t">[manual]</span><span class="m">still copy-pasting… ${((AGENT / MANUAL) * 100).toFixed(1)}% done</span>`;
      log.appendChild(row);
      report.hidden = false;
      running = false; btn.disabled = false; btn.textContent = '↻ Replay';
    }
    btn.addEventListener('click', run);
    onVisible($('#agent-demo'), () => setTimeout(run, 500), 0.5);
  }

  /* ---------------- demo: buildout grid ---------------- */
  function initSvcDemo() {
    const grid = $('#svc-grid');
    if (!grid) return;
    const N = 42;
    const names = ['api', 'auth', 'queue', 'cache', 'kv', 'sql', 'blob', 'web', 'job', 'cdn', 'dns', 'logs', 'mon', 'bus'];
    grid.innerHTML = Array.from({ length: N }, (_, i) => `<span class="svc${i % 3 === 2 ? ' nc' : ''}">${names[i % names.length]}-${String(Math.floor(i / names.length) + 1)}</span>`).join('');
    $('#svc-total').textContent = N;
    const cells = $$('.svc', grid);
    const btn = $('#svc-run');
    let running = false;
    async function run() {
      if (running) return;
      running = true; btn.disabled = true;
      cells.forEach((c) => c.classList.remove('ready', 'deploying'));
      $('#svc-ready').textContent = '0';
      const order = cells.map((_, i) => i).sort(() => Math.random() - 0.5);
      let ready = 0;
      const wave = 6;
      for (let k = 0; k < order.length; k += wave) {
        const batch = order.slice(k, k + wave).map((i) => cells[i]);
        batch.forEach((c) => c.classList.add('deploying'));
        await sleep(reduce ? 0 : 380);
        batch.forEach((c) => { c.classList.remove('deploying'); c.classList.add('ready'); });
        ready += batch.length;
        $('#svc-ready').textContent = ready;
      }
      running = false; btn.disabled = false; btn.textContent = '↻ Re-run';
    }
    btn.addEventListener('click', run);
    onVisible($('#svc-demo'), () => setTimeout(run, 400), 0.5);
  }

  /* ---------------- demo: chat ---------------- */
  function initChatDemo() {
    const body = $('#chat-body');
    if (!body) return;
    const convo = [
      { q: 'Where is the design doc for the file-sync service?', a: 'It’s in the project wiki under Architecture › Sync. The API contract and the on-call guide are linked from the same page.', src: ['wiki/architecture/sync', 'docs/api-contract.md'] },
      { q: 'Who owns the search indexing component?', a: 'The Search team owns it. The ownership page lists their alias and the escalation path.', src: ['wiki/ownership', 'wiki/search-team'] },
    ];
    let visible = false, started = false;
    const add = (cls, html) => { const b = document.createElement('div'); b.className = `bubble ${cls}`; b.innerHTML = html; body.appendChild(b); return b; };
    const answer = (c) => `${esc(c.a)}<div class="src">${c.src.map((s) => `<span>📄 ${esc(s)}</span>`).join('')}</div>`;
    if (reduce) { const c = convo[0]; add('user', esc(c.q)); add('bot', answer(c)); return; }
    async function play() {
      while (true) {
        for (const c of convo) {
          while (!visible) await sleep(400);
          if (body.children.length > 3) body.innerHTML = '';
          add('user', esc(c.q));
          await sleep(700);
          const t = add('bot', '<span class="typing"><i></i><i></i><i></i></span>');
          await sleep(1300);
          t.innerHTML = answer(c);
          await sleep(3600);
        }
      }
    }
    watchVisibility(body, (v) => { visible = v; if (v && !started) { started = true; play(); } });
  }

  /* ---------------- demo: cache simulator ---------------- */
  function initCacheDemo() {
    const c = $('#cache-canvas');
    if (!c) return;
    const ctx = c.getContext('2d');
    const toggle = $('#cache-toggle');
    const latEl = $('#c-lat'), hitEl = $('#c-hit'), dbEl = $('#c-db');
    let w, h, nodes, reqs = [], last = 0, spawnAcc = 0, running = false, raf = 0;
    let lat = [], hits = 0, total = 0, dbq = 0;

    function layout() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const dev = Array.from({ length: 5 }, (_, i) => ({ x: w * 0.09, y: h * (0.14 + i * 0.18) }));
      nodes = { dev, api: { x: w * 0.42, y: h * 0.5 }, redis: { x: w * 0.82, y: h * 0.26 }, db: { x: w * 0.82, y: h * 0.76 } };
    }

    function spawn() {
      const d = nodes.dev[(Math.random() * nodes.dev.length) | 0];
      const on = toggle.checked;
      const hit = on && Math.random() < 0.9;
      const { api, redis, db } = nodes;
      let pts, durs, ms;
      if (on && hit) { pts = [d, api, redis, api, d]; durs = [380, 260, 260, 380]; ms = 70 + Math.random() * 20; }
      else if (on) { pts = [d, api, redis, db, api, d]; durs = [380, 260, 420, 900, 380]; ms = 205 + Math.random() * 25; }
      else { pts = [d, api, db, api, d]; durs = [380, 950, 950, 380]; ms = 190 + Math.random() * 20; }
      reqs.push({ pts, durs, seg: 0, t: 0, hit, ms, color: hit ? '#ec4899' : '#94a3b8' });
    }

    function box(n, label, color, sub) {
      ctx.fillStyle = 'rgba(255,255,255,.04)';
      ctx.strokeStyle = color; ctx.lineWidth = 1.5;
      const bw = Math.min(100, w * 0.2), bh = 44;
      roundRect(n.x - bw / 2, n.y - bh / 2, bw, bh, 10); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = '600 12px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillText(label, n.x, n.y + (sub ? -1 : 4));
      if (sub) { ctx.fillStyle = '#6b7290'; ctx.font = '10px "JetBrains Mono", monospace'; ctx.fillText(sub, n.x, n.y + 13); }
    }
    function roundRect(x, y, ww, hh, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + ww, y, x + ww, y + hh, r); ctx.arcTo(x + ww, y + hh, x, y + hh, r);
      ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + ww, y, r); ctx.closePath();
    }

    function drawScene() {
      ctx.clearRect(0, 0, w, h);
      const on = toggle.checked;
      const { api, redis, db, dev } = nodes;
      ctx.lineWidth = 1; ctx.setLineDash([4, 5]);
      ctx.strokeStyle = 'rgba(255,255,255,.12)';
      dev.forEach((d) => { ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(api.x, api.y); ctx.stroke(); });
      ctx.strokeStyle = on ? 'rgba(239,68,68,.5)' : 'rgba(255,255,255,.06)';
      ctx.beginPath(); ctx.moveTo(api.x, api.y); ctx.lineTo(redis.x, redis.y); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,.18)';
      ctx.beginPath(); ctx.moveTo(api.x, api.y); ctx.lineTo(db.x, db.y); ctx.stroke();
      ctx.setLineDash([]);
      dev.forEach((d) => {
        ctx.fillStyle = 'rgba(34,211,238,.15)'; ctx.strokeStyle = '#22d3ee';
        roundRect(d.x - 14, d.y - 10, 28, 20, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#22d3ee'; ctx.fillRect(d.x - 6, d.y - 2, 12, 4);
      });
      ctx.fillStyle = '#6b7290'; ctx.font = '10px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillText('IoT devices', dev[0].x, dev[0].y - 18);
      box(api, 'API', '#8b5cf6', 'REST · X.509');
      ctx.globalAlpha = on ? 1 : 0.35; box(redis, 'Redis', '#ef4444', on ? '~80 ms' : 'off'); ctx.globalAlpha = 1;
      box(db, 'Database', '#64748b', '~200 ms');
    }

    function frame(t) {
      if (!running) { raf = 0; return; }
      const dt = Math.min(50, t - (last || t)); last = t;
      spawnAcc += dt;
      if (spawnAcc > 260) { spawnAcc = 0; spawn(); }
      drawScene();
      const { db } = nodes;

      for (let i = reqs.length - 1; i >= 0; i--) {
        const r = reqs[i];
        r.t += dt / r.durs[r.seg];
        if (r.t >= 1) {
          r.seg++; r.t = 0;
          if (r.pts[r.seg] === db) { dbq++; dbEl.textContent = dbq.toLocaleString('en-US'); }
          if (r.seg >= r.durs.length) {
            reqs.splice(i, 1);
            total++; if (r.hit) hits++;
            lat.push(r.ms); if (lat.length > 40) lat.shift();
            latEl.textContent = `${Math.round(lat.reduce((a, b) => a + b, 0) / lat.length)} ms`;
            hitEl.textContent = `${Math.round((hits / total) * 100)}%`;
            continue;
          }
        }
        const a = r.pts[r.seg], b = r.pts[r.seg + 1];
        const x = a.x + (b.x - a.x) * r.t, y = a.y + (b.y - a.y) * r.t;
        ctx.shadowColor = r.color; ctx.shadowBlur = 10; ctx.fillStyle = r.color;
        ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(frame);
    }

    function staticStats() {
      const on = toggle.checked;
      latEl.textContent = on ? '~80 ms' : '~200 ms';
      hitEl.textContent = on ? 'cached' : 'off';
      dbEl.textContent = on ? 'fewer' : 'every call';
    }

    toggle.addEventListener('change', () => {
      reqs = []; spawnAcc = 0; lat = []; hits = 0; total = 0; dbq = 0;
      latEl.textContent = '--'; hitEl.textContent = '--'; dbEl.textContent = '0';
      if (reduce) { drawScene(); staticStats(); }
    });
    layout();
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); if (reduce) drawScene(); }, 150); });
    if (reduce) { drawScene(); staticStats(); return; }
    watchVisibility(c, (v) => { running = v; last = 0; if (v && !raf) raf = requestAnimationFrame(frame); });
  }

  /* ---------------- demo: watch ---------------- */
  function initWatch() {
    const screens = $$('.w-screen');
    if (!screens.length) return;
    let i = 0;
    screens[0].classList.add('on');
    if (reduce) return;
    let timer = null;
    watchVisibility($('.watch'), (v) => {
      if (v && !timer) timer = setInterval(() => { screens[i].classList.remove('on'); i = (i + 1) % screens.length; screens[i].classList.add('on'); }, 4200);
      else if (!v && timer) { clearInterval(timer); timer = null; }
    });
  }

  /* ---------------- side projects ---------------- */
  function initTabsViz() {
    const ticks = $$('[data-tick]');
    if (!ticks.length || reduce) return;
    const s = ticks.map(() => Math.floor(Math.random() * 600));
    setInterval(() => {
      ticks.forEach((el, i) => {
        s[i] += +el.dataset.tick;
        el.textContent = `${String(Math.floor(s[i] / 60) % 100).padStart(2, '0')}:${String(s[i] % 60).padStart(2, '0')}`;
      });
    }, 1000);
  }

  /* ---------------- skills ---------------- */
  function initSkills() {
    const cloud = $('#skill-cloud');
    if (!cloud) return;
    const CAT = { backend: '#22d3ee', lang: '#a78bfa', cloud: '#4f8cff', ai: '#ec4899', cs: '#22c55e', mobile: '#f59e0b' };
    const S = [
      ['Distributed Systems', 'backend', 1], ['REST APIs', 'backend', 1], ['Microservices', 'backend', 1], ['System Design', 'backend', 1],
      ['Spring Boot', 'backend', 1], ['.NET', 'backend', 1], ['Redis', 'backend', 1], ['Kafka', 'backend', 1], ['Caching', 'backend'],
      ['NoSQL', 'backend'], ['DBMS', 'backend'], ['API Security (X.509)', 'backend'],
      ['Java', 'lang', 1], ['C#', 'lang', 1], ['Python', 'lang'], ['Kotlin', 'lang'], ['SQL', 'lang'], ['C', 'lang'],
      ['Azure', 'cloud', 1], ['AWS', 'cloud', 1], ['AWS IoT', 'cloud'], ['Azure Cognitive Search', 'cloud'], ['ARM Templates', 'cloud'],
      ['Azure DevOps', 'cloud'], ['CI/CD', 'cloud'], ['PowerShell', 'cloud'], ['Git', 'cloud'],
      ['AI Agents', 'ai', 1], ['Claude', 'ai'], ['AutoGen', 'ai'], ['AgentChat', 'ai'],
      ['Data Structures', 'cs'], ['Algorithms', 'cs'], ['Operating Systems', 'cs'], ['OOP', 'cs'], ['Agile / Scrum', 'cs'],
      ['Android', 'mobile'], ['Wear OS', 'mobile'],
    ];
    cloud.innerHTML = S.map(([n, c, f]) => `<span class="skill${f ? ' featured' : ''}" data-cat="${c}" style="--c:${CAT[c]}"><i></i>${esc(n)}</span>`).join('');
    const tabs = $$('#skill-tabs button');
    tabs.forEach((t) => t.addEventListener('click', () => {
      tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
      const f = t.dataset.filter;
      $$('.skill', cloud).forEach((s) => {
        const match = f === 'all' || s.dataset.cat === f;
        s.classList.toggle('dim', !match);
        s.classList.toggle('hot', f !== 'all' && match);
      });
    }));
    const mq = $('#marquee');
    if (mq) {
      const words = ['Distributed Systems', 'REST APIs', 'Java', 'Spring Boot', 'C#', '.NET', 'Microservices', 'Redis', 'Kafka', 'System Design', 'Azure', 'AWS', 'AI Agents', 'NoSQL', 'Kotlin', 'Python'];
      const row = words.map((w) => `<span>${esc(w)}</span><span>✦</span>`).join('');
      mq.innerHTML = row + row;
    }
  }

  /* ---------------- approve + confetti + toast ---------------- */
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast.tm);
    toast.tm = setTimeout(() => t.classList.remove('show'), 3200);
  }

  function confetti() {
    if (reduce) return;
    const c = $('#confetti');
    const ctx = c.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = ['#4f8cff', '#8b5cf6', '#ec4899', '#22c55e', '#f59e0b', '#22d3ee', '#ffffff'];
    const parts = Array.from({ length: 180 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 200, y: innerHeight * 0.6,
      vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 18 - 6,
      r: Math.random() * 6 + 4, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
      c: cols[(Math.random() * cols.length) | 0], life: 0,
    }));
    const tick = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      let alive = 0;
      for (const p of parts) {
        p.vy += 0.42; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
        if (p.y < innerHeight + 40) alive++;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, 1 - p.life / 220);
        ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        ctx.restore();
      }
      if (alive && parts[0].life < 240) requestAnimationFrame(tick); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    };
    tick();
  }

  async function copyEmail() {
    let ok = false;
    try { await navigator.clipboard.writeText(CONFIG.email); ok = true; }
    catch {
      const ta = document.createElement('textarea');
      ta.value = CONFIG.email; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
    }
    toast(ok ? `Copied ${CONFIG.email}` : `Couldn't copy automatically. The email is ${CONFIG.email}`);
  }

  function initApprove() {
    const btn = $('#approve-btn');
    if (!btn) return;
    btn.href = mailtoHref();
    const code = $('#req-body');
    if (code) {
      const body = { candidate: 'shipra-gupta', role, company: company || 'your-team', experience_years: years, focus: ['backend', 'APIs', 'distributed systems'], available: true };
      const json = JSON.stringify(body, null, 2).replace(/\[\n\s+([^\]]*?)\n\s+\]/g, (m, inner) => `[${inner.split(/,\n\s+/).join(', ')}]`);
      code.innerHTML = json.split('\n').map(highlightJSON).join('\n');
    }
    // The anchor's own mailto: navigation opens the email client; this only updates the UI.
    btn.addEventListener('click', () => {
      $('#approve').classList.add('approved');
      $('#gate-icon').textContent = '✉';
      $('#gate-title').textContent = 'Almost there. Hit send in your email app.';
      const st = $('#req-status');
      st.textContent = '→ draft opened in your email app';
      st.classList.add('ok');
      $('#gate-note').textContent = `A pre-filled invite should be open in your email app. If nothing opened, write to ${CONFIG.email}`;
      markApproved();
      confetti();
    });
    $('#copy-email').addEventListener('click', copyEmail);
  }

  /* ---------------- easter eggs ---------------- */
  function initEasterEggs() {
    let buf = '';
    addEventListener('keydown', (e) => {
      if (e.target.closest && e.target.closest('input, textarea')) return;
      buf = (buf + e.key.toLowerCase()).slice(-4);
      if (buf === 'hire') { confetti(); toast('Great idea. Scroll to the bottom and press “Compose interview invite” 😉'); }
    });
    const style = 'font:600 14px/1.6 monospace;color:#c4b5fd';
    console.log('%c👋 Hi, fellow engineer. Thanks for opening DevTools.', style);
    console.log(`%cNo frameworks here, just vanilla JS, canvas and SVG. Want to talk? ${CONFIG.email}`, 'font:12px monospace;color:#a0a7bd');
  }

  /* ---------------- boot ---------------- */
  if (reduce) {
    $$('svg').forEach((s) => s.pauseAnimations && s.pauseAnimations());
    $$('.flow .pkt').forEach((p) => p.remove());
  }
  personalize();
  initNav();
  initBento();
  initTrace();
  initReveal();
  initPointerFx();
  initHeroCanvas();
  initScramble();
  initHeroTerminal();
  initAgentDemo();
  initSvcDemo();
  initChatDemo();
  initCacheDemo();
  initWatch();
  initTabsViz();
  initSkills();
  initApprove();
  initEasterEggs();
})();
