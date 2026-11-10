/* =====================================================================
   Portfolio interactions
   - motion on/off (persisted per session, respects reduced-motion)
   - scramble "signal" text, glass nav that hides on scroll-down
   - hero portrait rendered as a WebGL particle cloud that dissolves on scroll
   - 3-shape point-cloud explorer (Build / Train / Deploy)
   - GSAP + ScrollTrigger reveals, Lenis smooth scroll (all optional: page works without them)
   ===================================================================== */
(() => {
    'use strict';
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const root = document.documentElement;
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    try { history.scrollRestoration = 'manual'; } catch (e) {}   // always start at the hero on reload
    const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
    const EMAIL = 'anssaleem504@gmail.com';

    /* ---------------------------------------------------------------
       Motion state
    --------------------------------------------------------------- */
    const motionOn = () => root.dataset.motion !== 'off';
    const motionListeners = [];
    const motionBtn = $('#motionToggle');

    function setMotion(on, persist) {
        root.dataset.motion = on ? 'on' : 'off';
        motionBtn.setAttribute('aria-pressed', String(on));
        motionBtn.setAttribute('aria-label', on ? 'Motion on, pause animations' : 'Motion off, enable animations');
        $('#motionIcon').textContent = on ? '❚❚' : '▶';
        $('#motionText').textContent = on ? 'MOTION ON' : 'MOTION OFF';
        if (persist) { try { sessionStorage.setItem('motion', on ? 'on' : 'off'); } catch (e) {} }
    }
    let stored = null;
    try { stored = sessionStorage.getItem('motion'); } catch (e) {}
    setMotion(!reduceMQ.matches && stored !== 'off', false);
    motionBtn.addEventListener('click', () => setMotion(!motionOn(), true));
    new MutationObserver(() => motionListeners.forEach(fn => fn())).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
    reduceMQ.addEventListener('change', () => { if (reduceMQ.matches) setMotion(false, false); });
    const onMotionChange = (fn) => motionListeners.push(fn);

    /* ---------------------------------------------------------------
       SignalText: characters resolve out of "01/·—" noise
    --------------------------------------------------------------- */
    const NOISE = '01/·—';
    function SignalText(el) {
        let text = el.textContent;
        el.textContent = '';
        const sr = document.createElement('span'); sr.className = 'sr-only';
        const size = document.createElement('span'); size.className = 'signal-text-size'; size.setAttribute('aria-hidden', 'true');
        const live = document.createElement('span'); live.className = 'signal-text-live'; live.setAttribute('aria-hidden', 'true');
        el.append(sr, size, live);
        let raf = 0, t0 = 0, last = 0, lastPlay = -Infinity;
        const set = (t) => { text = t; sr.textContent = size.textContent = live.textContent = t; };
        set(text);
        const settle = () => { cancelAnimationFrame(raf); live.textContent = text; };
        const step = (now) => {
            if (!motionOn() || document.hidden) return settle();
            if (!t0) t0 = now;
            const k = Math.min((now - t0) / 550, 1);
            if (now - last > 32) {
                live.textContent = [...text].map((c, i) => (c === ' ' || i < text.length * k) ? c : NOISE[(i + Math.floor(now / 50)) % NOISE.length]).join('');
                last = now;
            }
            if (k < 1) raf = requestAnimationFrame(step); else settle();
        };
        const play = () => {
            if (!motionOn() || performance.now() - lastPlay < 1000) return;
            settle(); t0 = 0; last = 0; lastPlay = performance.now();
            raf = requestAnimationFrame(step);
        };
        const host = el.closest('button, a') || el.parentElement;
        host && host.addEventListener('pointerenter', play);
        host && host.addEventListener('focusin', play);
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { play(); io.disconnect(); } }, { threshold: .5 });
        io.observe(el);
        onMotionChange(() => { if (!motionOn()) settle(); });
        return { set, play };
    }
    const sigs = new Map();
    $$('[data-sig]').forEach(el => sigs.set(el, SignalText(el)));

    /* ---------------------------------------------------------------
       Navigation
    --------------------------------------------------------------- */
    const nav = $('#navigation'), menuBtn = $('#menuToggle'), links = $('#main-nav');
    let menuOpen = false;
    function setMenu(open) {
        menuOpen = open;
        links.classList.toggle('is-open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        $('span', menuBtn).textContent = open ? 'Close' : 'Menu';
        if (open) nav.dataset.hidden = 'false';
    }
    menuBtn.addEventListener('click', () => setMenu(!menuOpen));
    addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) { setMenu(false); menuBtn.focus(); } });
    addEventListener('pointerdown', e => { if (menuOpen && !nav.contains(e.target)) setMenu(false); });
    matchMedia('(min-width: 901px)').addEventListener('change', e => e.matches && setMenu(false));

    // active section
    const navLinks = $$('.nav-destination');
    const spy = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (!en.isIntersecting) return;
            navLinks.forEach(a => a.getAttribute('href') === '#' + en.target.id ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current'));
        });
    }, { rootMargin: '-15% 0px -65% 0px' });
    ['top', 'work', 'about', 'skills', 'journey', 'contact'].forEach(id => { const s = document.getElementById(id); s && spy.observe(s); });

    // hide on scroll down, show on scroll up
    let lastY = scrollY, acc = 0, navTick = 0;
    function navScroll() {
        navTick = 0;
        const y = clamp(scrollY, 0, root.scrollHeight - innerHeight), d = y - lastY;
        if (Math.abs(d) < .5) return;
        lastY = y;
        acc = Math.sign(d) === Math.sign(acc) ? acc + d : d;
        const focusInside = nav.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
        if (y < 100 || menuOpen || focusInside) { nav.dataset.hidden = 'false'; acc = 0; return; }
        if (acc > 28) { nav.dataset.hidden = 'true'; acc = 0; }
        if (acc < -8) { nav.dataset.hidden = 'false'; acc = 0; }
    }

    /* ---------------------------------------------------------------
       Scroll narrative: progress bar + hero progress
    --------------------------------------------------------------- */
    const narrative = { hero: 0, pointerX: 0, pointerY: 0 };
    const bar = $('#progress'), heroEl = $('.hero');
    function onScroll() {
        const h = root.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${h > 0 ? clamp(scrollY / h, 0, 1) : 0})`;
        narrative.hero = clamp(scrollY / Math.max(1, heroEl.offsetHeight), 0, 1);
        if (!navTick) navTick = requestAnimationFrame(navScroll);
    }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('pointermove', e => {
        narrative.pointerX = e.clientX / innerWidth - .5;
        narrative.pointerY = e.clientY / innerHeight - .5;
    }, { passive: true });
    onScroll();

    /* ---------------------------------------------------------------
       Tiny WebGL helpers
    --------------------------------------------------------------- */
    function getGL(canvas) {
        try { return canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' }); }
        catch (e) { return null; }
    }
    function makeProgram(gl, vsSrc, fsSrc) {
        const mk = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src); gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
            return s;
        };
        const p = gl.createProgram();
        gl.attachShader(p, mk(gl.VERTEX_SHADER, vsSrc));
        gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fsSrc));
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
        return p;
    }
    const PERSPECTIVE_Z = 'gl_Position=vec4(r.x*uF/uAspect, r.y*uF, -1.004008*z-0.2004008, -z);';

    /* ---------------------------------------------------------------
       Hero: portrait as particle cloud
    --------------------------------------------------------------- */
    const HERO_VS = `
    attribute vec3 position; attribute vec3 aColor; attribute float aSeed; attribute float aW;
    uniform float uTime, uProgress, uScale, uDpr, uRotY, uOffY, uF, uAspect;
    varying vec3 vColor; varying float vAlpha;
    void main(){
        float p = smoothstep(.02, .8, uProgress);
        vec3 target = vec3((aSeed-.5)*2.5, sin(aSeed*25.1327)*.055 + (floor(position.x*4.+2.)-2.)*.18, sin(aSeed*18.)*.1);
        vec3 pos = mix(position, target, p);
        float edge = smoothstep(.18, .5, abs(position.x));
        pos.x += sin(uTime*.3 + aSeed*40.)*.008*(edge+p);
        pos.z += sin(aSeed*64. + uTime*.2)*.015;
        pos *= uScale;
        float c = cos(uRotY), s = sin(uRotY);
        vec3 r = vec3(c*pos.x + s*pos.z, pos.y + uOffY, -s*pos.x + c*pos.z);
        float z = r.z - 6.;
        ${PERSPECTIVE_Z}
        float lum = dot(aColor, vec3(.299,.587,.114));
        gl_PointSize = (1.35 + lum*1.1)*uDpr;
        vColor = mix(aColor, vec3(1.,.44,.18), p*.55);
        vAlpha = (1. - p*.35) * smoothstep(-.5,-.3,position.y) * aW;
    }`;
    const HERO_FS = `
    precision mediump float;
    varying vec3 vColor; varying float vAlpha;
    void main(){
        float d = length(gl_PointCoord - .5);
        float alpha = smoothstep(.5,.27,d) * vAlpha;
        if (alpha < .025) discard;
        gl_FragColor = vec4(vColor*1.25, alpha);
    }`;

    const scene = $('#scene'), heroCanvas = $('#heroCanvas'), artifact = $('#artifact');
    const hero = { gl: null, prog: null, buf: null, count: 0, running: false, raf: 0, progress: 0, rotY: 0, loaded: false, failed: false, loading: false, visible: true, lastT: 0 };
    // embedded data URI first (never taints the canvas, so it works from file:// too), then the file on disk
    const HERO_SOURCES = [window.HERO_IMG, 'images/hero-signal.png'].filter(Boolean);

    function loadFirst(list, i = 0) {
        return new Promise((res, rej) => {
            if (i >= list.length) return rej(new Error('no image'));
            const img = new Image();
            if (location.protocol.startsWith('http')) img.crossOrigin = 'anonymous';
            img.onload = () => res(img);
            img.onerror = () => loadFirst(list, i + 1).then(res, rej);
            img.src = list[i];
        });
    }

    function sampleImage(img) {
        const n = innerWidth < 700 ? 220 : 440, l = Math.round(n * 1.25);
        const c = document.createElement('canvas'); c.width = n; c.height = l;
        const x = c.getContext('2d', { willReadFrequently: true });
        const s = Math.max(n / img.naturalWidth, l / img.naturalHeight);
        x.drawImage(img, (n - img.naturalWidth * s) / 2, 0, img.naturalWidth * s, img.naturalHeight * s);
        const d = x.getImageData(0, 0, n, l).data; // throws if canvas is tainted (file://)

        // background colour = average of the four corners
        let br = 0, bg = 0, bb = 0, k = 0;
        [[0, 0], [n - 6, 0], [0, l - 6], [n - 6, l - 6]].forEach(([cx, cy]) => {
            for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) {
                const o = ((cy + j) * n + cx + i) * 4; br += d[o]; bg += d[o + 1]; bb += d[o + 2]; k++;
            }
        });
        br /= k * 255; bg /= k * 255; bb /= k * 255;
        const bgLum = .299 * br + .587 * bg + .114 * bb;
        // transparent PNG (background already removed) -> "cutout" mode
        const cut = d[3] < 20 && d[(n - 1) * 4 + 3] < 20 && d[(l - 1) * n * 4 + 3] < 20;
        const bright = !cut && bgLum > .3;
        const lift = (v) => Math.min(1, Math.pow(v, .58) * 1.2); // brings dark clothing out of the black

        const out = new Float32Array(n * l * 8);
        let m = 0;
        for (let y = 0; y < l; y++) for (let xx = 0; xx < n; xx++) {
            const o = (y * n + xx) * 4;
            let r = d[o] / 255, g = d[o + 1] / 255, b = d[o + 2] / 255;
            let w = 1;
            if (cut) {
                const a = d[o + 3] / 255;
                if (a < .4) continue;
                w = a; r = lift(r); g = lift(g); b = lift(b);
            }
            const lum = .299 * r + .587 * g + .114 * b;
            if (cut) {
                // keep every subject pixel
            } else if (bright) {
                const dist = Math.hypot(r - br, g - bg, b - bb) / 1.732;
                if (dist < .12) continue;
                const ex = (xx / n - .5) / .5, ey = (y / l - .45) / .55, rr = Math.hypot(ex, ey);
                w = clamp((1 - rr) / .28, 0, 1);
                if (w < .04) continue;
            } else if (lum < .035) continue;
            out.set([(xx / n - .5) * .8, .5 - y / l, .025 * lum, r, g, b, ((127 * xx + 311 * y) % 997) / 997, w], m * 8);
            m++;
        }
        return { data: out.subarray(0, m * 8), count: m, bright };
    }

    async function initHero() {
        if (hero.loaded || hero.failed || hero.loading) return;
        hero.loading = true;
        try {
            const gl = getGL(heroCanvas);
            if (!gl) throw new Error('no webgl');
            const img = await loadFirst(HERO_SOURCES);
            const { data, count, bright } = sampleImage(img);
            if (!count) throw new Error('empty');
            artifact.classList.toggle('is-bright', bright);
            scene.classList.toggle('is-dark', !bright);
            hero.gl = gl;
            hero.prog = makeProgram(gl, HERO_VS, HERO_FS);
            hero.buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, hero.buf);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            hero.count = count;
            hero.loaded = true;
            heroCanvas.addEventListener('webglcontextlost', e => { e.preventDefault(); hero.failed = true; stopHero(); scene.classList.remove('is-live'); });
            startHero();
        } catch (e) {
            hero.failed = true;
            scene.classList.remove('is-live');
            // image-only fallback: decide bright/dark from the <img> itself when possible
            artifact.classList.add('is-bright');
        } finally { hero.loading = false; }
    }

    function drawHero(now) {
        const gl = hero.gl;
        const dpr = Math.min(devicePixelRatio || 1, 1.5);
        const cw = scene.clientWidth, ch = scene.clientHeight;
        if (heroCanvas.width !== Math.round(cw * dpr) || heroCanvas.height !== Math.round(ch * dpr)) {
            heroCanvas.width = Math.round(cw * dpr); heroCanvas.height = Math.round(ch * dpr);
        }
        gl.viewport(0, 0, heroCanvas.width, heroCanvas.height);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(hero.prog);

        const dt = Math.min((now - hero.lastT) / 1000 || .016, .1); hero.lastT = now;
        const k = 1 - Math.exp(-3 * dt);
        hero.progress += (narrative.hero - hero.progress) * k;
        hero.rotY += (.015 * narrative.pointerX - hero.rotY) * k;

        const worldH = 2 * 6 * Math.tan(21 * Math.PI / 180);
        const sr = scene.getBoundingClientRect(), ar = artifact.getBoundingClientRect();
        const uScale = ar.height / ch * worldH;
        const offY = worldH / 2 - (ar.top - sr.top + ar.height / 2) * worldH / ch;

        const u = (n, v) => gl.uniform1f(gl.getUniformLocation(hero.prog, n), v);
        u('uTime', now * .001); u('uProgress', hero.progress); u('uScale', uScale); u('uDpr', dpr);
        u('uRotY', hero.rotY); u('uOffY', offY); u('uF', 1 / Math.tan(21 * Math.PI / 180)); u('uAspect', cw / ch);

        gl.bindBuffer(gl.ARRAY_BUFFER, hero.buf);
        const attr = (name, size, off) => {
            const loc = gl.getAttribLocation(hero.prog, name);
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 32, off * 4);
        };
        attr('position', 3, 0); attr('aColor', 3, 3); attr('aSeed', 1, 6); attr('aW', 1, 7);
        gl.drawArrays(gl.POINTS, 0, hero.count);
    }
    function heroLoop(now) {
        hero.raf = 0;
        if (!hero.running) return;
        drawHero(now);
        scene.classList.add('is-live');
        hero.raf = requestAnimationFrame(heroLoop);
    }
    function startHero() {
        if (!hero.loaded || hero.running || !hero.visible || document.hidden || !motionOn()) return;
        hero.running = true; hero.lastT = performance.now();
        hero.raf = requestAnimationFrame(heroLoop);
    }
    function stopHero() { hero.running = false; cancelAnimationFrame(hero.raf); hero.raf = 0; }
    function heroWanted() { return motionOn() && innerWidth > 700 && !reduceMQ.matches; }
    function syncHero() {
        if (!heroWanted()) { stopHero(); scene.classList.remove('is-live'); return; }
        if (!hero.loaded) initHero(); else startHero();
    }
    new IntersectionObserver(([e]) => { hero.visible = e.isIntersecting; hero.visible ? startHero() : stopHero(); }).observe(heroEl);
    document.addEventListener('visibilitychange', () => document.hidden ? stopHero() : startHero());
    onMotionChange(syncHero);
    addEventListener('resize', () => { if (heroWanted() && !hero.loaded && !hero.failed) initHero(); else if (!heroWanted()) syncHero(); });
    syncHero();

    /* ---------------------------------------------------------------
       Signal explorer: Build / Train / Deploy
    --------------------------------------------------------------- */
    const DISC = [
        { name: 'STRUCTURE', shape: 'structure', title: 'Give an idea structure.', copy: 'Chatbots, voice agents and automations that connect real needs to working software.', href: '#work', link: 'Explore the products' },
        { name: 'RIPPLES', shape: 'ripples', title: 'Let models learn what matters.', copy: 'Computer vision with YOLOv11 and OpenCV, NLP, CNN / RNN models and LLM fine-tuning on custom data.', href: '#skills', link: 'Explore the toolkit' },
        { name: 'CONSTELLATION', shape: 'constellation', title: 'Bring models into the real world.', copy: 'AWS EC2 with Nginx, Docker and CI/CD pipelines, with production data on PostgreSQL and MongoDB.', href: '#journey', link: 'Explore the journey' }
    ];
    const ex = {
        visual: $('#exVisual'), canvas: $('#exCanvas'), btns: $$('#exOptions button'),
        index: 0, pulse: 0, gl: null, prog: null, running: false, raf: 0, visible: false, failed: false, built: false,
        weights: [1, 0, 0], pointer: [4, 4], lastT: 0, t: 0
    };
    const exLabel = sigs.get($('#exLabel'));

    function setDisc(i, click) {
        ex.index = i;
        const d = DISC[i];
        ex.btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
        $('#exCount').textContent = `0${i + 1} / 03`;
        $('#exTitle').textContent = d.title; $('#exCopy').textContent = d.copy;
        $('#exLink').setAttribute('href', d.href); $('#exLinkText').textContent = d.link;
        $('#exFallback').className = `signal-fallback shape-${d.shape}`;
        exLabel && exLabel.set(d.name);
        exLabel && exLabel.play();
        if (click) ex.pulse = 1;
    }
    ex.btns.forEach((b, i) => b.addEventListener('click', () => setDisc(i, true)));

    const EX_VS = `
    attribute vec3 position; attribute vec3 aTeach; attribute vec3 aConnect;
    uniform vec3 uWeights; uniform float uTime, uPulse, uRotY, uF, uAspect, uCamZ, uDpr; uniform vec2 uPointer;
    varying float vGlow;
    void main(){
        vec3 p = position*uWeights.x + aTeach*uWeights.y + aConnect*uWeights.z;
        float d = distance(p.xy, uPointer);
        float wave = sin(length(p.xy)*9. - uTime*2.5);
        p.z += wave*(.06 + .2*uWeights.y);
        p.xy += normalize(p.xy + vec2(.001))*sin(d*7. - uTime*4.)*exp(-d*1.5)*.16;
        p *= 1. + uPulse*.08;
        vGlow = .45 + .4*exp(-d*2.) + .15*wave;
        float c = cos(uRotY), s = sin(uRotY);
        vec3 r = vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z);
        float z = r.z - uCamZ;
        ${PERSPECTIVE_Z}
        gl_PointSize = clamp(13.*uDpr/(-z), 1., 4.*uDpr);
    }`;
    const EX_FS = `
    precision mediump float;
    varying float vGlow;
    void main(){
        float d = length(gl_PointCoord - .5);
        if (d > .5) discard;
        vec3 col = mix(vec3(.68,.65,.59), vec3(1.,.48,.22), smoothstep(.45,.9,vGlow));
        gl_FragColor = vec4(col, (1. - smoothstep(.1,.5,d))*.85);
    }`;

    function buildExplorer() {
        const gl = getGL(ex.canvas);
        if (!gl) throw new Error('no webgl');
        ex.prog = makeProgram(gl, EX_VS, EX_FS);
        const N = 2400, buf = new Float32Array(N * 9);
        for (let e = 0; e < N; e++) {
            const t = (e % 60) / 59, r = Math.floor(e / 60) / 39;
            const n = t * Math.PI * 2, i = .2 + 1.5 * r;
            const a = 1 - 2 * e / (N - 1), s = 2.399963 * e, o = Math.sqrt(1 - a * a);
            buf.set([
                (t - .5) * 3, (r - .5) * 2.8, .12 * Math.sin(18 * t),
                Math.cos(n) * i, Math.sin(n) * i, .2 * Math.sin(8 * i),
                Math.cos(s) * o * 1.6, 1.6 * a, Math.sin(s) * o * 1.6
            ], e * 9);
        }
        ex.buf = gl.createBuffer(); ex.count = N;
        gl.bindBuffer(gl.ARRAY_BUFFER, ex.buf); gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
        ex.gl = gl; ex.built = true;
        ex.canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); ex.failed = true; stopEx(); delete ex.visual.dataset.live; });
        ex.visual.addEventListener('pointermove', e => {
            const r = ex.visual.getBoundingClientRect();
            ex.pointer = [(e.clientX - r.left) / r.width * 4 - 2, 2 - (e.clientY - r.top) / r.height * 4];
        });
        ex.visual.addEventListener('pointerleave', () => { ex.pointer = [4, 4]; });
    }
    function drawEx(now) {
        const gl = ex.gl, prog = ex.prog;
        const dpr = Math.min(devicePixelRatio || 1, 1.25);
        const w = ex.visual.clientWidth, h = ex.visual.clientHeight;
        if (ex.canvas.width !== Math.round(w * dpr) || ex.canvas.height !== Math.round(h * dpr)) { ex.canvas.width = Math.round(w * dpr); ex.canvas.height = Math.round(h * dpr); }
        gl.viewport(0, 0, ex.canvas.width, ex.canvas.height);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
        gl.useProgram(prog);
        for (let i = 0; i < 3; i++) ex.weights[i] += ((i === ex.index ? 1 : 0) - ex.weights[i]) * .065;
        ex.pulse *= .93;
        const f = (n, v) => gl.uniform1f(gl.getUniformLocation(prog, n), v);
        gl.uniform3fv(gl.getUniformLocation(prog, 'uWeights'), ex.weights);
        gl.uniform2fv(gl.getUniformLocation(prog, 'uPointer'), ex.pointer);
        f('uTime', now * .001); f('uPulse', ex.pulse); f('uRotY', .18 * Math.sin(now * 15e-5));
        f('uF', 1 / Math.tan(20 * Math.PI / 180)); f('uAspect', w / h); f('uCamZ', 5.1); f('uDpr', dpr);
        gl.bindBuffer(gl.ARRAY_BUFFER, ex.buf);
        [['position', 0], ['aTeach', 3], ['aConnect', 6]].forEach(([n, o]) => {
            const loc = gl.getAttribLocation(prog, n);
            gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 36, o * 4);
        });
        gl.drawArrays(gl.POINTS, 0, ex.count);
    }
    function exLoop(now) {
        ex.raf = 0;
        if (!ex.running) return;
        if (now - ex.lastT > 32) { drawEx(now); ex.lastT = now; ex.visual.dataset.live = 'true'; }
        ex.raf = requestAnimationFrame(exLoop);
    }
    function startEx() {
        if (ex.failed || ex.running || !ex.visible || document.hidden || !motionOn() || innerWidth <= 700) return;
        try { if (!ex.built) buildExplorer(); } catch (e) { ex.failed = true; return; }
        ex.running = true; ex.raf = requestAnimationFrame(exLoop);
    }
    function stopEx() { ex.running = false; cancelAnimationFrame(ex.raf); ex.raf = 0; }
    new IntersectionObserver(([e]) => { ex.visible = e.isIntersecting; ex.visible ? startEx() : stopEx(); }).observe(ex.visual);
    document.addEventListener('visibilitychange', () => document.hidden ? stopEx() : startEx());
    onMotionChange(() => { if (motionOn()) startEx(); else { stopEx(); delete ex.visual.dataset.live; } });

    /* ---------------------------------------------------------------
       GSAP reveals + Lenis smooth scroll
    --------------------------------------------------------------- */
    let gctx = null, lenis = null;
    function setupGsap() {
        gctx && gctx.revert(); gctx = null;
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || !motionOn() || reduceMQ.matches) return;
        gsap.registerPlugin(ScrollTrigger);
        gctx = gsap.context(() => {
            gsap.fromTo('.hero .reveal-line', { yPercent: 105, filter: 'blur(5px)' }, { yPercent: 0, filter: 'blur(0px)', duration: 1.25, stagger: .12, ease: 'power4.out', clearProps: 'transform,filter' });
            gsap.fromTo('.hero-description > p', { filter: 'blur(3px)', y: 8 }, { filter: 'blur(0px)', y: 0, duration: .75, delay: .15, ease: 'power2.out', clearProps: 'filter,transform' });

            gsap.utils.toArray('[data-reveal]').forEach(el => gsap.fromTo(el, { y: 35 }, { y: 0, duration: .9, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
            gsap.utils.toArray('[data-editorial-reveal], .work-index > a').forEach(el => gsap.fromTo(el, { y: 32 }, { y: 0, duration: .85, ease: 'power3.out', clearProps: 'transform', scrollTrigger: { trigger: el, start: 'top 94%', once: true } }));
            gsap.utils.toArray('.chapter h2:not([data-editorial-reveal]), .impact-title h2').forEach(el => gsap.fromTo(el, { filter: 'blur(7px)', y: 14, opacity: .65 }, { filter: 'blur(0px)', y: 0, opacity: 1, duration: .75, ease: 'power2.out', immediateRender: false, clearProps: 'filter,transform,opacity', scrollTrigger: { trigger: el, start: 'top 91%', once: true } }));
            gsap.utils.toArray('.work-artwork').forEach(el => gsap.fromTo(el, { clipPath: 'inset(6% 3% 6% 3% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 40%', scrub: .65 } }));
            gsap.fromTo('.impact-value', { letterSpacing: '-.08em' }, { letterSpacing: '-.045em', ease: 'none', scrollTrigger: { trigger: '.impact-lead', start: 'top bottom', end: 'top 35%', scrub: .8 } });
            gsap.fromTo('.hero-content', { y: 0, opacity: 1 }, { y: -65, opacity: .35, ease: 'none', immediateRender: false, scrollTrigger: { trigger: '.hero', start: '25% top', end: 'bottom top', scrub: 1, invalidateOnRefresh: true } });
            addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
        });
    }
    let lenisRaf = 0;
    function setupLenis() {
        cancelAnimationFrame(lenisRaf); lenisRaf = 0;
        lenis && lenis.destroy(); lenis = null;
        if (typeof Lenis === 'undefined' || !motionOn() || reduceMQ.matches || !matchMedia('(pointer: fine)').matches) return;
        try {
            const l = new Lenis({ lerp: .13, smoothWheel: true, syncTouch: false });
            lenis = l;
            if (typeof ScrollTrigger !== 'undefined') l.on('scroll', ScrollTrigger.update);
            // drive Lenis ourselves (older builds have no autoRaf, which left the page unscrollable)
            const tick = (t) => { if (lenis !== l) return; l.raf(t); lenisRaf = requestAnimationFrame(tick); };
            lenisRaf = requestAnimationFrame(tick);
        } catch (e) { lenis = null; }
    }
    function setupMotion() { setupGsap(); setupLenis(); }
    onMotionChange(setupMotion);
    setupMotion();

    // in-page anchors (Lenis-aware)
    document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (!a || a.getAttribute('href') === '#') return;
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        setMenu(false);
        if (lenis) { e.preventDefault(); lenis.scrollTo(target, { offset: a.getAttribute('href') === '#top' ? 0 : -112 }); }
    });

    /* ---------------------------------------------------------------
       Counters
    --------------------------------------------------------------- */
    function countUp(el) {
        const target = +el.dataset.count;
        if (!motionOn()) { el.textContent = target; return; }
        const t0 = performance.now(), dur = 1800;
        const tick = t => {
            const p = Math.min((t - t0) / dur, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
    const cio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } }), { threshold: .6 });
    $$('[data-count]').forEach(el => cio.observe(el));

    /* ---------------------------------------------------------------
       Contact form -> Gmail compose
    --------------------------------------------------------------- */
    const form = $('#contactForm'), note = $('#formNote'), panel = $('#sendOptions');
    const submitBtn = $('button[type="submit"]', form);
    let draft = { subject: '', body: '' };

    function showOptions(show) {
        panel.hidden = !show;
        submitBtn.hidden = show;
        $$('input, textarea', form).forEach(f => { f.readOnly = show; });
        if (show) panel.focus({ preventScroll: false }); else note.textContent = '';
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = $('#name').value.trim(), email = $('#email').value.trim();
        const subject = $('#subject').value.trim(), message = $('#message').value.trim();
        const body = `From: ${name} (${email})\n\n${message}`;
        draft = { subject, body };

        // Gmail web compose
        $('#sendGmail').href = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${EMAIL}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        // default mail app (works on every device; mailto wants CRLF line breaks)
        $('#sendMailto').href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\n/g, '\r\n'))}`;
        $('#sendSummary').textContent = `To ${EMAIL} · Subject: ${subject}`;
        note.textContent = '';
        showOptions(true);
    });

    // handing off to Gmail / the mail app: confirm and clear the form
    const handedOff = (what) => {
        note.textContent = `Opening ${what} with your message. If nothing opened, email ${EMAIL} directly.`;
        setTimeout(() => { form.reset(); showOptions(false); note.textContent = `Opened ${what}. Press Send there to deliver your message. Thank you!`; }, 600);
    };
    $('#sendGmail').addEventListener('click', () => handedOff('Gmail'));
    $('#sendMailto').addEventListener('click', () => handedOff('your mail app'));

    $('#sendCopy').addEventListener('click', async () => {
        const text = `To: ${EMAIL}\nSubject: ${draft.subject}\n\n${draft.body}`;
        let ok = false;
        try { await navigator.clipboard.writeText(text); ok = true; } catch (err) {
            try {
                const ta = document.createElement('textarea');
                ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta);
                ta.select(); ok = document.execCommand('copy'); ta.remove();
            } catch (e2) { ok = false; }
        }
        note.textContent = ok ? `Copied. Paste it into any email app and send it to ${EMAIL}.` : `Could not copy automatically. Please email ${EMAIL} directly.`;
    });

    $('#sendEdit').addEventListener('click', () => { showOptions(false); $('#message').focus(); });
})();
