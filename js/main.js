// ============================================
// NAVBAR — SCROLL EFFECT
// ============================================
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
}

// ============================================
// MOBILE MENU TOGGLE
// ============================================
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const toggle   = document.querySelector('.menu-toggle');
    if (!navLinks || !toggle) return;
    navLinks.classList.toggle('active');
    toggle.classList.toggle('open');
}
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('navLinks')?.classList.remove('active');
        document.querySelector('.menu-toggle')?.classList.remove('open');
    });
});

// ============================================
// 3D WELLNESS GLOBE
// ============================================
(function () {
    const container = document.getElementById('globe-container');
    if (!container || typeof THREE === 'undefined') return;

    // ── Wait for container to have real dimensions ──
    function init() {
        const W = container.offsetWidth  || 580;
        const H = container.offsetHeight || 580;
        if (W < 10) { requestAnimationFrame(init); return; }

        // ── Tooltip ──
        const tooltip = document.createElement('div');
        tooltip.style.cssText = [
            'position:fixed','z-index:9999','pointer-events:none',
            'padding:8px 18px',
            'background:rgba(0,30,14,0.93)',
            'border:1.5px solid rgba(196,218,132,0.55)',
            'border-radius:999px',
            'font-family:DM Sans,sans-serif','font-size:13px','font-weight:600',
            'color:#C4DA84','letter-spacing:0.02em',
            'backdrop-filter:blur(14px)','-webkit-backdrop-filter:blur(14px)',
            'opacity:0','transition:opacity 0.18s ease',
            'white-space:nowrap',
            'box-shadow:0 6px 24px rgba(0,71,35,0.3)'
        ].join(';');
        document.body.appendChild(tooltip);

        // ── Scene ──
        const scene  = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);
        camera.position.z = 6.0;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);

        // ── Groups ──
        const GLOBE = new THREE.Group();  // rotates on drag / auto
        scene.add(GLOBE);

        // ── COLORS ──
        const C = {
            forest:  0x003D1F,
            forestM: 0x004723,
            sage:    0xC4DA84,
            sageD:   0x8BAD4A,
            white:   0xFFFFFF,
        };

        // ── SPHERE LAYERS ──
        // 1. Core solid sphere — rich dark green
        const coreMat = new THREE.MeshPhongMaterial({
            color:            C.forestM,
            emissive:         C.forest,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.82,
            shininess: 20,
        });
        GLOBE.add(new THREE.Mesh(new THREE.SphereGeometry(1.96, 64, 64), coreMat));

        // 2. Frosted glass outer shell
        const shellMat = new THREE.MeshPhongMaterial({
            color: C.sage,
            emissive: C.sage,
            emissiveIntensity: 0.04,
            transparent: true,
            opacity: 0.06,
            side: THREE.FrontSide,
            shininess: 80,
        });
        GLOBE.add(new THREE.Mesh(new THREE.SphereGeometry(2.01, 64, 64), shellMat));

        // 3. Fine icosahedron wireframe
        GLOBE.add(new THREE.Mesh(
            new THREE.IcosahedronGeometry(2.02, 6),
            new THREE.MeshBasicMaterial({ color: C.sage, wireframe: true, transparent: true, opacity: 0.08 })
        ));

        // ── LATITUDE & LONGITUDE LINES ──
        const lineMat = new THREE.LineBasicMaterial({ color: C.sage, transparent: true, opacity: 0.22 });

        function latLine(deg, R = 2.03) {
            const lat = deg * Math.PI / 180;
            const ry  = R * Math.sin(lat), rr = R * Math.cos(lat);
            const pts = [];
            for (let i = 0; i <= 128; i++) {
                const a = i / 128 * Math.PI * 2;
                pts.push(new THREE.Vector3(rr * Math.cos(a), ry, rr * Math.sin(a)));
            }
            return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
        }
        function lonLine(deg, R = 2.03) {
            const lon = deg * Math.PI / 180;
            const pts = [];
            for (let i = 0; i <= 128; i++) {
                const lat = i / 128 * Math.PI - Math.PI / 2;
                pts.push(new THREE.Vector3(
                    R * Math.cos(lat) * Math.cos(lon),
                    R * Math.sin(lat),
                    R * Math.cos(lat) * Math.sin(lon)
                ));
            }
            return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
        }

        [-60, -30, 0, 30, 60].forEach(d => GLOBE.add(latLine(d)));
        for (let l = 0; l < 180; l += 30) GLOBE.add(lonLine(l));

        // Equator highlight
        {
            const eq = latLine(0);
            eq.material = new THREE.LineBasicMaterial({ color: C.sage, transparent: true, opacity: 0.50 });
            GLOBE.add(eq);
        }

        // ── HALO OUTER RING ──
        const haloMesh = new THREE.Mesh(
            new THREE.IcosahedronGeometry(2.5, 2),
            new THREE.MeshBasicMaterial({ color: C.sage, wireframe: true, transparent: true, opacity: 0.045 })
        );
        scene.add(haloMesh); // NOT in GLOBE — counter-rotates

        // ── PARTICLES ──
        const N = 800;
        const pp = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
            const th = Math.random() * Math.PI * 2;
            const ph = Math.acos(2 * Math.random() - 1);
            const r  = 2.4 + Math.random() * 2.0;
            pp[i*3]   = r * Math.sin(ph) * Math.cos(th);
            pp[i*3+1] = r * Math.sin(ph) * Math.sin(th);
            pp[i*3+2] = r * Math.cos(ph);
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
        const particleCloud = new THREE.Points(pGeo,
            new THREE.PointsMaterial({ color: C.sage, size: 0.018, transparent: true, opacity: 0.38 })
        );
        scene.add(particleCloud);

        // ── CATEGORY NODES ──
        // Build beautiful 128×128 icon textures
        function buildIcon(drawFn, accent) {
            const S = 128, cx = 64, cy = 64, R = 60;
            const cvs = document.createElement('canvas');
            cvs.width = cvs.height = S;
            const c = cvs.getContext('2d');

            // Drop shadow
            c.shadowColor = 'rgba(0,0,0,0.5)';
            c.shadowBlur  = 14;

            // Background — radial gradient (rich dark center)
            const bg = c.createRadialGradient(cx - 10, cy - 14, 4, cx, cy, R);
            bg.addColorStop(0, '#005C30');
            bg.addColorStop(0.6, '#003D1F');
            bg.addColorStop(1,   '#001A0C');
            c.fillStyle = bg;
            c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();

            c.shadowBlur = 0;

            // Gloss highlight
            const gl = c.createRadialGradient(cx - 18, cy - 22, 2, cx - 8, cy - 12, R * 0.75);
            gl.addColorStop(0,   'rgba(255,255,255,0.22)');
            gl.addColorStop(0.5, 'rgba(255,255,255,0.05)');
            gl.addColorStop(1,   'rgba(255,255,255,0)');
            c.fillStyle = gl;
            c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();

            // Outer sage ring
            c.strokeStyle = accent || 'rgba(196,218,132,0.95)';
            c.lineWidth = 3.5;
            c.beginPath(); c.arc(cx, cy, R - 2, 0, Math.PI * 2); c.stroke();

            // Inner faint ring
            c.strokeStyle = 'rgba(196,218,132,0.18)';
            c.lineWidth = 1.5;
            c.beginPath(); c.arc(cx, cy, R - 12, 0, Math.PI * 2); c.stroke();

            // Draw icon
            c.strokeStyle = '#FFFFFF';
            c.fillStyle   = '#FFFFFF';
            c.lineWidth   = 3.5;
            c.lineCap     = 'round';
            c.lineJoin    = 'round';
            drawFn(c, cx, cy);

            const t = new THREE.CanvasTexture(cvs);
            t.minFilter = THREE.LinearFilter;
            t.magFilter = THREE.LinearFilter;
            return t;
        }

        const NODES = [
            {
                tip: '🌿 Organic Products',
                pos: [1.25, 0.90, 1.10],
                phase: 0.0,
                tex: buildIcon((c, cx, cy) => {
                    // Full leaf with veins
                    c.beginPath();
                    c.moveTo(cx, cy - 24);
                    c.bezierCurveTo(cx+24, cy-20, cx+24, cy+14, cx, cy+26);
                    c.bezierCurveTo(cx-24, cy+14, cx-24, cy-20, cx, cy-24);
                    c.stroke();
                    c.beginPath(); c.moveTo(cx, cy-24); c.lineTo(cx, cy+26); c.stroke();
                    [[cx,cy-4, cx-18,cy-16],[cx,cy+4, cx-16,cy-2],
                     [cx,cy-4, cx+18,cy-16],[cx,cy+4, cx+16,cy-2]].forEach(([x1,y1,x2,y2])=>{
                        c.beginPath(); c.moveTo(x1,y1); c.quadraticCurveTo((x1+x2)/2,(y1+y2)/2-5,x2,y2); c.stroke();
                    });
                })
            },
            {
                tip: '🥑 Keto-Friendly',
                pos: [-1.30, 0.65, 1.20],
                phase: 0.7,
                tex: buildIcon((c, cx, cy) => {
                    // Avocado pear
                    c.beginPath();
                    c.moveTo(cx, cy-26);
                    c.bezierCurveTo(cx+20,cy-22, cx+22,cy+6, cx+14,cy+20);
                    c.bezierCurveTo(cx+6, cy+28, cx-6, cy+28, cx-14,cy+20);
                    c.bezierCurveTo(cx-22,cy+6,  cx-20,cy-22, cx,   cy-26);
                    c.stroke();
                    // flesh ring
                    c.strokeStyle='rgba(196,218,132,0.7)'; c.lineWidth=2.5;
                    c.beginPath(); c.ellipse(cx,cy+5,11,14,0,0,Math.PI*2); c.stroke();
                    c.strokeStyle='#FFFFFF'; c.lineWidth=3.5;
                    // pit
                    c.beginPath(); c.arc(cx,cy+8,6.5,0,Math.PI*2); c.fill();
                    // stem
                    c.beginPath(); c.moveTo(cx,cy-26); c.lineTo(cx,cy-33); c.stroke();
                })
            },
            {
                tip: '🌾 Gluten-Free',
                pos: [0.40, 1.50, -0.55],
                phase: 1.4,
                tex: buildIcon((c, cx, cy) => {
                    // Wheat stalk
                    c.beginPath(); c.moveTo(cx,cy+28); c.lineTo(cx,cy-16); c.stroke();
                    [[-12,cy-4,-0.45],[12,cy-10,0.45],[-12,cy-16,-0.45]].forEach(([dx,y,r])=>{
                        c.save(); c.translate(cx+dx,y); c.rotate(r);
                        c.beginPath(); c.ellipse(0,0,9,5,0,0,Math.PI*2); c.stroke(); c.restore();
                    });
                    // GF strikethrough badge
                    c.strokeStyle='#C4DA84'; c.lineWidth=3;
                    c.beginPath(); c.moveTo(cx+10,cy+14); c.lineTo(cx+24,cy+28); c.stroke();
                    c.beginPath(); c.moveTo(cx+24,cy+14); c.lineTo(cx+10,cy+28); c.stroke();
                    c.strokeStyle='#FFFFFF'; c.lineWidth=3.5;
                })
            },
            {
                tip: '🥗 Low-Carb Options',
                pos: [-0.90, -0.95, 1.25],
                phase: 2.1,
                tex: buildIcon((c, cx, cy) => {
                    // Salad bowl
                    c.beginPath();
                    c.moveTo(cx-26,cy+4);
                    c.bezierCurveTo(cx-26,cy+32, cx+26,cy+32, cx+26,cy+4);
                    c.stroke();
                    c.beginPath(); c.moveTo(cx-28,cy+4); c.lineTo(cx+28,cy+4); c.stroke();
                    // greens
                    c.strokeStyle='rgba(196,218,132,0.85)'; c.lineWidth=2.5;
                    c.beginPath(); c.ellipse(cx-10,cy-8,10,6,-0.5,0,Math.PI*2); c.stroke();
                    c.beginPath(); c.ellipse(cx+10,cy-10,10,6, 0.5,0,Math.PI*2); c.stroke();
                    c.strokeStyle='#FFFFFF'; c.lineWidth=3.5;
                    c.beginPath(); c.ellipse(cx,cy-6,7,12,0,0,Math.PI*2); c.stroke();
                })
            },
            {
                tip: '🍫 Chocolate & Treats',
                pos: [1.10, -1.20, -0.80],
                phase: 2.8,
                tex: buildIcon((c, cx, cy) => {
                    // Chocolate bar
                    c.beginPath();
                    if (c.roundRect) c.roundRect(cx-22,cy-20,44,38,7);
                    else { c.rect(cx-22,cy-20,44,38); }
                    c.stroke();
                    c.lineWidth=2.5;
                    c.beginPath(); c.moveTo(cx,cy-20); c.lineTo(cx,cy+18); c.stroke();
                    c.beginPath(); c.moveTo(cx-22,cy-5); c.lineTo(cx+22,cy-5); c.stroke();
                    c.beginPath(); c.moveTo(cx-22,cy+8); c.lineTo(cx+22,cy+8); c.stroke();
                    c.lineWidth=3.5;
                    // cocoa bean accents
                    c.fillStyle='#C4DA84';
                    c.beginPath(); c.ellipse(cx-11,cy-13,4.5,6,-0.3,0,Math.PI*2); c.fill();
                    c.beginPath(); c.ellipse(cx+11,cy-13,4.5,6, 0.3,0,Math.PI*2); c.fill();
                    c.fillStyle='#FFFFFF';
                    // melting drip
                    c.beginPath();
                    c.moveTo(cx-7,cy+18); c.bezierCurveTo(cx-7,cy+27,cx-2,cy+31,cx,cy+31);
                    c.bezierCurveTo(cx+2,cy+31,cx+7,cy+27,cx+7,cy+18);
                    c.fill();
                })
            },
            {
                tip: '🥜 Healthy Snacks',
                pos: [-1.35, 1.05, -0.50],
                phase: 3.5,
                tex: buildIcon((c, cx, cy) => {
                    // Peanut
                    c.beginPath(); c.ellipse(cx-13,cy-2,11,15,0,0,Math.PI*2); c.stroke();
                    c.beginPath(); c.ellipse(cx+13,cy-2,11,15,0,0,Math.PI*2); c.stroke();
                    c.lineWidth=3;
                    c.beginPath(); c.moveTo(cx-4,cy-10); c.lineTo(cx+4,cy-10); c.stroke();
                    c.beginPath(); c.moveTo(cx-4,cy+6);  c.lineTo(cx+4,cy+6);  c.stroke();
                    c.lineWidth=3.5;
                    // texture strokes
                    c.strokeStyle='rgba(196,218,132,0.8)'; c.lineWidth=2;
                    [[-14,-7],[-10,5],[14,-7],[10,5]].forEach(([dx,dy])=>{
                        c.beginPath(); c.moveTo(cx+dx-4,cy+dy); c.lineTo(cx+dx+4,cy+dy); c.stroke();
                    });
                    c.strokeStyle='#FFFFFF'; c.lineWidth=3.5;
                })
            },
            {
                tip: '❤️ Heart Health',
                pos: [0.20, 0.30, 1.95],
                phase: 4.2,
                tex: buildIcon((c, cx, cy) => {
                    // Heart
                    c.beginPath();
                    c.moveTo(cx, cy+20);
                    c.bezierCurveTo(cx-26,cy+8,  cx-28,cy-12, cx-14,cy-18);
                    c.bezierCurveTo(cx-6, cy-22,  cx,   cy-14, cx,   cy-14);
                    c.bezierCurveTo(cx,   cy-14,  cx+6, cy-22, cx+14,cy-18);
                    c.bezierCurveTo(cx+28,cy-12,  cx+26,cy+8,  cx,   cy+20);
                    c.fill();
                    // EKG line
                    c.strokeStyle='#003D1F'; c.lineWidth=3;
                    c.beginPath();
                    c.moveTo(cx-16,cy+4); c.lineTo(cx-8,cy+4); c.lineTo(cx-3,cy-8);
                    c.lineTo(cx+3,cy+14); c.lineTo(cx+8,cy-4); c.lineTo(cx+12,cy+4); c.lineTo(cx+18,cy+4);
                    c.stroke();
                    c.strokeStyle='#FFFFFF'; c.lineWidth=3.5;
                })
            },
            {
                tip: '💊 Supplements',
                pos: [-0.40, -1.50, -0.90],
                phase: 4.9,
                tex: buildIcon((c, cx, cy) => {
                    // Capsule pill
                    c.save(); c.translate(cx,cy); c.rotate(-0.45);
                    c.beginPath();
                    c.moveTo(-18,-10); c.arc(-10,0,10,Math.PI*1.5,Math.PI*0.5,true);
                    c.lineTo(10,10);  c.arc(10,0,10,Math.PI*0.5,Math.PI*1.5,true);
                    c.closePath(); c.stroke();
                    c.beginPath(); c.moveTo(-18,0); c.lineTo(18,0); c.stroke();
                    // half fill
                    c.fillStyle='rgba(196,218,132,0.65)';
                    c.beginPath();
                    c.moveTo(-18,0); c.arc(-10,0,10,Math.PI*1.5,Math.PI*0.5,true); c.lineTo(-18,0);
                    c.fill(); c.restore();
                    c.fillStyle='#FFFFFF';
                    // floating dots
                    [[cx+14,cy-22],[cx+20,cy-12],[cx+22,cy+2]].forEach(([x,y])=>{
                        c.beginPath(); c.arc(x,y,3,0,Math.PI*2); c.fill();
                    });
                })
            },
            {
                tip: '🌱 Plant-Based',
                pos: [-0.50, -0.40, -1.95],
                phase: 5.6,
                tex: buildIcon((c, cx, cy) => {
                    // Potted plant
                    c.beginPath(); c.moveTo(cx,cy+10); c.lineTo(cx,cy-14); c.stroke();
                    // left leaf
                    c.beginPath();
                    c.moveTo(cx,cy-6);
                    c.bezierCurveTo(cx-8,cy-20, cx-22,cy-20, cx-22,cy-10);
                    c.bezierCurveTo(cx-22,cy, cx-8,cy+2, cx,cy-6);
                    c.stroke();
                    // right leaf
                    c.beginPath();
                    c.moveTo(cx,cy-12);
                    c.bezierCurveTo(cx+8,cy-26, cx+22,cy-26, cx+22,cy-16);
                    c.bezierCurveTo(cx+22,cy-6, cx+8,cy-4, cx,cy-12);
                    c.stroke();
                    // pot
                    c.beginPath();
                    c.moveTo(cx-18,cy+10); c.lineTo(cx+18,cy+10);
                    c.lineTo(cx+14,cy+28); c.lineTo(cx-14,cy+28); c.closePath();
                    c.stroke();
                    // pot rim accent
                    c.strokeStyle='rgba(196,218,132,0.7)'; c.lineWidth=2;
                    c.beginPath(); c.moveTo(cx-17,cy+15); c.lineTo(cx+17,cy+15); c.stroke();
                    c.strokeStyle='#FFFFFF'; c.lineWidth=3.5;
                })
            },
            {
                tip: '⚡ Vitality Boost',
                pos: [1.60, -0.50, 0.90],
                phase: 6.3,
                tex: buildIcon((c, cx, cy) => {
                    // Bold lightning bolt
                    c.beginPath();
                    c.moveTo(cx+10,cy-28);
                    c.lineTo(cx-4, cy-4);
                    c.lineTo(cx+8, cy-4);
                    c.lineTo(cx-10,cy+28);
                    c.lineTo(cx+4, cy+4);
                    c.lineTo(cx-8, cy+4);
                    c.closePath();
                    c.fill();
                    // outer spark ring
                    c.strokeStyle='rgba(196,218,132,0.5)'; c.lineWidth=2;
                    c.beginPath(); c.arc(cx,cy,32,0,Math.PI*2); c.stroke();
                    c.strokeStyle='#FFFFFF'; c.lineWidth=3.5;
                })
            },
            {
                tip: '🛡 Wellness Shield',
                pos: [-1.50, 0.20, 1.10],
                phase: 7.0,
                tex: buildIcon((c, cx, cy) => {
                    // Shield shape
                    c.beginPath();
                    c.moveTo(cx,cy-26); c.lineTo(cx+22,cy-16); c.lineTo(cx+22,cy+2);
                    c.quadraticCurveTo(cx+22,cy+20, cx,cy+30);
                    c.quadraticCurveTo(cx-22,cy+20, cx-22,cy+2);
                    c.lineTo(cx-22,cy-16); c.closePath();
                    // sage fill
                    c.fillStyle='rgba(196,218,132,0.14)'; c.fill();
                    c.strokeStyle='#FFFFFF'; c.stroke();
                    // checkmark
                    c.lineWidth=4;
                    c.beginPath(); c.moveTo(cx-12,cy+4); c.lineTo(cx-2,cy+14); c.lineTo(cx+14,cy-8); c.stroke();
                    c.lineWidth=3.5;
                    c.fillStyle='#FFFFFF';
                })
            },
            {
                tip: '🍃 Natural Products',
                pos: [0.80, 1.50, 0.90],
                phase: 7.7,
                tex: buildIcon((c, cx, cy) => {
                    // Two arching leaves
                    c.save(); c.translate(cx,cy); c.rotate(-0.28);
                    c.beginPath();
                    c.moveTo(0,-26);
                    c.bezierCurveTo(-20,-22, -22,10, 0,24);
                    c.bezierCurveTo(2,12, 2,-12, 0,-26);
                    c.stroke();
                    c.beginPath(); c.moveTo(0,-26); c.lineTo(0,24); c.stroke();
                    c.restore();
                    c.save(); c.translate(cx,cy); c.rotate(0.28);
                    c.beginPath();
                    c.moveTo(0,-26);
                    c.bezierCurveTo(20,-22, 22,10, 0,24);
                    c.bezierCurveTo(-2,12, -2,-12, 0,-26);
                    c.stroke();
                    c.beginPath(); c.moveTo(0,-26); c.lineTo(0,24); c.stroke();
                    c.restore();
                    // stem
                    c.beginPath(); c.moveTo(cx,cy+24); c.lineTo(cx,cy+32); c.stroke();
                })
            },
        ];

        const spriteList = [];

        NODES.forEach((nd, i) => {
            const pos = new THREE.Vector3(...nd.pos);

            // Sprite icon
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
                map: nd.tex, transparent: true, opacity: 1.0, depthTest: false,
            }));
            sprite.position.copy(pos);
            sprite.scale.set(0.54, 0.54, 0.54);
            sprite.userData.tip = nd.tip;
            GLOBE.add(sprite);
            spriteList.push(sprite);

            // Inner pulse ring
            const rM = new THREE.MeshBasicMaterial({ color: 0xC4DA84, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
            const ring = new THREE.Mesh(new THREE.RingGeometry(0.20, 0.265, 40), rM);
            ring.position.copy(pos); ring.lookAt(0,0,0);
            GLOBE.add(ring);

            // Outer halo ring
            const hM = new THREE.MeshBasicMaterial({ color: 0xC4DA84, transparent: true, opacity: 0.14, side: THREE.DoubleSide });
            const halo = new THREE.Mesh(new THREE.RingGeometry(0.31, 0.38, 40), hM);
            halo.position.copy(pos); halo.lookAt(0,0,0);
            GLOBE.add(halo);

            // Connector line from surface to node
            const dir   = pos.clone().normalize();
            const lGeo  = new THREE.BufferGeometry().setFromPoints([dir.clone().multiplyScalar(2.03), pos.clone()]);
            GLOBE.add(new THREE.Line(lGeo, new THREE.LineBasicMaterial({ color: 0xC4DA84, transparent: true, opacity: 0.28 })));

            nd._ring = ring; nd._halo = halo; nd._phase = nd.phase;
        });

        // ── LIGHTS ──
        scene.add(new THREE.AmbientLight(0xffffff, 0.75));
        const key = new THREE.DirectionalLight(0xffffff, 0.65); key.position.set(6,6,8); scene.add(key);
        const rim = new THREE.DirectionalLight(0xC4DA84, 0.35); rim.position.set(-6,-4,4); scene.add(rim);
        const top = new THREE.DirectionalLight(0xC4DA84, 0.20); top.position.set(0,8,-6);  scene.add(top);

        // ── RAYCASTER / TOOLTIP ──
        const ray = new THREE.Raycaster();
        const m2  = new THREE.Vector2();

        renderer.domElement.addEventListener('mousemove', e => {
            const r = renderer.domElement.getBoundingClientRect();
            m2.x =  (e.clientX - r.left) / r.width  * 2 - 1;
            m2.y = -(e.clientY - r.top)  / r.height * 2 + 1;
            ray.setFromCamera(m2, camera);
            const hits = ray.intersectObjects(spriteList);
            if (hits.length) {
                tooltip.textContent   = hits[0].object.userData.tip;
                tooltip.style.left    = (e.clientX + 18) + 'px';
                tooltip.style.top     = (e.clientY - 14) + 'px';
                tooltip.style.opacity = '1';
            } else {
                tooltip.style.opacity = '0';
            }
        });
        renderer.domElement.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });

        // ── DRAG ──
        let drag = false, px = 0, py = 0, vx = 0, vy = 0;
        const AUTO = 0.0005;
        const dn = (x,y) => { drag=true; px=x; py=y; };
        const mv = (x,y) => {
            if (!drag) return;
            const dx=x-px, dy=y-py;
            vx=dx*0.0004; vy=dy*0.0004;
            GLOBE.rotation.y += dx*0.004;
            GLOBE.rotation.x += dy*0.004;
            px=x; py=y;
        };
        const up = () => { drag = false; };

        container.addEventListener('mousedown',  e=>dn(e.clientX,e.clientY));
        container.addEventListener('mousemove',  e=>mv(e.clientX,e.clientY));
        container.addEventListener('mouseup',    up);
        container.addEventListener('mouseleave', up);
        container.addEventListener('touchstart', e=>dn(e.touches[0].clientX,e.touches[0].clientY), {passive:true});
        container.addEventListener('touchmove',  e=>{e.preventDefault();mv(e.touches[0].clientX,e.touches[0].clientY);}, {passive:false});
        container.addEventListener('touchend',   up);

        // ── ANIMATE ──
        function animate() {
            requestAnimationFrame(animate);
            const t = Date.now() * 0.001;

            if (!drag) {
                GLOBE.rotation.y += AUTO + vx;
                GLOBE.rotation.x += vy;
                vx *= 0.93; vy *= 0.93;
            }

            haloMesh.rotation.y    -= 0.00022;
            haloMesh.rotation.x    += 0.00011;
            particleCloud.rotation.y = t * 0.016;

            NODES.forEach(nd => {
                const s = 1 + Math.sin(t * 1.6 + nd._phase) * 0.12;
                if (nd._ring) nd._ring.scale.set(s,s,s);
                if (nd._halo) {
                    const hs = 1 + Math.sin(t*1.4 + nd._phase + 0.6) * 0.18;
                    nd._halo.scale.set(hs,hs,hs);
                    nd._halo.material.opacity = 0.07 + Math.abs(Math.sin(t+nd._phase)) * 0.15;
                }
            });

            renderer.render(scene, camera);
        }
        animate();

        // ── RESIZE ──
        window.addEventListener('resize', () => {
            const w = container.offsetWidth, h = container.offsetHeight;
            if (w < 10 || h < 10) return;
            camera.aspect = w/h;
            camera.updateProjectionMatrix();
            renderer.setSize(w,h);
        }, {passive:true});
    }

    // Small delay so CSS has set #globe-container dimensions
    setTimeout(init, 60);
})();
