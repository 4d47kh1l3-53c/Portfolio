/* ---------- Intro preloader: terminal → wormhole warp → whiteout → site ---------- */
(() => {
    const root = document.documentElement;
    window.__introBooted = true;
    let resolveIntro;
    window.introDone = new Promise((r) => { resolveIntro = r; });

    const pl = document.getElementById('preloader');
    const guarded = [...document.querySelectorAll('.skip-link, nav, main, footer')];

    // Reduced motion, #hash links, or no preloader → go straight to the site
    if (!pl || !root.classList.contains('preloading')) {
        root.classList.remove('preloading');
        root.classList.add('intro-done');
        if (pl) pl.remove();
        resolveIntro();
        return;
    }

    /* ----- timeline (seconds, measured from the moment the warp starts) ----- */
    const SNAP_AT = 2.0;    // slow creep ends → time-skip snap
    const FLASH_AT = 3.5;   // event-horizon collapse + whiteout
    const FLASH_MS = 300;   // whiteout fade-in
    const L = 300;          // tunnel length
    const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    // Site palette (matches the hero): white, low-blue, medium-yellow, high-orange, critical-red
    const PAL = [[255, 255, 255], [77, 163, 255], [255, 197, 61], [255, 138, 61], [255, 90, 95]];
    const DENIALS = ['> Denied. Gravity does not accept NO.', '> Denied again. The void insists.', '> Resistance logged. Gravity wins. Answer YES.'];
    const REBOOT = ['> Rebooting from the void...', '> Ready. Initiate time-skip bridge bypass?'];
    let noCount = 0;
    const LINES = ['> Establishing quantum singularity hook...', '> Ready. Initiate time-skip bridge bypass?'];

    const $ = (s) => pl.querySelector(s);
    const term = $('#pl-terminal');
    const linesEl = $('.pl-lines');
    const actions = $('.pl-actions');
    const yesBtn = $('[data-pl="yes"]');
    const noBtn = $('[data-pl="no"]');
    const flash = $('.pl-flash');
    const live = document.createElement('div');
    live.className = 'sr-only';
    live.setAttribute('role', 'status');
    pl.appendChild(live);
    const hellEl = $('#pl-hell');
    const hellEmbers = $('#pl-hell-embers');
    const hellText = $('#pl-hell-text');
    const hellPanel = $('#pl-hell-panel');
    const hellPanelMsg = $('#pl-hell-panel-msg');
    const hellHint = $('#pl-hell-hint');
    const flameBtn = $('#pl-flame-btn');
    const ariseEl = $('#pl-arise');
    const ariseOkBtn = $('#pl-arise-ok');
    const shadowEl = $('#pl-shadow');
    const shadowSmoke = $('#pl-shadow-smoke');

    function spawnSmoke(n = 16) {
        shadowSmoke.textContent = '';
        const frag = document.createDocumentFragment();
        for (let i = 0; i < n; i++) {
            const s = document.createElement('span');
            s.className = 'pl-smoke';
            s.style.setProperty('--x', `${40 + Math.random() * 20}%`);
            s.style.setProperty('--s', `${8 + Math.random() * 14}px`);
            s.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * 70)}px`);
            s.style.setProperty('--dur', `${(1.8 + Math.random() * 1.4).toFixed(2)}s`);
            s.style.setProperty('--delay', `${(Math.random() * 0.9).toFixed(2)}s`);
            frag.appendChild(s);
        }
        shadowSmoke.appendChild(frag);
    }

    // Rises after ARISE is confirmed, holds with a confirmation line, then dissolves —
    // still just a detour: whatever calls this always continues on to reboot(), never the site.
    async function playShadowRise() {
        spawnSmoke();
        shadowEl.classList.add('show');
        await wait(1650);
        hellPanelMsg.textContent = 'A Shadow Soldier has arisen.';
        hellPanel.classList.add('show');
        await wait(1150);
        hellPanel.classList.remove('show');
        shadowEl.classList.add('dissolve');
        await wait(650);
        shadowEl.classList.remove('show', 'dissolve');
        shadowSmoke.textContent = '';
    }
    const HELL_LINES = ['Welcome to the void.', 'There is no exit marked "NO".', 'Gravity does not negotiate.'];

    // Move the flame to a random spot inside the hell scene, well clear of its edges
    function randFlamePos() {
        const w = hellEl.clientWidth, h = hellEl.clientHeight;
        const bw = 200, bh = 50;
        const x = 24 + Math.random() * Math.max(0, w - bw - 48);
        // stay in the lower band of the scene, clear of the hell text / system panel / hint above
        const top = Math.min(h * 0.66, h - bh - 40);
        const y = top + Math.random() * Math.max(0, h - top - bh - 24);
        return { x, y };
    }
    function placeFlame(pos) {
        flameBtn.style.left = `${pos.x}px`;
        flameBtn.style.top = `${pos.y}px`;
    }
    function dodgeFlame() {
        const curX = parseFloat(flameBtn.style.left) || 0;
        const curY = parseFloat(flameBtn.style.top) || 0;
        let next = randFlamePos(), tries = 0;
        while (Math.hypot(next.x - curX, next.y - curY) < 90 && tries < 6) { next = randFlamePos(); tries++; }
        placeFlame(next);
        flameBtn.classList.remove('dodge');
        void flameBtn.offsetWidth;   // restart the dodge animation
        flameBtn.classList.add('dodge');
    }

    // The flame dodges the first two attempts; the third attempt catches it and shows ARISE.
    // Resolves once the visitor clicks OK — never anything else.
    function runFlameTrial() {
        placeFlame(randFlamePos());
        flameBtn.classList.add('show');
        return new Promise((resolve) => {
            let attempts = 0;
            const onClick = () => {
                attempts++;
                if (attempts < 3) {
                    dodgeFlame();
                    return;
                }
                flameBtn.removeEventListener('click', onClick);
                flameBtn.classList.remove('show');
                hellPanel.classList.remove('show');
                hellHint.classList.remove('show');
                ariseEl.classList.add('show');
                ariseOkBtn.addEventListener('click', function onOk() {
                    ariseOkBtn.removeEventListener('click', onOk);
                    ariseEl.classList.remove('show');
                    resolve();
                }, { once: true });
            };
            flameBtn.addEventListener('click', onClick);
        });
    }

    function spawnEmbers(n = 26) {
        hellEmbers.textContent = '';
        const frag = document.createDocumentFragment();
        for (let i = 0; i < n; i++) {
            const e = document.createElement('span');
            e.className = 'pl-ember';
            e.style.setProperty('--s', `${(3 + Math.random() * 5).toFixed(1)}px`);
            e.style.setProperty('--x', `${(Math.random() * 100).toFixed(1)}%`);
            e.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * 90)}px`);
            e.style.setProperty('--dur', `${(2.4 + Math.random() * 2.4).toFixed(2)}s`);
            e.style.setProperty('--delay', `${(Math.random() * 2.6).toFixed(2)}s`);
            e.style.setProperty('--c', Math.random() < 0.5 ? '#FF5A5F' : '#FF8A3D');
            frag.appendChild(e);
        }
        hellEmbers.appendChild(frag);
    }

    // A different "hell" scene — always funnels back to reboot(), never to the site
    async function enterHell(alive) {
        spawnEmbers();
        hellEl.classList.add('show');
        for (const line of HELL_LINES) {
            if (!alive()) return false;
            hellText.textContent = line;
            hellText.classList.remove('glitch');
            void hellText.offsetWidth;   // restart the glitch animation
            hellText.classList.add('glitch');
            await wait(780);
        }
        if (!alive()) return false;

        // A trial: a system-style notice, then a flame that won't be caught easily
        hellPanelMsg.textContent = 'A trial has been issued.';
        hellPanel.classList.add('show');
        await wait(320);
        if (!alive()) return false;
        hellHint.classList.add('show');

        await runFlameTrial();   // never resolves until OK is clicked on the ARISE dialog
        if (!alive()) return false;

        await playShadowRise();   // the summoning: rise, confirm, dissolve
        if (!alive()) return false;

        hellEl.classList.remove('show');
        await wait(550);
        hellEmbers.textContent = '';
        hellPanelMsg.textContent = '';
        return true;
    }

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const lerp = (a, b, k) => a + (b - a) * k;
    const clamp01 = (k) => Math.min(1, Math.max(0, k));
    const easeOut = (k) => 1 - Math.pow(1 - k, 3);
    const easeIn = (k) => k * k * k;

    let state = 'terminal';   // terminal → transition → warp → done
    let raf = 0;
    let impl, glCanvas, fx, fctx, dpr = 1;

    guarded.forEach((el) => { el.inert = true; });

    /* ----- load Three.js early so it is ready by the time the visitor answers ----- */
    const threeReady = new Promise((resolve) => {
        if (window.THREE) return resolve(true);
        const s = document.createElement('script');
        s.src = THREE_URL;
        s.async = true;
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.head.appendChild(s);
    });

    /* ----- Phase 1: terminal typewriter ----- */
    const cursor = document.createElement('span');
    cursor.className = 'pl-cursor';

    async function typeLine(text, alive, cls) {
        const line = document.createElement('div');
        if (cls) line.className = cls;
        line.classList.add('pl-line');
        const span = document.createElement('span');
        line.append(span, cursor);
        linesEl.appendChild(line);
        for (const ch of text) {
            if (!alive()) return false;
            span.textContent += ch;
            await wait(ch === ' ' ? 12 : 18);
        }
        return true;
    }

    async function typeLines() {
        const alive = () => state === 'terminal';
        for (const text of LINES) {
            if (!(await typeLine(text, alive))) return;
            await wait(260);
        }
        if (!alive()) return;
        actions.classList.add('show');
        yesBtn.focus({ preventScroll: true });
    }

    // Start the tunnel (used by both YES and the NO "fall")
    async function beginWarp() {
        await Promise.race([threeReady, wait(2500)]);   // never wait forever on the CDN
        if (state !== 'transition') return;
        term.style.display = 'none';
        try { startWarp(); } catch (e) { endWarp(); quickFlash(); }
    }

    async function onYes() {
        if (state !== 'terminal') return;
        state = 'transition';
        yesBtn.disabled = noBtn.disabled = true;
        term.classList.add('exit');
        await wait(600);
        beginWarp();
    }

    /* NO: never leads to the site. The terminal falls apart, then reboots and asks again — only YES proceeds. */
    function shatter() {
        linesEl.querySelectorAll('.pl-line > span:first-child').forEach((span) => {
            const text = span.textContent;
            span.textContent = '';
            text.split(' ').forEach((word, i, all) => {
                const w = document.createElement('span');
                w.className = 'pl-w';
                [...word].forEach((ch) => {
                    const s = document.createElement('span');
                    s.className = 'pl-ch';
                    s.textContent = ch;
                    s.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * 180)}px`);
                    s.style.setProperty('--r', `${Math.round((Math.random() - 0.5) * 720)}deg`);
                    s.style.setProperty('--d', `${(Math.random() * 0.35).toFixed(2)}s`);
                    s.style.setProperty('--t', `${(0.8 + Math.random() * 0.6).toFixed(2)}s`);
                    w.appendChild(s);
                });
                span.appendChild(w);
                if (i < all.length - 1) span.appendChild(document.createTextNode(' '));
            });
        });
        cursor.remove();
    }

    async function onNo() {
        if (state !== 'terminal') return;
        state = 'transition';
        yesBtn.disabled = noBtn.disabled = true;
        const alive = () => state === 'transition';
        live.textContent = 'Denied. Gravity does not accept no.';

        const denial = DENIALS[Math.min(noCount, DENIALS.length - 1)];
        noCount++;
        if (!(await typeLine(denial, alive, 'deny'))) return;
        await wait(350);
        if (!alive()) return;

        term.classList.add('shake');
        await wait(360);
        if (!alive()) return;

        term.classList.remove('shake');
        shatter();
        pl.classList.add('plunge');
        term.classList.add('falling');
        await wait(1450);
        if (!alive()) return;

        term.style.display = 'none';
        live.textContent = 'Falling into the void.';
        const survived = await enterHell(alive);
        if (!survived) return;
        await reboot();
    }

    // The terminal comes back and asks again — only YES gets past this point
    async function reboot() {
        linesEl.textContent = '';
        actions.classList.remove('show');
        term.classList.remove('shake', 'falling');
        term.style.display = '';
        term.classList.add('reboot');
        pl.classList.remove('plunge');
        hellEl.classList.remove('show');
        hellPanel.classList.remove('show');
        hellHint.classList.remove('show');
        flameBtn.classList.remove('show', 'dodge');
        ariseEl.classList.remove('show');
        shadowEl.classList.remove('show', 'dissolve');
        shadowSmoke.textContent = '';
        yesBtn.disabled = noBtn.disabled = false;
        state = 'terminal';
        live.textContent = 'Rebooted. Answer YES to continue.';
        setTimeout(() => term.classList.remove('reboot'), 650);

        const alive = () => state === 'terminal';
        for (const text of REBOOT) {
            if (!(await typeLine(text, alive))) return;
            await wait(260);
        }
        if (!alive()) return;
        actions.classList.add('show');
        yesBtn.focus({ preventScroll: true });
    }

    /* ----- Phase 2: wormhole tunnel (Three.js) ----- */
    const STREAK_VS = `
        attribute float aEnd; attribute float aSeed;
        uniform float uOff; uniform float uLen; uniform float uStretch;
        varying float vA; varying float vSeed;
        void main() {
            float z = mod(position.z + uOff, uLen) - uLen;
            float d = -z;
            z -= aEnd * uStretch * (0.5 + aSeed);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy, z, 1.0);
            float fade = 1.0 - clamp(d / uLen, 0.0, 1.0);
            fade *= fade;
            float near = smoothstep(0.0, 6.0, d);
            vA = (1.0 - aEnd * 0.85) * fade * near * (0.55 + aSeed * 1.1);
            vSeed = aSeed;
        }`;
    const STREAK_FS = `
        varying float vA; varying float vSeed;
        void main() {
            vec3 col = vec3(1.0);
            if (vSeed > 0.40) col = vec3(0.30, 0.64, 1.00);
            if (vSeed > 0.58) col = vec3(1.00, 0.77, 0.24);
            if (vSeed > 0.74) col = vec3(1.00, 0.54, 0.24);
            if (vSeed > 0.88) col = vec3(1.00, 0.35, 0.37);
            gl_FragColor = vec4(col, vA);
        }`;

    const WALL_VS = `
        varying float vZ; varying float vAngle;
        void main() {
            vZ = (modelMatrix * vec4(position, 1.0)).z;
            vAngle = atan(position.z, position.x);   // object-space angle, independent of the mesh rotation
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }`;
    const WALL_FS = `
        varying float vZ; varying float vAngle;
        uniform float uOff; uniform float uLen;
        void main() {
            float far = pow(1.0 - clamp(-vZ / uLen, 0.0, 1.0), 2.3);

            // scrolling ring struts — the sense of moving forward through the tube
            float ringGap = 6.0;
            float ringPos = mod(vZ - uOff, ringGap);
            float ring = pow(1.0 - abs(ringPos - ringGap * 0.5) / (ringGap * 0.5), 10.0);

            // fixed longitudinal spokes — the sense of a physical tunnel wall
            float spokes = 10.0;
            float spokeFrac = fract(vAngle / (6.28318530718 / spokes));
            float spoke = pow(1.0 - abs(spokeFrac - 0.5) * 2.0, 30.0);

            vec3 base = vec3(0.03, 0.07, 0.15);
            vec3 ringCol = vec3(0.30, 0.64, 1.00);
            vec3 spokeCol = vec3(1.00, 0.77, 0.24);
            vec3 col = base * far * 1.6 + ringCol * ring * far * 2.0 + spokeCol * spoke * far * 1.0;
            gl_FragColor = vec4(col, 1.0);
        }`;

    const DISK_VS = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
    const DISK_FS = `
        varying vec2 vUv; uniform float uTime;
        vec3 sev(float h) {
            vec3 blue = vec3(0.30, 0.64, 1.00), yellow = vec3(1.00, 0.77, 0.24);
            vec3 orange = vec3(1.00, 0.54, 0.24), red = vec3(1.00, 0.35, 0.37);
            h = fract(h) * 4.0;
            if (h < 1.0) return mix(blue, yellow, h);
            if (h < 2.0) return mix(yellow, orange, h - 1.0);
            if (h < 3.0) return mix(orange, red, h - 2.0);
            return mix(red, blue, h - 3.0);
        }
        void main() {
            vec2 p = vUv - 0.5;
            float r = length(p) * 2.0;
            float a = atan(p.y, p.x);
            float ring = exp(-pow((r - 0.62) * 9.0, 2.0));
            float inner = exp(-pow((r - 0.44) * 14.0, 2.0)) * 0.5;
            float glow = exp(-r * r * 3.0) * 0.35;
            float swirl = 0.78 + 0.22 * sin(a * 5.0 - uTime * 4.0 + r * 8.0);
            vec3 tint = sev(a / 6.2831853 + uTime * 0.15);
            vec3 col = tint * (ring * swirl * 1.7 + glow) + vec3(1.0) * inner * 0.6;
            float alpha = clamp(ring + inner + glow, 0.0, 1.0);
            gl_FragColor = vec4(col, alpha);
        }`;

    let t0, last, flashed;

    /* Renderer A: Three.js / WebGL */
    function makeThree(canvas, W, H) {
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(dpr);
        renderer.setSize(W, H, false);
        renderer.setClearColor(0x000000, 1);
        const disposables = [];

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, L + 50);

        // Warp-track starlight streaks on the tunnel wall
        const N = (W < 700 || (navigator.hardwareConcurrency || 8) <= 4) ? 2200 : 3800;
        const pos = new Float32Array(N * 6), end = new Float32Array(N * 2), seed = new Float32Array(N * 2);
        for (let i = 0; i < N; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = 3 + Math.pow(Math.random(), 0.7) * 2;
            const z = Math.random() * L, s = Math.random();
            for (let k = 0; k < 2; k++) {
                const idx = i * 2 + k;
                pos[idx * 3] = Math.cos(a) * r;
                pos[idx * 3 + 1] = Math.sin(a) * r;
                pos[idx * 3 + 2] = z;
                end[idx] = k;
                seed[idx] = s;
            }
        }
        const streakGeo = new THREE.BufferGeometry();
        streakGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        streakGeo.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
        streakGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
        const streakMat = new THREE.ShaderMaterial({
            uniforms: { uOff: { value: 0 }, uLen: { value: L }, uStretch: { value: 1 } },
            vertexShader: STREAK_VS, fragmentShader: STREAK_FS,
            transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false
        });
        const streaks = new THREE.LineSegments(streakGeo, streakMat);
        streaks.frustumCulled = false;
        streaks.renderOrder = 1;
        scene.add(streaks);

        // Round cylindrical tunnel wall with a scrolling ring + spoke grid.
        // heightSegments must be high: the camera sits at the tube's near opening, so a
        // single full-length quad gets clipped by the near plane and its depth interpolation
        // collapses (confirmed by isolated testing) — many short segments interpolate correctly.
        const wallGeo = new THREE.CylinderGeometry(5.4, 5.4, L, 48, 60, true);
        const wallMat = new THREE.ShaderMaterial({
            uniforms: { uOff: { value: 0 }, uLen: { value: L } },
            vertexShader: WALL_VS, fragmentShader: WALL_FS, side: THREE.BackSide
        });
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.rotation.x = Math.PI / 2;
        wall.position.z = -L / 2;
        wall.frustumCulled = false;
        scene.add(wall);

        // Singularity: black core + accretion disk at the horizon
        const coreGeo = new THREE.CircleGeometry(0.17, 48);
        const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000, depthTest: false });
        const core = new THREE.Mesh(coreGeo, coreMat);
        core.position.z = -(L - 15) + 0.1;
        core.renderOrder = 2;
        core.frustumCulled = false;
        scene.add(core);

        const diskGeo = new THREE.PlaneGeometry(1, 1);
        const diskMat = new THREE.ShaderMaterial({
            uniforms: { uTime: { value: 0 } },
            vertexShader: DISK_VS, fragmentShader: DISK_FS,
            transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false
        });
        const disk = new THREE.Mesh(diskGeo, diskMat);
        disk.position.z = -(L - 15);
        disk.renderOrder = 3;
        disk.frustumCulled = false;
        scene.add(disk);

        disposables.push(streakGeo, streakMat, wallGeo, wallMat, coreGeo, coreMat, diskGeo, diskMat);

        return {
            draw(p) {
                streakMat.uniforms.uOff.value = p.off;
                wallMat.uniforms.uOff.value = p.off;
                streakMat.uniforms.uStretch.value = p.stretch;
                diskMat.uniforms.uTime.value = p.time;
                if (camera.fov !== p.fov) { camera.fov = p.fov; camera.updateProjectionMatrix(); }
                camera.position.set((Math.random() - 0.5) * 0.14 * p.k, (Math.random() - 0.5) * 0.14 * p.k, 0);
                camera.rotation.z = p.roll;
                disk.scale.setScalar(p.size);
                core.scale.setScalar(p.size);
                renderer.render(scene, camera);
            },
            resize(w, h) {
                renderer.setSize(w, h, false);
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
            },
            dispose() {
                disposables.forEach((d) => d.dispose());
                renderer.dispose();
                try { renderer.forceContextLoss(); } catch (e) {}
            }
        };
    }

    /* Renderer B: plain Canvas 2D (no Three.js, no WebGL needed) — same look, same timeline */
    const sevRGB = (h) => {
        h = (((h % 1) + 1) % 1) * 4;
        const B = [77, 163, 255], Y = [255, 197, 61], O = [255, 138, 61], R = [255, 90, 95];
        let a, b, k;
        if (h < 1) { a = B; b = Y; k = h; } else if (h < 2) { a = Y; b = O; k = h - 1; }
        else if (h < 3) { a = O; b = R; k = h - 2; } else { a = R; b = B; k = h - 3; }
        return [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * k));
    };

    function make2D(canvas, W, H) {
        const g = canvas.getContext('2d');
        const size = (w, h) => { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); };
        size(W, H);

        const seedToCol = (s) => (s > 0.88 ? 4 : s > 0.74 ? 3 : s > 0.58 ? 2 : s > 0.40 ? 1 : 0);
        const N = W < 700 ? 900 : 1700;
        const streaks = Array.from({ length: N }, () => {
            const a = Math.random() * Math.PI * 2;
            const r = 3 + Math.pow(Math.random(), 0.7) * 2;
            const s = Math.random();
            return { x: Math.cos(a) * r, y: Math.sin(a) * r, z: Math.random() * L, s, c: seedToCol(s) };
        }).sort((p, q) => p.c - q.c);   // grouped by colour → fewer state changes
        const COL = PAL.map((c) => `rgb(${c.join(',')})`);
        const RING_GAP = (2 * Math.PI) / 0.35;

        return {
            draw(p) {
                const w = canvas.width, h = canvas.height;
                const f = (h / 2) / Math.tan((p.fov * Math.PI) / 360);
                g.setTransform(1, 0, 0, 1, 0, 0);
                g.globalCompositeOperation = 'source-over';
                g.globalAlpha = 1;
                g.fillStyle = '#000';
                g.fillRect(0, 0, w, h);

                // camera shake + roll during warp
                g.translate(w / 2 + (Math.random() - 0.5) * 10 * dpr * p.k, h / 2 + (Math.random() - 0.5) * 10 * dpr * p.k);
                g.rotate(p.roll);

                const glow = g.createRadialGradient(0, 0, 0, 0, 0, Math.max(w, h) * 0.6);
                glow.addColorStop(0, 'rgba(40,60,140,0.35)');
                glow.addColorStop(1, 'rgba(0,0,0,0)');
                g.fillStyle = glow;
                g.fillRect(-w, -h, w * 2, h * 2);

                g.globalCompositeOperation = 'lighter';

                // wall rings sliding toward the camera, plus fixed spokes connecting them —
                // together they read as a physical tunnel rather than a field of streaks
                const phase = p.off % RING_GAP;
                const SPOKES = 10;
                let prevR = null;
                for (let i = 1; i * RING_GAP < L; i++) {
                    const d = i * RING_GAP - phase;
                    if (d < 1) { prevR = null; continue; }
                    const a = Math.min(1, 0.65 * Math.pow(1 - d / L, 2.4));
                    const r = (5.4 * f) / d;

                    g.strokeStyle = COL[2];
                    g.lineWidth = 1.6 * dpr;
                    g.globalAlpha = a;
                    g.beginPath();
                    g.arc(0, 0, r, 0, Math.PI * 2);
                    g.stroke();

                    if (prevR !== null) {
                        g.strokeStyle = COL[1];
                        g.lineWidth = 1.1 * dpr;
                        g.globalAlpha = a * 0.55;
                        for (let s = 0; s < SPOKES; s++) {
                            const ang = (s / SPOKES) * Math.PI * 2;
                            g.beginPath();
                            g.moveTo(Math.cos(ang) * prevR, Math.sin(ang) * prevR);
                            g.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
                            g.stroke();
                        }
                    }
                    prevR = r;
                }

                // starlight streaks
                g.lineWidth = 1.4 * dpr;
                let lastC = -1;
                for (const q of streaks) {
                    const d = L - ((q.z + p.off) % L);
                    if (d < 0.6) continue;
                    const fade = Math.pow(1 - d / L, 2);
                    const nr = Math.min(1, d / 6);
                    const a = fade * nr * nr * (3 - 2 * nr) * (0.55 + q.s * 1.1);
                    if (a < 0.02) continue;
                    if (q.c !== lastC) { g.strokeStyle = COL[q.c]; lastC = q.c; }
                    g.globalAlpha = Math.min(1, a) * 0.85;
                    const tail = d + p.stretch * (0.5 + q.s);
                    g.beginPath();
                    g.moveTo((q.x * f) / tail, (-q.y * f) / tail);
                    g.lineTo((q.x * f) / d, (-q.y * f) / d);
                    g.stroke();
                }

                // singularity: black core + rotating severity-colour accretion ring
                const R = (p.size / 2) * f / (L - 15);
                g.globalCompositeOperation = 'source-over';
                g.globalAlpha = 1;
                g.fillStyle = '#000';
                g.beginPath();
                g.arc(0, 0, R * 0.34, 0, Math.PI * 2);
                g.fill();

                g.globalCompositeOperation = 'lighter';
                const halo = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.95);
                halo.addColorStop(0, 'rgba(255,197,61,0.22)');
                halo.addColorStop(1, 'rgba(255,197,61,0)');
                g.globalAlpha = 1;
                g.fillStyle = halo;
                g.fillRect(-R, -R, R * 2, R * 2);

                const SEG = 72;
                for (let i = 0; i < SEG; i++) {
                    const a0 = (i / SEG) * Math.PI * 2, a1 = ((i + 1.15) / SEG) * Math.PI * 2, am = (a0 + a1) / 2;
                    const swirl = 0.78 + 0.22 * Math.sin(am * 5 - p.time * 4 + 5);
                    g.strokeStyle = `rgb(${sevRGB(am / (Math.PI * 2) + p.time * 0.15).join(',')})`;
                    g.globalAlpha = 0.28 * swirl;
                    g.lineWidth = R * 0.2;
                    g.beginPath(); g.arc(0, 0, R * 0.62, a0, a1); g.stroke();
                    g.globalAlpha = 0.9 * swirl;
                    g.lineWidth = Math.max(2 * dpr, R * 0.06);
                    g.beginPath(); g.arc(0, 0, R * 0.62, a0, a1); g.stroke();
                }
                g.globalAlpha = 0.35;
                g.strokeStyle = '#fff';
                g.lineWidth = Math.max(1.5 * dpr, R * 0.03);
                g.beginPath(); g.arc(0, 0, R * 0.44, 0, Math.PI * 2); g.stroke();

                g.setTransform(1, 0, 0, 1, 0, 0);
                g.globalAlpha = 1;
                g.globalCompositeOperation = 'source-over';
            },
            resize(w, h) { size(w, h); },
            dispose() {}
        };
    }

    /* Shared timeline: creep → time-skip snap → event-horizon whiteout */
    function startWarp() {
        state = 'warp';
        const W = window.innerWidth, H = window.innerHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);

        glCanvas = document.createElement('canvas');
        glCanvas.className = 'pl-gl';
        fx = document.createElement('canvas');
        fx.className = 'pl-fx';
        pl.insertBefore(glCanvas, pl.firstChild);
        pl.insertBefore(fx, glCanvas.nextSibling);

        impl = null;
        if (window.THREE) {
            try { impl = makeThree(glCanvas, W, H); } catch (e) { impl = null; }
        }
        if (!impl) {                                   // no Three.js / no WebGL → Canvas 2D
            const fresh = document.createElement('canvas');
            fresh.className = 'pl-gl';
            glCanvas.replaceWith(fresh);
            glCanvas = fresh;
            impl = make2D(glCanvas, W, H);
        }
        fx.width = glCanvas.width;
        fx.height = glCanvas.height;
        fctx = fx.getContext('2d');

        window.addEventListener('resize', onResize);
        t0 = performance.now();
        last = t0;
        flashed = false;
        let off = 0;
        const rain = { cols: 0, heads: [] };

        const frame = (now) => {
            raf = requestAnimationFrame(frame);
            const t = (now - t0) / 1000;
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;

            // Velocity curve: slow creep → instant time-skip snap
            let v, fov, k = 0;
            if (t < SNAP_AT) {
                v = 5 + t * 2.5;
                fov = 60;
            } else {
                k = 1;
                v = lerp(10, 320, easeOut(clamp01((t - SNAP_AT) / 0.12)));
                fov = lerp(60, 112, easeOut(clamp01((t - SNAP_AT) / 0.3)));
            }
            off += v * dt;
            const grow = easeIn(clamp01((t - FLASH_AT) / 0.4));

            try {
                impl.draw({
                    t, time: t, off, v, fov, k,
                    roll: Math.sin(t * 3) * 0.025 * k,
                    stretch: 1.2 + Math.max(0, v - 10) * 0.055,
                    size: lerp(62, 900, grow)
                });
                if (t >= SNAP_AT) drawGlitch(clamp01((t - SNAP_AT) / 0.25), rain);
            } catch (e) {
                endWarp();
                quickFlash();
                return;
            }

            // Phase 3: whiteout at exactly 3.5s
            if (t >= FLASH_AT && !flashed) {
                flashed = true;
                flash.style.transition = `opacity ${FLASH_MS}ms ease-in`;
                flash.style.opacity = '1';
            }
            if (t >= FLASH_AT + FLASH_MS / 1000 + 0.04) {
                endWarp();           // cancelAnimationFrame + free resources
                reveal('flash');
            }
        };
        raf = requestAnimationFrame(frame);
    }

    /* Time-skip glitch: displaced slices of the frame, scan lines, matrix noise */
    const GLYPHS = '01<>/\\{}$#=+*';
    function drawGlitch(intensity, rain) {
        const W = fx.width, H = fx.height;
        fctx.clearRect(0, 0, W, H);

        const slices = Math.round(2 + intensity * 7);
        for (let i = 0; i < slices; i++) {
            const h = Math.max(2, Math.round(H * (0.005 + Math.random() * 0.06)));
            const y = Math.floor(Math.random() * (H - h));
            const dx = Math.round((Math.random() - 0.5) * W * 0.16 * intensity);
            fctx.drawImage(glCanvas, 0, y, W, h, dx, y, W, h);
        }

        const bars = Math.round(2 + 8 * intensity);
        for (let i = 0; i < bars; i++) {
            fctx.fillStyle = `rgba(${PAL[Math.floor(Math.random() * PAL.length)].join(',')},0.6)`;
            fctx.fillRect(0, Math.random() * H, W, (1 + Math.random() * 2) * dpr);
        }

        const cw = 16 * dpr;
        if (!rain.cols) {
            rain.cols = Math.ceil(W / cw);
            rain.heads = Array.from({ length: rain.cols }, () => Math.random() * H);
            rain.colors = Array.from({ length: rain.cols }, () => PAL[1 + Math.floor(Math.random() * 4)].join(','));
        }
        fctx.font = `${14 * dpr}px "IBM Plex Mono", monospace`;
        for (let c = 0; c < rain.cols; c++) {
            if (Math.random() > 0.05 + 0.3 * intensity) continue;
            rain.heads[c] = (rain.heads[c] + (20 + Math.random() * 40) * dpr) % H;
            for (let j = 0; j < 6; j++) {
                fctx.fillStyle = `rgba(${rain.colors[c]},${Math.max(0, 0.6 - j * 0.1) * intensity})`;
                fctx.fillText(GLYPHS[Math.floor(Math.random() * GLYPHS.length)], c * cw, rain.heads[c] - j * cw);
            }
        }
    }

    function onResize() {
        if (!impl) return;
        impl.resize(window.innerWidth, window.innerHeight);
        fx.width = glCanvas.width;
        fx.height = glCanvas.height;
    }

    /* Stop the render loop and free everything */
    function endWarp() {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        if (impl) { try { impl.dispose(); } catch (e) {} impl = null; }
        if (glCanvas) glCanvas.remove();
        if (fx) fx.remove();
        glCanvas = fx = null;
        window.removeEventListener('resize', onResize);
        term.style.display = 'none';
    }

    /* ----- Phase 4: hand over to the site ----- */
    function reveal(mode) {
        if (state === 'done') return;
        state = 'done';
        root.classList.remove('preloading');
        root.classList.add('intro-done');
        guarded.forEach((el) => { el.inert = false; });
        pl.style.pointerEvents = 'none';
        document.removeEventListener('keydown', onKey);

        if (mode === 'flash') {
            pl.style.background = 'transparent';     // only the white flash remains, then it dissipates
            flash.style.transition = 'opacity 1.4s ease';
            void flash.offsetWidth;
            flash.style.opacity = '0';
            setTimeout(() => pl.remove(), 1600);
        } else {
            pl.style.transition = 'opacity 0.5s ease';
            pl.style.opacity = '0';
            setTimeout(() => pl.remove(), 600);
        }
        resolveIntro();
    }

    async function quickFlash() {
        flash.style.transition = `opacity ${FLASH_MS}ms ease-in`;
        flash.style.opacity = '1';
        await wait(FLASH_MS + 40);
        term.style.display = 'none';
        reveal('flash');
    }

    function onKey(e) {
        if (state !== 'terminal') return;
        if (e.key === 'y' || e.key === 'Y') onYes();
        if (e.key === 'n' || e.key === 'N') onNo();
    }

    yesBtn.addEventListener('click', onYes);
    noBtn.addEventListener('click', onNo);
    document.addEventListener('keydown', onKey);

    typeLines();
})();

/* ---------- Theme (light / dark) ---------- */
(() => {
    const root = document.documentElement;
    const btn = document.querySelector('.theme-toggle');
    const meta = document.querySelector('meta[name="theme-color"]');

    function applyTheme(theme, save) {
        root.setAttribute('data-theme', theme);
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0B0F14' : '#F4F6F8');
        if (save) {
            try { localStorage.setItem('theme', theme); } catch (e) {}
        }
    }

    applyTheme(root.getAttribute('data-theme') || 'dark', false);

    btn.addEventListener('click', () => {
        applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });

    // Follow the OS setting until the visitor picks a theme themselves
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
        try { if (localStorage.getItem('theme')) return; } catch (err) {}
        applyTheme(e.matches ? 'light' : 'dark', false);
    });
})();

/* ---------- Mobile menu ---------- */
(() => {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');
    const mq = window.matchMedia('(max-width: 860px)');

    const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

    function setMenu(open) {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.classList.toggle('open', open);
    }

    toggle.addEventListener('click', () => setMenu(!isOpen()));
    menu.querySelectorAll('.nav-link').forEach((link) => link.addEventListener('click', () => setMenu(false)));

    document.addEventListener('click', (e) => {
        if (isOpen() && !e.target.closest('.nav')) setMenu(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) {
            setMenu(false);
            toggle.focus();
        }
    });

    mq.addEventListener('change', (e) => { if (!e.matches) setMenu(false); });
})();

/* ---------- Highlight the current section in the nav ---------- */
(() => {
    const links = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach((s) => spy.observe(s));
})();

/* ---------- Encrypt / decrypt text animation (loops on its own) ---------- */
(() => {
    const HEX = '0123456789abcdef';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bar = document.querySelector('.term');
    const stateLabel = document.getElementById('cipher-state');
    const hero = document.getElementById('hero');
    const isCipherable = (c) => /[A-Za-z0-9]/.test(c);
    const randHex = () => HEX[Math.floor(Math.random() * HEX.length)];
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));

    const STAY_READABLE = 7000;   // how long the plain text stays before it re-encrypts
    const STAY_ENCRYPTED = 1200;  // how long the ciphertext holds before decrypting
    const ENCRYPT_MS = 900;
    const DECRYPT_MS = 1600;

    // Split each target into word > character spans (screen readers use aria-label)
    const targets = [...document.querySelectorAll('[data-cipher]')].map((el) => {
        const text = el.textContent.trim().replace(/\s+/g, ' ');
        el.textContent = '';
        const sr = document.createElement('span');   // real text for screen readers
        sr.className = 'sr-only';
        sr.textContent = text;
        el.appendChild(sr);

        const wrap = document.createElement('span');
        wrap.setAttribute('aria-hidden', 'true');
        const words = [];
        const chars = [];

        text.split(' ').forEach((word, i, all) => {
            const w = document.createElement('span');
            w.className = 'cw';
            [...word].forEach((c) => {
                const s = document.createElement('span');
                s.className = 'cc';
                s.textContent = c;
                s.dataset.c = c;
                w.appendChild(s);
                chars.push(s);
            });
            wrap.appendChild(w);
            words.push(w);
            if (i < all.length - 1) wrap.appendChild(document.createTextNode(' '));
        });

        el.appendChild(wrap);
        return { el, words, chars };
    });

    if (!targets.length) return;

    // Lock each word to its plain-text width (in em) so the layout never jumps
    function lockWidths() {
        targets.forEach((t) => {
            const fs = parseFloat(getComputedStyle(t.el).fontSize);
            t.words.forEach((w) => { w.style.width = `${w.getBoundingClientRect().width / fs}em`; });
        });
    }

    function setStatic(toEncrypted) {
        targets.forEach((t) => t.chars.forEach((s) => {
            if (!isCipherable(s.dataset.c)) return;
            s.textContent = toEncrypted ? randHex() : s.dataset.c;
            s.classList.toggle('cx', toEncrypted);
        }));
    }

    function setState(name) {
        bar.dataset.state = name;
        stateLabel.textContent = name;
    }

    function run(toEncrypted, duration) {
        setState(toEncrypted ? 'encrypting' : 'decrypting');

        // Each character flips at its own moment, left to right with some jitter
        const plans = targets.map((t) => t.chars.map((_, i) => (i / t.chars.length) * 0.7 + Math.random() * 0.3));
        const start = performance.now();
        let lastTick = 0;

        return new Promise((resolve) => {
            function frame(now) {
                const p = Math.min(1, (now - start) / duration);
                const tick = now - lastTick > 45;
                if (tick) lastTick = now;

                targets.forEach((t, ti) => {
                    t.chars.forEach((s, i) => {
                        if (!isCipherable(s.dataset.c)) return;
                        const cipher = toEncrypted ? p >= plans[ti][i] : p < plans[ti][i];
                        if (cipher && tick) s.textContent = randHex();
                        if (!cipher) s.textContent = s.dataset.c;
                        s.classList.toggle('cx', cipher);
                    });
                });

                if (p < 1) return requestAnimationFrame(frame);

                setStatic(toEncrypted);
                setState(toEncrypted ? 'encrypted' : 'decrypted');
                resolve();
            }
            requestAnimationFrame(frame);
        });
    }

    // Only animate while the hero is on screen and the tab is visible
    let heroVisible = true;
    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe(hero);
    const canAnimate = () => heroVisible && !document.hidden;

    async function loop() {
        for (;;) {
            await wait(STAY_READABLE);
            if (!canAnimate()) continue;
            await run(true, ENCRYPT_MS);
            await wait(STAY_ENCRYPTED);
            await run(false, DECRYPT_MS);
        }
    }

    const fontsReady = Promise.race([
        document.fonts ? document.fonts.ready : Promise.resolve(),
        new Promise((r) => setTimeout(r, 1200))
    ]);

    Promise.all([fontsReady, window.introDone || Promise.resolve()]).then(async () => {
        lockWidths();
        targets.forEach((t) => t.el.classList.add('ready'));

        if (reduceMotion) {           // no motion: show plain text and stop
            setState('decrypted');
            return;
        }

        setStatic(true);              // open on ciphertext, decrypt once, then keep looping
        setState('encrypted');
        await wait(450);
        await run(false, DECRYPT_MS);
        loop();
    });
})();

/* ---------- Draggable credential stickers (desktop only) ---------- */
(() => {
    const board = document.querySelector('.sticker-board');
    if (!board) return;
    const desktop = window.matchMedia('(min-width: 861px)');
    let topZ = 10;

    board.querySelectorAll('.sticker').forEach((el) => {
        let startX, startY, originX, originY, dragging = false, moved = false;

        el.addEventListener('dragstart', (e) => e.preventDefault());

        el.addEventListener('pointerdown', (e) => {
            if (!desktop.matches || e.button > 0) return;
            dragging = true;
            moved = false;
            startX = e.clientX;
            startY = e.clientY;
            originX = el.offsetLeft;
            originY = el.offsetTop;
            el.style.left = `${originX}px`;
            el.style.top = `${originY}px`;
            el.style.zIndex = ++topZ;
            el.classList.add('dragging');
            el.setPointerCapture(e.pointerId);
        });

        el.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
            const maxX = board.clientWidth - el.offsetWidth;
            const maxY = board.clientHeight - el.offsetHeight;
            el.style.left = `${Math.min(Math.max(originX + dx, 0), Math.max(maxX, 0))}px`;
            el.style.top = `${Math.min(Math.max(originY + dy, 0), Math.max(maxY, 0))}px`;
        });

        const end = () => {
            dragging = false;
            el.classList.remove('dragging');
        };
        el.addEventListener('pointerup', end);
        el.addEventListener('pointercancel', end);

        // A drag on the Hack The Box link should not open it
        el.addEventListener('click', (e) => {
            if (moved) { e.preventDefault(); moved = false; }
        });
    });
})();

/* ---------- Starry background ---------- */
(() => {
    const canvas = document.createElement('canvas');
    canvas.id = 'starfield';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const TINTS = [[77, 163, 255], [255, 197, 61], [255, 138, 61], [255, 90, 95]];   // site palette
    let W = 0, H = 0, dpr = 1, stars = [], raf = 0, running = false, last = 0;
    let theme = document.documentElement.getAttribute('data-theme') || 'dark';

    function seed() {
        const n = Math.round(Math.min(320, Math.max(120, (W * H) / 6500)));
        stars = Array.from({ length: n }, () => {
            const depth = 0.2 + Math.random() * 0.8;
            return {
                x: Math.random(),
                y: Math.random(),
                d: depth,                                   // parallax depth
                r: 0.7 + Math.pow(Math.random(), 3) * 1.7,  // mostly tiny, a few larger
                a: 0.45 + Math.random() * 0.5,
                sp: 0.4 + Math.random() * 1.4,              // twinkle speed
                ph: Math.random() * Math.PI * 2,
                c: Math.random() < 0.14 ? TINTS[Math.floor(Math.random() * TINTS.length)] : null
            };
        });
    }

    function draw(now) {
        const t = now / 1000;
        const sy = reduce ? 0 : window.scrollY;
        const dark = theme === 'dark';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);
        for (const s of stars) {
            const y = (((s.y * H - sy * s.d * 0.12) % H) + H) % H;   // deeper stars drift slower on scroll
            const twinkle = reduce ? 1 : 0.65 + 0.35 * Math.sin(t * s.sp + s.ph);
            const a = s.a * twinkle * (dark ? 1 : 0.6);
            const c = s.c || (dark ? [230, 236, 244] : [16, 24, 32]);
            ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
            ctx.beginPath();
            ctx.arc(s.x * W, y, s.r * (0.75 + 0.35 * s.d), 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        if (!stars.length) seed();
        draw(performance.now());
    }

    function loop(now) {
        raf = requestAnimationFrame(loop);
        if (now - last < 33) return;      // ~30fps is plenty for a background
        last = now;
        draw(now);
    }
    function start() { if (!reduce && !running) { running = true; raf = requestAnimationFrame(loop); } }
    function stop() { cancelAnimationFrame(raf); running = false; }

    let resizeQueued = false;
    window.addEventListener('resize', () => {
        if (resizeQueued) return;
        resizeQueued = true;
        requestAnimationFrame(() => { resizeQueued = false; resize(); });
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });

    // Follow the light/dark toggle
    new MutationObserver(() => {
        theme = document.documentElement.getAttribute('data-theme') || 'dark';
        if (!running) draw(performance.now());
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    resize();
    (window.introDone || Promise.resolve()).then(start);   // don't compete with the intro animation
})();

/* ---------- Real fire simulation for the "Grasp the Flame" button ---------- */
/* Classic rising-fire pixel algorithm: a small buffer is seeded hot at the base,
   each frame every pixel takes a slightly cooled value from the pixel below it,
   and the result is mapped through an ember-to-white palette. Runs only while
   the button is visible during the hell trial (see script.js above). */
(() => {
    const btn = document.getElementById('pl-flame-btn');
    const canvas = document.getElementById('pl-flame-canvas');
    if (!btn || !canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    if (!ctx) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const FW = 56, FH = 30;   // small internal buffer; CSS scales it up to the button's size
    canvas.width = FW;
    canvas.height = FH;

    // Palette: transparent embers -> deep red -> orange -> yellow -> white-hot core
    const STOPS = [
        [0.00, 10, 4, 2, 0],
        [0.14, 46, 10, 3, 70],
        [0.34, 150, 22, 5, 255],
        [0.55, 220, 72, 10, 255],
        [0.75, 250, 152, 22, 255],
        [0.90, 255, 222, 82, 255],
        [1.00, 255, 250, 225, 255]
    ];
    const N = 48;
    const palette = [];
    for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        let a = STOPS[0], b = STOPS[STOPS.length - 1];
        for (let s = 0; s < STOPS.length - 1; s++) {
            if (t >= STOPS[s][0] && t <= STOPS[s + 1][0]) { a = STOPS[s]; b = STOPS[s + 1]; break; }
        }
        const k = (t - a[0]) / ((b[0] - a[0]) || 1);
        palette.push([
            Math.round(a[1] + (b[1] - a[1]) * k),
            Math.round(a[2] + (b[2] - a[2]) * k),
            Math.round(a[3] + (b[3] - a[3]) * k),
            Math.round(a[4] + (b[4] - a[4]) * k)
        ]);
    }

    const fire = new Uint8Array(FW * FH);
    const img = ctx.createImageData(FW, FH);
    let raf = 0, running = false, last = 0;

    function seedBase() {
        for (let x = 0; x < FW; x++) {
            fire[(FH - 1) * FW + x] = N - 1;
            fire[(FH - 2) * FW + x] = N - 1;
        }
    }

    function step() {
        for (let y = 0; y < FH - 1; y++) {
            for (let x = 0; x < FW; x++) {
                const below = fire[(y + 1) * FW + x];
                const decay = (Math.random() * 3.2) | 0;
                const val = below - decay;
                let dx = x + (decay === 2 ? (Math.random() < 0.5 ? -1 : 1) : 0);
                if (dx < 0) dx = 0; else if (dx >= FW) dx = FW - 1;
                fire[y * FW + dx] = val < 0 ? 0 : val;
            }
        }
        for (let x = 0; x < FW; x++) {
            if (Math.random() < 0.88) fire[(FH - 1) * FW + x] = N - 1;
        }
    }

    function paint() {
        const data = img.data;
        for (let i = 0; i < fire.length; i++) {
            const c = palette[fire[i]];
            const o = i * 4;
            data[o] = c[0]; data[o + 1] = c[1]; data[o + 2] = c[2]; data[o + 3] = c[3];
        }
        ctx.putImageData(img, 0, 0);
    }

    function frame(now) {
        raf = requestAnimationFrame(frame);
        if (now - last < 40) return;   // ~25fps — plenty for a small decorative flame
        last = now;
        step();
        paint();
    }

    function start() {
        if (running) return;
        running = true;
        seedBase();
        last = 0;
        raf = requestAnimationFrame(frame);
    }
    function stop() {
        running = false;
        cancelAnimationFrame(raf);
        raf = 0;
    }

    // The trial logic already toggles .show on this button — just follow it
    new MutationObserver(() => {
        if (btn.classList.contains('show')) start(); else stop();
    }).observe(btn, { attributes: true, attributeFilter: ['class'] });
    if (btn.classList.contains('show')) start();
})();
