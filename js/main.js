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
    if (!container) return;

    // ── Tooltip ──
    const tooltip = document.createElement('div');
    tooltip.id = 'globe-tooltip';
    tooltip.style.cssText = `
        position:fixed; z-index:500; pointer-events:none;
        background:rgba(0,36,18,0.92); border:1px solid rgba(196,218,132,0.45);
        border-radius:10px; padding:8px 14px;
        font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
        color:#C4DA84; backdrop-filter:blur(12px);
        opacity:0; transition:opacity 0.2s; white-space:nowrap;
        box-shadow:0 4px 20px rgba(0,71,35,0.25);
    `;
    document.body.appendChild(tooltip);

    // ── Scene ──
    const scene    = new THREE.Scene();
    const W = container.offsetWidth, H = container.offsetHeight;
    const camera   = new THREE.PerspectiveCamera(42, W / H, 0.1, 1000);
    camera.position.z = 5.8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // ── Colors ──
    const C_FOREST = 0x004723;
    const C_SAGE   = 0xC4DA84;

    // ── Core wireframe ──
    const coreGeo = new THREE.IcosahedronGeometry(2, 5);
    globeGroup.add(new THREE.Mesh(coreGeo, new THREE.MeshBasicMaterial({
        color: C_FOREST, wireframe: true, transparent: true, opacity: 0.13
    })));

    // ── Inner glow sphere ──
    globeGroup.add(new THREE.Mesh(
        new THREE.SphereGeometry(1.97, 32, 32),
        new THREE.MeshBasicMaterial({ color: C_SAGE, transparent: true, opacity: 0.04 })
    ));

    // ── Outer halo ──
    const outerMesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.45, 2),
        new THREE.MeshBasicMaterial({ color: C_SAGE, wireframe: true, transparent: true, opacity: 0.05 })
    );
    globeGroup.add(outerMesh);

    // ── Lat / Lon rings ──
    const ringLineMat = new THREE.LineBasicMaterial({ color: C_SAGE, transparent: true, opacity: 0.15 });

    function makeLatRing(latDeg, r = 2.02) {
        const lat = latDeg * Math.PI / 180;
        const ry  = r * Math.sin(lat);
        const rr  = r * Math.cos(lat);
        const pts = [];
        for (let i = 0; i <= 128; i++) {
            const a = (i / 128) * Math.PI * 2;
            pts.push(new THREE.Vector3(rr * Math.cos(a), ry, rr * Math.sin(a)));
        }
        return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringLineMat);
    }

    function makeLonRing(lonDeg, r = 2.02) {
        const lon = lonDeg * Math.PI / 180;
        const pts = [];
        for (let i = 0; i <= 128; i++) {
            const lat = (i / 128) * Math.PI - Math.PI / 2;
            pts.push(new THREE.Vector3(
                r * Math.cos(lat) * Math.cos(lon),
                r * Math.sin(lat),
                r * Math.cos(lat) * Math.sin(lon)
            ));
        }
        return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringLineMat);
    }

    [-60, -30, 0, 30, 60].forEach(d => globeGroup.add(makeLatRing(d)));
    [0, 45, 90, 135].forEach(d => globeGroup.add(makeLonRing(d)));

    // ── Particles ──
    const PCount = 600;
    const pPos   = new Float32Array(PCount * 3);
    for (let i = 0; i < PCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi   = Math.acos(2 * Math.random() - 1);
        const r     = 2.3 + Math.random() * 1.6;
        pPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
        color: C_SAGE, size: 0.016, transparent: true, opacity: 0.4
    }));
    globeGroup.add(particles);

    // ── Node icon canvas builder ──
    // Each icon is drawn at 96×96 on a deep green circle with a sage ring
    function makeNodeTexture(type) {
        const cvs = document.createElement('canvas');
        cvs.width = cvs.height = 96;
        const c = cvs.getContext('2d');

        // Drop shadow
        c.shadowColor = 'rgba(0,0,0,0.35)';
        c.shadowBlur  = 8;

        // Background circle — forest green
        c.fillStyle = '#003D1F';
        c.beginPath();
        c.arc(48, 48, 44, 0, Math.PI * 2);
        c.fill();

        c.shadowBlur = 0;

        // Sage outer ring
        c.strokeStyle = '#C4DA84';
        c.lineWidth = 2.5;
        c.beginPath();
        c.arc(48, 48, 40, 0, Math.PI * 2);
        c.stroke();

        // Inner subtle ring
        c.strokeStyle = 'rgba(196,218,132,0.25)';
        c.lineWidth = 1;
        c.beginPath();
        c.arc(48, 48, 34, 0, Math.PI * 2);
        c.stroke();

        // Icon strokes — white, rounded caps
        c.strokeStyle = '#FFFFFF';
        c.fillStyle   = '#FFFFFF';
        c.lineWidth   = 2.5;
        c.lineCap     = 'round';
        c.lineJoin    = 'round';

        const cx = 48, cy = 48; // centre

        switch (type) {

            // 🌿 Organic — a full leaf with a midrib and two vein curves
            case 'Organic':
                c.beginPath();
                c.moveTo(cx, cy - 18);
                c.bezierCurveTo(cx + 18, cy - 14, cx + 18, cy + 10, cx, cy + 18);
                c.bezierCurveTo(cx - 18, cy + 10, cx - 18, cy - 14, cx, cy - 18);
                c.stroke();
                // midrib
                c.beginPath();
                c.moveTo(cx, cy - 18);
                c.lineTo(cx, cy + 18);
                c.stroke();
                // left vein
                c.beginPath();
                c.moveTo(cx, cy);
                c.quadraticCurveTo(cx - 10, cy - 4, cx - 14, cy - 10);
                c.stroke();
                // right vein
                c.beginPath();
                c.moveTo(cx, cy);
                c.quadraticCurveTo(cx + 10, cy - 4, cx + 14, cy - 10);
                c.stroke();
                break;

            // 🥑 Keto — avocado shape: outer pear + inner pit
            case 'Keto':
                // outer pear
                c.beginPath();
                c.moveTo(cx, cy - 20);
                c.bezierCurveTo(cx + 14, cy - 16, cx + 16, cy + 4, cx + 10, cy + 16);
                c.bezierCurveTo(cx + 4, cy + 22, cx - 4, cy + 22, cx - 10, cy + 16);
                c.bezierCurveTo(cx - 16, cy + 4, cx - 14, cy - 16, cx, cy - 20);
                c.stroke();
                // pit / seed
                c.beginPath();
                c.arc(cx, cy + 6, 6, 0, Math.PI * 2);
                c.fill();
                // stem
                c.beginPath();
                c.moveTo(cx, cy - 20);
                c.lineTo(cx, cy - 26);
                c.stroke();
                break;

            // 🌾 Gluten-Free — wheat stalk crossed out
            case 'Gluten-Free':
                // stalk
                c.beginPath();
                c.moveTo(cx, cy + 20);
                c.lineTo(cx, cy - 16);
                c.stroke();
                // grains (small arcs left & right up the stalk)
                [cy - 4, cy - 10, cy - 16].forEach((y, i) => {
                    const side = (i % 2 === 0) ? 1 : -1;
                    c.beginPath();
                    c.ellipse(cx + side * 9, y - 2, 7, 4, side * 0.5, 0, Math.PI * 2);
                    c.stroke();
                });
                // strikethrough X
                c.strokeStyle = '#C4DA84';
                c.lineWidth = 2;
                c.beginPath();
                c.moveTo(cx - 16, cy - 18);
                c.lineTo(cx + 16, cy + 18);
                c.stroke();
                c.beginPath();
                c.moveTo(cx + 16, cy - 18);
                c.lineTo(cx - 16, cy + 18);
                c.stroke();
                c.strokeStyle = '#FFFFFF';
                c.lineWidth   = 2.5;
                break;

            // 🥗 Low-Carb — a bowl with salad leaves
            case 'Low-Carb':
                // bowl
                c.beginPath();
                c.arc(cx, cy + 4, 18, 0, Math.PI);
                c.stroke();
                // bowl rim
                c.beginPath();
                c.moveTo(cx - 18, cy + 4);
                c.lineTo(cx + 18, cy + 4);
                c.stroke();
                // leaf left
                c.beginPath();
                c.ellipse(cx - 8, cy - 6, 7, 4, -0.5, 0, Math.PI * 2);
                c.stroke();
                // leaf right
                c.beginPath();
                c.ellipse(cx + 8, cy - 8, 7, 4, 0.5, 0, Math.PI * 2);
                c.stroke();
                // centre leaf
                c.beginPath();
                c.ellipse(cx, cy - 4, 5, 8, 0, 0, Math.PI * 2);
                c.stroke();
                break;

            // 🍫 Chocolate — chocolate bar grid
            case 'Chocolate':
                // outer bar rounded rect
                c.beginPath();
                c.roundRect(cx - 17, cy - 14, 34, 28, 4);
                c.stroke();
                // vertical divider
                c.beginPath();
                c.moveTo(cx, cy - 14);
                c.lineTo(cx, cy + 14);
                c.stroke();
                // horizontal dividers
                c.beginPath();
                c.moveTo(cx - 17, cy - 3);
                c.lineTo(cx + 17, cy - 3);
                c.stroke();
                c.beginPath();
                c.moveTo(cx - 17, cy + 7);
                c.lineTo(cx + 17, cy + 7);
                c.stroke();
                // small heart chip
                c.fillStyle = '#C4DA84';
                c.beginPath();
                c.arc(cx - 7, cy - 10, 2, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = '#FFFFFF';
                break;

            // 🥜 Healthy Snacks — peanut / nut shape
            case 'Snacks':
                // left lobe
                c.beginPath();
                c.ellipse(cx - 9, cy, 8, 12, 0, 0, Math.PI * 2);
                c.stroke();
                // right lobe
                c.beginPath();
                c.ellipse(cx + 9, cy, 8, 12, 0, 0, Math.PI * 2);
                c.stroke();
                // waist connector
                c.beginPath();
                c.moveTo(cx - 2, cy - 5);
                c.lineTo(cx + 2, cy - 5);
                c.moveTo(cx - 2, cy + 5);
                c.lineTo(cx + 2, cy + 5);
                c.stroke();
                // texture dots
                c.fillStyle = 'rgba(255,255,255,0.6)';
                [[-10, -4], [-8, 4], [10, -4], [8, 4]].forEach(([dx, dy]) => {
                    c.beginPath();
                    c.arc(cx + dx, cy + dy, 1.5, 0, Math.PI * 2);
                    c.fill();
                });
                c.fillStyle = '#FFFFFF';
                break;

            // ❤️ Heart — wellness node default
            case 'Heart':
                c.beginPath();
                c.moveTo(cx, cy + 16);
                c.bezierCurveTo(cx - 18, cy + 6,  cx - 20, cy - 8,  cx - 10, cy - 12);
                c.bezierCurveTo(cx - 4,  cy - 16, cx,      cy - 10, cx,      cy - 10);
                c.bezierCurveTo(cx,      cy - 10, cx + 4,  cy - 16, cx + 10, cy - 12);
                c.bezierCurveTo(cx + 20, cy - 8,  cx + 18, cy + 6,  cx,      cy + 16);
                c.fill();
                break;

            // 🌱 Plant / Sprout
            case 'Plant':
                c.beginPath();
                c.moveTo(cx, cy + 18);
                c.lineTo(cx, cy - 6);
                c.stroke();
                c.beginPath();
                c.ellipse(cx - 10, cy - 12, 8, 12, -0.4, 0, Math.PI * 2);
                c.stroke();
                c.beginPath();
                c.ellipse(cx + 10, cy - 12, 8, 12, 0.4, 0, Math.PI * 2);
                c.stroke();
                break;

            // 🛡 Wellness shield
            case 'Wellness':
                c.beginPath();
                c.moveTo(cx, cy - 20);
                c.lineTo(cx + 16, cy - 12);
                c.lineTo(cx + 16, cy + 2);
                c.quadraticCurveTo(cx + 16, cy + 16, cx, cy + 22);
                c.quadraticCurveTo(cx - 16, cy + 16, cx - 16, cy + 2);
                c.lineTo(cx - 16, cy - 12);
                c.closePath();
                c.stroke();
                // inner checkmark
                c.lineWidth = 2;
                c.beginPath();
                c.moveTo(cx - 7, cy + 2);
                c.lineTo(cx - 2, cy + 8);
                c.lineTo(cx + 8, cy - 6);
                c.stroke();
                c.lineWidth = 2.5;
                break;

            // 💊 Supplements pill
            case 'Supplements':
                c.beginPath();
                c.moveTo(cx - 14, cy);
                c.arc(cx - 6, cy, 8, Math.PI, 0);
                c.lineTo(cx + 14, cy);
                c.arc(cx + 6, cy, 8, 0, Math.PI);
                c.closePath();
                c.stroke();
                c.beginPath();
                c.moveTo(cx - 2, cy - 8);
                c.lineTo(cx + 2, cy + 8);
                c.stroke();
                break;

            // ⚡ Vitality — heartbeat line
            case 'Vitality':
                c.beginPath();
                c.moveTo(cx - 20, cy);
                c.lineTo(cx - 10, cy);
                c.lineTo(cx - 5,  cy - 14);
                c.lineTo(cx,      cy + 14);
                c.lineTo(cx + 5,  cy - 8);
                c.lineTo(cx + 10, cy);
                c.lineTo(cx + 20, cy);
                c.stroke();
                break;

            // 🍃 Natural — two overlapping leaves
            case 'Natural':
                c.beginPath();
                c.ellipse(cx - 4, cy, 10, 16, -0.3, 0, Math.PI * 2);
                c.stroke();
                c.beginPath();
                c.ellipse(cx + 4, cy, 10, 16, 0.3, 0, Math.PI * 2);
                c.stroke();
                // stem
                c.beginPath();
                c.moveTo(cx, cy + 16);
                c.lineTo(cx, cy + 22);
                c.stroke();
                break;

            default:
                c.beginPath();
                c.arc(cx, cy, 10, 0, Math.PI * 2);
                c.stroke();
        }

        const tex = new THREE.CanvasTexture(cvs);
        tex.minFilter = THREE.LinearFilter;
        return tex;
    }

    // ── Wellness nodes — 11 total ──
    const NODES = [
        { pos: [ 1.3,  0.8,  1.1], label: 'Organic',      tip: '🌿 Organic Products'       },
        { pos: [-1.2,  0.6,  1.3], label: 'Heart',         tip: '❤️ Heart Health'            },
        { pos: [ 0.4,  1.4, -0.6], label: 'Plant',         tip: '🌱 Plant-Based'             },
        { pos: [-0.9, -1.0,  1.2], label: 'Wellness',      tip: '🛡 Wellness'                },
        { pos: [ 1.1, -1.2, -0.8], label: 'Vitality',      tip: '⚡ Vitality Boosters'       },
        { pos: [-1.3,  1.0, -0.5], label: 'Supplements',   tip: '💊 Supplements'             },
        { pos: [ 0.2,  0.3,  1.9], label: 'Natural',       tip: '🍃 Natural Products'        },
        // New nodes
        { pos: [-0.5, -0.4, -1.95], label: 'Keto',         tip: '🥑 Keto-Friendly'           },
        { pos: [ 1.6, -0.5,  0.9], label: 'Gluten-Free',   tip: '🌾 Gluten-Free'             },
        { pos: [-1.5,  0.2,  1.1], label: 'Low-Carb',      tip: '🥗 Low-Carb Options'        },
        { pos: [ 0.8,  1.5,  0.9], label: 'Chocolate',     tip: '🍫 Chocolate & Treats'      },
        { pos: [-0.8, -1.5,  0.6], label: 'Snacks',        tip: '🥜 Healthy Snacks'          },
    ];

    const nodeMeshes = []; // for raycasting

    NODES.forEach((node, i) => {
        const pos = new THREE.Vector3(...node.pos);

        // Pulse ring
        const ringGeo = new THREE.RingGeometry(0.18, 0.24, 36);
        const ringMat = new THREE.MeshBasicMaterial({ color: C_SAGE, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
        const ring    = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.lookAt(0, 0, 0);
        globeGroup.add(ring);

        // Outer halo ring
        const haloGeo = new THREE.RingGeometry(0.3, 0.36, 36);
        const haloMat = new THREE.MeshBasicMaterial({ color: C_SAGE, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
        const halo    = new THREE.Mesh(haloGeo, haloMat);
        halo.position.copy(pos);
        halo.lookAt(0, 0, 0);
        globeGroup.add(halo);

        // Icon sprite
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: makeNodeTexture(node.label),
            transparent: true,
            opacity: 0.97
        }));
        sprite.position.copy(pos);
        sprite.scale.set(0.42, 0.42, 0.42);
        sprite.userData = { tip: node.tip };
        globeGroup.add(sprite);

        nodeMeshes.push(sprite);

        node.ring  = ring;
        node.halo  = halo;
        node.sprite = sprite;
        node.phase  = i * 0.65;
    });

    // ── Lights ──
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const rimLight = new THREE.DirectionalLight(C_SAGE, 0.5);
    rimLight.position.set(5, 4, 5);
    scene.add(rimLight);
    const fillLight = new THREE.DirectionalLight(C_FOREST, 0.25);
    fillLight.position.set(-5, -3, 3);
    scene.add(fillLight);

    // ── Raycasting for tooltip ──
    const raycaster = new THREE.Raycaster();
    const mouse2d   = new THREE.Vector2();

    renderer.domElement.addEventListener('mousemove', e => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse2d.x =  ((e.clientX - rect.left)  / rect.width)  * 2 - 1;
        mouse2d.y = -((e.clientY - rect.top)    / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse2d, camera);
        const hits = raycaster.intersectObjects(nodeMeshes);

        if (hits.length) {
            tooltip.textContent   = hits[0].object.userData.tip;
            tooltip.style.left    = (e.clientX + 16) + 'px';
            tooltip.style.top     = (e.clientY - 12) + 'px';
            tooltip.style.opacity = '1';
        } else {
            tooltip.style.opacity = '0';
        }
    });

    renderer.domElement.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
    });

    // ── Drag interaction ──
    let isDragging = false;
    let prevMouse  = { x: 0, y: 0 };
    let velocity   = { x: 0, y: 0 };
    const AUTO_SPEED = 0.0005;

    const startDrag = (x, y) => { isDragging = true; prevMouse = { x, y }; };
    const moveDrag  = (x, y) => {
        if (!isDragging) return;
        const dx = x - prevMouse.x, dy = y - prevMouse.y;
        velocity.x = dx * 0.0004;
        velocity.y = dy * 0.0004;
        globeGroup.rotation.y += dx * 0.004;
        globeGroup.rotation.x += dy * 0.004;
        prevMouse = { x, y };
    };
    const endDrag = () => { isDragging = false; };

    container.addEventListener('mousedown',  e => startDrag(e.clientX, e.clientY));
    container.addEventListener('mousemove',  e => moveDrag(e.clientX, e.clientY));
    container.addEventListener('mouseup',    endDrag);
    container.addEventListener('mouseleave', endDrag);
    container.addEventListener('touchstart', e => startDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    container.addEventListener('touchmove',  e => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    container.addEventListener('touchend',   endDrag);

    // ── Animation loop ──
    function animate() {
        requestAnimationFrame(animate);
        const t = Date.now() * 0.001;

        if (!isDragging) {
            globeGroup.rotation.y += AUTO_SPEED + velocity.x;
            globeGroup.rotation.x += velocity.y;
            velocity.x *= 0.94;
            velocity.y *= 0.94;
        }

        particles.rotation.y   = t * 0.018;
        outerMesh.rotation.y  -= 0.00018;
        outerMesh.rotation.x  += 0.00009;

        NODES.forEach(node => {
            const s = 1 + Math.sin(t * 1.4 + node.phase) * 0.1;
            if (node.ring) node.ring.scale.set(s, s, s);
            if (node.halo) node.halo.scale.set(s * 1.4, s * 1.4, s * 1.4);
        });

        renderer.render(scene, camera);
    }
    animate();

    // ── Resize ──
    window.addEventListener('resize', () => {
        const w = container.offsetWidth, h = container.offsetHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }, { passive: true });
})();
// ============================================
// SCROLL REVEAL ANIMATION
// ============================================
(function () {
    const revealEls = document.querySelectorAll(
        '.about-glass, .cat-card, .product-card, .why-card, .testi-card, .blog-card, .about-stat-card'
    );

    if (!revealEls.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(28px)';
        el.style.transition = `opacity 0.55s ease ${(i % 4) * 0.08}s, transform 0.55s var(--ease-out) ${(i % 4) * 0.08}s`;
        observer.observe(el);
    });
})();

// ============================================
// NEWSLETTER FORM
// ============================================
(function () {
    const form = document.querySelector('.newsletter-form');
    const input = document.querySelector('.newsletter-input');
    const btn = document.querySelector('.newsletter-btn');
    if (!form || !input || !btn) return;

    btn.addEventListener('click', () => {
        const email = input.value.trim();
        if (!email || !email.includes('@')) {
            input.style.borderColor = '#ff6b6b';
            setTimeout(() => input.style.borderColor = '', 1500);
            return;
        }
        btn.textContent = '✓ Subscribed!';
        btn.style.background = '#2E7D52';
        input.value = '';
        setTimeout(() => { btn.textContent = 'Subscribe'; btn.style.background = ''; }, 3000);
    });
})();
