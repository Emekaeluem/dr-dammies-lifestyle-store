cat > /mnt/user-data/outputs/dr-dammies/js/main.js << 'JSEOF'
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
// WELLNESS ORB — Dr. Dammie's
// ============================================
(function () {
    const container = document.getElementById('globe-container');
    if (!container || typeof THREE === 'undefined') return;

    // ── Tooltip ──────────────────────────────
    const tooltip = document.createElement('div');
    tooltip.className = 'globe-tooltip';
    document.body.appendChild(tooltip);

    // ── Renderer ──────────────────────────────
    const W = container.offsetWidth || 600;
    const H = container.offsetHeight || 620;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 200);
    camera.position.set(0, 0, 7.2);

    // ── Groups ──────────────────────────────
    const ROOT   = new THREE.Group(); // everything rotates here
    const ORBITS = new THREE.Group(); // orbit rings only (counter-rotate for static look)
    scene.add(ROOT);
    scene.add(ORBITS);

    // ── PALETTE ──────────────────────────────
    const HEX = {
        forest:  0x003D1F,
        forestM: 0x004723,
        sage:    0xC4DA84,
        sageDim: 0x8BAD4A,
        white:   0xFFFFFF,
        cream:   0xF0F7E6,
    };

    // ── CORE SPHERE ──────────────────────────
    // Layered translucent spheres for depth + glow
    const coreGeo = new THREE.SphereGeometry(2.0, 64, 64);

    // Outer skin — very faint sage tint
    const skinMat = new THREE.MeshPhongMaterial({
        color: HEX.sage,
        emissive: HEX.sage,
        emissiveIntensity: 0.06,
        transparent: true,
        opacity: 0.08,
        side: THREE.FrontSide,
    });
    ROOT.add(new THREE.Mesh(coreGeo, skinMat));

    // Inner deep green core
    const innerMat = new THREE.MeshPhongMaterial({
        color: HEX.forest,
        emissive: HEX.forestM,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.55,
        shininess: 40,
    });
    ROOT.add(new THREE.Mesh(new THREE.SphereGeometry(1.92, 64, 64), innerMat));

    // ── ICOSPHERE WIREFRAME ──────────────────
    // Fine mesh gives "digital earth" texture
    const wfGeo = new THREE.IcosahedronGeometry(2.01, 6);
    const wfMat = new THREE.MeshBasicMaterial({
        color: HEX.sage,
        wireframe: true,
        transparent: true,
        opacity: 0.07,
    });
    ROOT.add(new THREE.Mesh(wfGeo, wfMat));

    // ── LATITUDE / LONGITUDE LINES ───────────
    function buildLatLon() {
        const mat = new THREE.LineBasicMaterial({ color: HEX.sage, transparent: true, opacity: 0.18 });
        const R   = 2.02;
        const grp = new THREE.Group();

        // Latitudes
        [-60, -30, 0, 30, 60].forEach(latDeg => {
            const lat = latDeg * Math.PI / 180;
            const ry  = R * Math.sin(lat);
            const rr  = R * Math.cos(lat);
            const pts = [];
            for (let i = 0; i <= 128; i++) {
                const a = (i / 128) * Math.PI * 2;
                pts.push(new THREE.Vector3(rr * Math.cos(a), ry, rr * Math.sin(a)));
            }
            grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
        });

        // Longitudes
        for (let l = 0; l < 180; l += 30) {
            const lon = l * Math.PI / 180;
            const pts = [];
            for (let i = 0; i <= 128; i++) {
                const lat = (i / 128) * Math.PI - Math.PI / 2;
                pts.push(new THREE.Vector3(
                    R * Math.cos(lat) * Math.cos(lon),
                    R * Math.sin(lat),
                    R * Math.cos(lat) * Math.sin(lon)
                ));
            }
            grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
        }
        return grp;
    }
    ROOT.add(buildLatLon());

    // ── EQUATOR HIGHLIGHT ────────────────────
    {
        const pts = [];
        for (let i = 0; i <= 256; i++) {
            const a = (i / 256) * Math.PI * 2;
            pts.push(new THREE.Vector3(2.025 * Math.cos(a), 0, 2.025 * Math.sin(a)));
        }
        ROOT.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pts),
            new THREE.LineBasicMaterial({ color: HEX.sage, transparent: true, opacity: 0.45 })
        ));
    }

    // ── ORBIT RINGS (3 tilted rings) ─────────
    function makeOrbitRing(radius, tiltX, tiltZ, opacity, dashed) {
        const pts = [];
        for (let i = 0; i <= 256; i++) {
            const a = (i / 256) * Math.PI * 2;
            pts.push(new THREE.Vector3(radius * Math.cos(a), 0, radius * Math.sin(a)));
        }
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const mat = new THREE.LineBasicMaterial({ color: HEX.sage, transparent: true, opacity });
        const ring = new THREE.Line(geo, mat);
        ring.rotation.x = tiltX;
        ring.rotation.z = tiltZ;
        return ring;
    }

    const orbitA = makeOrbitRing(2.8,  0.4,  0.2, 0.20);
    const orbitB = makeOrbitRing(3.15, -0.6, 0.4, 0.14);
    const orbitC = makeOrbitRing(2.55,  1.1, -0.3, 0.10);
    ORBITS.add(orbitA, orbitB, orbitC);

    // ── AMBIENT PARTICLES ────────────────────
    {
        const N   = 700;
        const pos = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi   = Math.acos(2 * Math.random() - 1);
            const r     = 2.4 + Math.random() * 2.2;
            pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
            color: HEX.sage, size: 0.018, transparent: true, opacity: 0.35,
        })));
    }

    // ── CATEGORY NODE ICON BUILDER ───────────
    function makeIcon(cfg) {
        // cfg: { emoji, bg, ring, icon }
        const S   = 128;
        const cvs = document.createElement('canvas');
        cvs.width = cvs.height = S;
        const c   = cvs.getContext('2d');
        const cx  = S / 2, cy = S / 2, R = S / 2 - 4;

        // Shadow
        c.shadowColor = 'rgba(0,30,10,0.55)';
        c.shadowBlur  = 12;

        // Background gradient — rich forest center to deep edge
        const bg = c.createRadialGradient(cx - 6, cy - 6, 4, cx, cy, R);
        bg.addColorStop(0, cfg.bg0 || '#005C30');
        bg.addColorStop(1, cfg.bg1 || '#001F0E');
        c.fillStyle = bg;
        c.beginPath();
        c.arc(cx, cy, R, 0, Math.PI * 2);
        c.fill();

        c.shadowBlur = 0;

        // Gloss shine (top-left arc)
        const shine = c.createRadialGradient(cx - 14, cy - 18, 2, cx - 6, cy - 10, R * 0.8);
        shine.addColorStop(0, 'rgba(255,255,255,0.18)');
        shine.addColorStop(0.5, 'rgba(255,255,255,0.04)');
        shine.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = shine;
        c.beginPath();
        c.arc(cx, cy, R, 0, Math.PI * 2);
        c.fill();

        // Outer sage ring
        c.strokeStyle = 'rgba(196,218,132,0.90)';
        c.lineWidth = 3;
        c.beginPath();
        c.arc(cx, cy, R - 1, 0, Math.PI * 2);
        c.stroke();

        // Inner faint ring
        c.strokeStyle = 'rgba(196,218,132,0.22)';
        c.lineWidth = 1.2;
        c.beginPath();
        c.arc(cx, cy, R - 9, 0, Math.PI * 2);
        c.stroke();

        // Draw the icon (SVG-path style with canvas)
        c.strokeStyle = '#FFFFFF';
        c.fillStyle   = '#FFFFFF';
        c.lineWidth   = 3.5;
        c.lineCap     = 'round';
        c.lineJoin    = 'round';

        cfg.draw(c, cx, cy);

        const tex = new THREE.CanvasTexture(cvs);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        return tex;
    }

    // ── CATEGORY DEFINITIONS ─────────────────
    const CATEGORIES = [
        {
            label: '🌿 Organic',
            pos:   [1.25,  0.90,  1.10],
            phase: 0.0,
            draw(c, cx, cy) {
                // Beautiful leaf with veins
                c.beginPath();
                c.moveTo(cx, cy - 22);
                c.bezierCurveTo(cx + 22, cy - 18, cx + 22, cy + 12, cx, cy + 24);
                c.bezierCurveTo(cx - 22, cy + 12, cx - 22, cy - 18, cx, cy - 22);
                c.stroke();
                // midrib
                c.beginPath();
                c.moveTo(cx, cy - 22); c.lineTo(cx, cy + 24); c.stroke();
                // veins
                [[cx, cy - 6, cx - 16, cy - 14], [cx, cy + 2, cx - 16, cy - 4],
                 [cx, cy - 6, cx + 16, cy - 14], [cx, cy + 2, cx + 16, cy - 4]].forEach(([x1,y1,x2,y2]) => {
                    c.beginPath(); c.moveTo(x1,y1); c.quadraticCurveTo((x1+x2)/2, (y1+y2)/2-4, x2, y2); c.stroke();
                });
            }
        },
        {
            label: '🥑 Keto-Friendly',
            pos:   [-1.30,  0.65,  1.20],
            phase: 0.65,
            draw(c, cx, cy) {
                // Avocado pear shape
                c.beginPath();
                c.moveTo(cx, cy - 24);
                c.bezierCurveTo(cx + 18, cy - 20, cx + 20, cy + 4, cx + 12, cy + 18);
                c.bezierCurveTo(cx + 5,  cy + 26, cx - 5, cy + 26, cx - 12, cy + 18);
                c.bezierCurveTo(cx - 20, cy + 4, cx - 18, cy - 20, cx, cy - 24);
                c.stroke();
                // inner flesh ring
                c.strokeStyle = 'rgba(196,218,132,0.7)';
                c.lineWidth = 2;
                c.beginPath();
                c.ellipse(cx, cy + 4, 10, 13, 0, 0, Math.PI * 2);
                c.stroke();
                c.strokeStyle = '#FFFFFF'; c.lineWidth = 3.5;
                // pit
                c.fillStyle = '#FFFFFF';
                c.beginPath();
                c.arc(cx, cy + 7, 5.5, 0, Math.PI * 2);
                c.fill();
                // stem
                c.beginPath(); c.moveTo(cx, cy - 24); c.lineTo(cx, cy - 30); c.stroke();
            }
        },
        {
            label: '🌾 Gluten-Free',
            pos:   [0.40,  1.50, -0.55],
            phase: 1.3,
            draw(c, cx, cy) {
                // Wheat stalk
                c.beginPath(); c.moveTo(cx, cy + 26); c.lineTo(cx, cy - 14); c.stroke();
                // grain pods
                const grains = [[cx-11, cy-2, -0.45], [cx+11, cy-8, 0.45], [cx-11, cy-14, -0.45]];
                grains.forEach(([x, y, rot]) => {
                    c.save(); c.translate(x, y); c.rotate(rot);
                    c.beginPath(); c.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
                    c.stroke(); c.restore();
                });
                // GF cross badge (bottom right)
                c.strokeStyle = '#C4DA84'; c.lineWidth = 2.5;
                c.beginPath(); c.moveTo(cx + 10, cy + 12); c.lineTo(cx + 22, cy + 24); c.stroke();
                c.beginPath(); c.moveTo(cx + 22, cy + 12); c.lineTo(cx + 10, cy + 24); c.stroke();
                c.strokeStyle = '#FFFFFF'; c.lineWidth = 3.5;
            }
        },
        {
            label: '🥗 Low-Carb Options',
            pos:   [-0.90, -0.95,  1.25],
            phase: 1.95,
            draw(c, cx, cy) {
                // Bowl
                c.beginPath();
                c.moveTo(cx - 22, cy + 2);
                c.bezierCurveTo(cx - 22, cy + 28, cx + 22, cy + 28, cx + 22, cy + 2);
                c.stroke();
                // rim
                c.beginPath(); c.moveTo(cx - 24, cy + 2); c.lineTo(cx + 24, cy + 2); c.stroke();
                // leafy greens inside
                c.strokeStyle = 'rgba(196,218,132,0.8)'; c.lineWidth = 2.5;
                c.beginPath(); c.ellipse(cx - 8, cy - 6, 9, 5, -0.5, 0, Math.PI * 2); c.stroke();
                c.beginPath(); c.ellipse(cx + 8, cy - 8, 9, 5, 0.5, 0, Math.PI * 2); c.stroke();
                c.strokeStyle = '#FFFFFF'; c.lineWidth = 3.5;
                // centre veg strip
                c.beginPath(); c.ellipse(cx, cy - 4, 6, 10, 0, 0, Math.PI * 2); c.stroke();
                // fork
                c.beginPath(); c.moveTo(cx + 18, cy - 20); c.lineTo(cx + 18, cy + 2); c.stroke();
                c.beginPath(); c.moveTo(cx + 15, cy - 20); c.lineTo(cx + 15, cy - 12); c.stroke();
                c.beginPath(); c.moveTo(cx + 21, cy - 20); c.lineTo(cx + 21, cy - 12); c.stroke();
            }
        },
        {
            label: '🍫 Chocolate & Treats',
            pos:   [1.10, -1.20, -0.80],
            phase: 2.6,
            draw(c, cx, cy) {
                // Chocolate bar
                c.beginPath();
                c.roundRect(cx - 20, cy - 18, 40, 36, 6);
                c.stroke();
                // segments grid
                c.lineWidth = 2;
                c.beginPath(); c.moveTo(cx, cy - 18); c.lineTo(cx, cy + 18); c.stroke();
                c.beginPath(); c.moveTo(cx - 20, cy - 4); c.lineTo(cx + 20, cy - 4); c.stroke();
                c.beginPath(); c.moveTo(cx - 20, cy + 9); c.lineTo(cx + 20, cy + 9); c.stroke();
                c.lineWidth = 3.5;
                // cocoa bean accent
                c.fillStyle = '#C4DA84';
                c.beginPath();
                c.ellipse(cx - 10, cy - 11, 4, 5.5, 0.3, 0, Math.PI * 2);
                c.fill();
                c.beginPath();
                c.ellipse(cx + 10, cy - 11, 4, 5.5, -0.3, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = '#FFFFFF';
                // melting drip
                c.beginPath();
                c.moveTo(cx - 6, cy + 18);
                c.bezierCurveTo(cx - 6, cy + 24, cx - 2, cy + 28, cx - 1, cy + 28);
                c.bezierCurveTo(cx, cy + 28, cx + 4, cy + 24, cx + 4, cy + 18);
                c.fill();
            }
        },
        {
            label: '🥜 Healthy Snacks',
            pos:   [-1.35,  1.05, -0.50],
            phase: 3.25,
            draw(c, cx, cy) {
                // Peanut double-lobe
                c.beginPath();
                c.ellipse(cx - 11, cy - 2, 10, 14, 0, 0, Math.PI * 2);
                c.stroke();
                c.beginPath();
                c.ellipse(cx + 11, cy - 2, 10, 14, 0, 0, Math.PI * 2);
                c.stroke();
                // waist
                c.lineWidth = 2.5;
                c.beginPath(); c.moveTo(cx - 3, cy - 8); c.lineTo(cx + 3, cy - 8); c.stroke();
                c.beginPath(); c.moveTo(cx - 3, cy + 4); c.lineTo(cx + 3, cy + 4); c.stroke();
                c.lineWidth = 3.5;
                // texture marks
                c.strokeStyle = 'rgba(196,218,132,0.75)'; c.lineWidth = 2;
                [[-13,-6],[-9,4],[11,-6],[15,4]].forEach(([dx,dy]) => {
                    c.beginPath(); c.moveTo(cx+dx-3, cy+dy); c.lineTo(cx+dx+3, cy+dy); c.stroke();
                });
                c.strokeStyle = '#FFFFFF'; c.lineWidth = 3.5;
            }
        },
        {
            label: '❤️ Heart Health',
            pos:   [0.20,  0.30,  1.95],
            phase: 3.9,
            draw(c, cx, cy) {
                c.beginPath();
                c.moveTo(cx, cy + 18);
                c.bezierCurveTo(cx - 22, cy + 6, cx - 24, cy - 10, cx - 12, cy - 16);
                c.bezierCurveTo(cx - 5, cy - 20, cx, cy - 12, cx, cy - 12);
                c.bezierCurveTo(cx, cy - 12, cx + 5, cy - 20, cx + 12, cy - 16);
                c.bezierCurveTo(cx + 24, cy - 10, cx + 22, cy + 6, cx, cy + 18);
                c.fill();
                // EKG line through
                c.strokeStyle = '#003D1F'; c.lineWidth = 2.5;
                c.beginPath();
                c.moveTo(cx - 14, cy + 4);
                c.lineTo(cx - 6,  cy + 4);
                c.lineTo(cx - 2,  cy - 6);
                c.lineTo(cx + 2,  cy + 12);
                c.lineTo(cx + 6,  cy - 2);
                c.lineTo(cx + 10, cy + 4);
                c.lineTo(cx + 16, cy + 4);
                c.stroke();
                c.strokeStyle = '#FFFFFF'; c.lineWidth = 3.5;
            }
        },
        {
            label: '💊 Supplements',
            pos:   [-0.40, -1.50, -0.90],
            phase: 4.55,
            draw(c, cx, cy) {
                // Capsule pill
                c.save(); c.translate(cx, cy); c.rotate(-0.4);
                c.beginPath();
                c.moveTo(-16, -8); c.arc(-8, 0, 8, Math.PI * 1.5, Math.PI * 0.5, true);
                c.lineTo(8, 8);   c.arc(8, 0, 8, Math.PI * 0.5, Math.PI * 1.5, true);
                c.closePath(); c.stroke();
                c.beginPath(); c.moveTo(-16, 0); c.lineTo(16, 0); c.stroke();
                // left half fill
                c.fillStyle = 'rgba(196,218,132,0.6)';
                c.beginPath();
                c.moveTo(-16, 0); c.arc(-8, 0, 8, Math.PI * 1.5, Math.PI * 0.5, true);
                c.lineTo(-16, 0);
                c.fill(); c.restore();
                // dots
                c.fillStyle = '#FFFFFF';
                [[cx + 10, cy - 18],[cx + 18, cy - 10],[cx + 20, cy + 2]].forEach(([x,y]) => {
                    c.beginPath(); c.arc(x, y, 2.5, 0, Math.PI * 2); c.fill();
                });
            }
        },
        {
            label: '🌱 Plant-Based',
            pos:   [-0.50, -0.40, -1.95],
            phase: 5.2,
            draw(c, cx, cy) {
                // Potted sprout
                c.beginPath(); c.moveTo(cx, cy + 10); c.lineTo(cx, cy - 12); c.stroke();
                // left leaf
                c.beginPath();
                c.moveTo(cx, cy - 4);
                c.bezierCurveTo(cx - 6, cy - 16, cx - 18, cy - 16, cx - 18, cy - 8);
                c.bezierCurveTo(cx - 18, cy, cx - 6, cy + 2, cx, cy - 4);
                c.stroke();
                // right leaf
                c.beginPath();
                c.moveTo(cx, cy - 10);
                c.bezierCurveTo(cx + 6, cy - 22, cx + 18, cy - 22, cx + 18, cy - 14);
                c.bezierCurveTo(cx + 18, cy - 6, cx + 6, cy - 4, cx, cy - 10);
                c.stroke();
                // pot
                c.beginPath();
                c.moveTo(cx - 16, cy + 10); c.lineTo(cx + 16, cy + 10);
                c.lineTo(cx + 12, cy + 26); c.lineTo(cx - 12, cy + 26); c.closePath();
                c.stroke();
                c.strokeStyle = 'rgba(196,218,132,0.6)'; c.lineWidth = 2;
                c.beginPath(); c.moveTo(cx - 15, cy + 14); c.lineTo(cx + 15, cy + 14); c.stroke();
                c.strokeStyle = '#FFFFFF'; c.lineWidth = 3.5;
            }
        },
        {
            label: '⚡ Vitality Boost',
            pos:   [1.60, -0.50,  0.90],
            phase: 5.85,
            draw(c, cx, cy) {
                // Lightning bolt
                c.beginPath();
                c.moveTo(cx + 8, cy - 24);
                c.lineTo(cx - 4, cy - 2);
                c.lineTo(cx + 6, cy - 2);
                c.lineTo(cx - 8, cy + 24);
                c.lineTo(cx + 4, cy + 2);
                c.lineTo(cx - 6, cy + 2);
                c.closePath();
                c.fill();
                // glow ring
                c.strokeStyle = 'rgba(196,218,132,0.55)'; c.lineWidth = 2;
                c.beginPath(); c.arc(cx, cy, 28, 0, Math.PI * 2); c.stroke();
                c.strokeStyle = '#FFFFFF'; c.lineWidth = 3.5;
            }
        },
        {
            label: '🛡 Wellness',
            pos:   [-1.50,  0.20,  1.10],
            phase: 6.5,
            draw(c, cx, cy) {
                // Shield
                c.beginPath();
                c.moveTo(cx, cy - 24);
                c.lineTo(cx + 20, cy - 14);
                c.lineTo(cx + 20, cy + 4);
                c.quadraticCurveTo(cx + 20, cy + 20, cx, cy + 28);
                c.quadraticCurveTo(cx - 20, cy + 20, cx - 20, cy + 4);
                c.lineTo(cx - 20, cy - 14);
                c.closePath();
                c.stroke();
                // inner checkmark
                c.lineWidth = 3;
                c.beginPath();
                c.moveTo(cx - 10, cy + 4);
                c.lineTo(cx - 2,  cy + 13);
                c.lineTo(cx + 12, cy - 8);
                c.stroke();
                c.lineWidth = 3.5;
                // sage fill hint
                c.fillStyle = 'rgba(196,218,132,0.12)';
                c.beginPath();
                c.moveTo(cx, cy - 24);
                c.lineTo(cx + 20, cy - 14); c.lineTo(cx + 20, cy + 4);
                c.quadraticCurveTo(cx + 20, cy + 20, cx, cy + 28);
                c.quadraticCurveTo(cx - 20, cy + 20, cx - 20, cy + 4);
                c.lineTo(cx - 20, cy - 14);
                c.closePath();
                c.fill();
                c.fillStyle = '#FFFFFF';
            }
        },
        {
            label: '🍃 Natural Products',
            pos:   [0.80,  1.50,  0.90],
            phase: 7.15,
            draw(c, cx, cy) {
                // Two overlapping leaves
                c.save(); c.translate(cx, cy);
                c.rotate(-0.3);
                c.beginPath();
                c.moveTo(0, -22);
                c.bezierCurveTo(-16, -18, -18, 8, 0, 20);
                c.bezierCurveTo(2, 10, 2, -10, 0, -22);
                c.stroke();
                c.beginPath();
                c.moveTo(0, -22); c.lineTo(0, 20); c.stroke();
                c.restore();
                c.save(); c.translate(cx, cy); c.rotate(0.3);
                c.beginPath();
                c.moveTo(0, -22);
                c.bezierCurveTo(16, -18, 18, 8, 0, 20);
                c.bezierCurveTo(-2, 10, -2, -10, 0, -22);
                c.stroke();
                c.beginPath();
                c.moveTo(0, -22); c.lineTo(0, 20); c.stroke();
                c.restore();
                // stem
                c.beginPath(); c.moveTo(cx, cy + 20); c.lineTo(cx, cy + 28); c.stroke();
            }
        },
    ];

    // ── Build nodes ──────────────────────────
    const nodeSprites = [];

    CATEGORIES.forEach((cat, i) => {
        const pos = new THREE.Vector3(...cat.pos);

        // Sprite
        const tex    = makeIcon(cat);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: tex, transparent: true, opacity: 1.0,
        }));
        sprite.position.copy(pos);
        sprite.scale.set(0.52, 0.52, 0.52);
        sprite.userData.label = cat.label;
        ROOT.add(sprite);
        nodeSprites.push(sprite);

        // Pulse ring
        const rGeo = new THREE.RingGeometry(0.20, 0.265, 40);
        const rMat = new THREE.MeshBasicMaterial({ color: HEX.sage, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
        const ring  = new THREE.Mesh(rGeo, rMat);
        ring.position.copy(pos);
        ring.lookAt(0, 0, 0);
        ROOT.add(ring);

        // Outer halo
        const hGeo = new THREE.RingGeometry(0.31, 0.37, 40);
        const hMat = new THREE.MeshBasicMaterial({ color: HEX.sage, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
        const halo  = new THREE.Mesh(hGeo, hMat);
        halo.position.copy(pos);
        halo.lookAt(0, 0, 0);
        ROOT.add(halo);

        // Connection line to surface
        {
            const dir    = pos.clone().normalize();
            const start  = dir.clone().multiplyScalar(2.02);
            const end    = pos.clone();
            const lGeo   = new THREE.BufferGeometry().setFromPoints([start, end]);
            const lMat   = new THREE.LineBasicMaterial({ color: HEX.sage, transparent: true, opacity: 0.3 });
            ROOT.add(new THREE.Line(lGeo, lMat));
        }

        cat._ring  = ring;
        cat._halo  = halo;
        cat._phase = cat.phase;
    });

    // ── LIGHTS ───────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
    keyLight.position.set(6, 6, 8);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(HEX.sage, 0.35);
    fillLight.position.set(-6, -4, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(HEX.sage, 0.25);
    rimLight.position.set(0, 8, -6);
    scene.add(rimLight);

    // ── RAYCASTER / TOOLTIP ──────────────────
    const raycaster = new THREE.Raycaster();
    const mouse2d   = new THREE.Vector2();

    renderer.domElement.addEventListener('mousemove', e => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse2d.x  =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
        mouse2d.y  = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse2d, camera);
        const hits = raycaster.intersectObjects(nodeSprites);
        if (hits.length) {
            tooltip.textContent   = hits[0].object.userData.label;
            tooltip.style.left    = (e.clientX + 18) + 'px';
            tooltip.style.top     = (e.clientY - 14) + 'px';
            tooltip.style.opacity = '1';
        } else {
            tooltip.style.opacity = '0';
        }
    });
    renderer.domElement.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });

    // ── DRAG INTERACTION ─────────────────────
    let dragging = false;
    let px = 0, py = 0;
    let vx = 0, vy = 0;
    const AUTO = 0.0004;

    const dn = (x, y) => { dragging = true; px = x; py = y; };
    const mv = (x, y) => {
        if (!dragging) return;
        const dx = x - px, dy = y - py;
        vx = dx * 0.0004; vy = dy * 0.0004;
        ROOT.rotation.y += dx * 0.004;
        ROOT.rotation.x += dy * 0.004;
        px = x; py = y;
    };
    const up = () => { dragging = false; };

    container.addEventListener('mousedown',  e => dn(e.clientX, e.clientY));
    container.addEventListener('mousemove',  e => mv(e.clientX, e.clientY));
    container.addEventListener('mouseup',    up);
    container.addEventListener('mouseleave', up);
    container.addEventListener('touchstart', e => dn(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    container.addEventListener('touchmove',  e => { e.preventDefault(); mv(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    container.addEventListener('touchend',   up);

    // ── ANIMATION LOOP ───────────────────────
    function animate() {
        requestAnimationFrame(animate);
        const t = Date.now() * 0.001;

        if (!dragging) {
            ROOT.rotation.y += AUTO + vx;
            ROOT.rotation.x += vy;
            vx *= 0.93; vy *= 0.93;
        }

        // Orbit rings counter-rotate (stay static in world space)
        ORBITS.rotation.y -= AUTO * 0.3;

        // Node pulse
        CATEGORIES.forEach(cat => {
            const s = 1 + Math.sin(t * 1.6 + cat._phase) * 0.12;
            if (cat._ring) cat._ring.scale.set(s, s, s);
            if (cat._halo) {
                const hs = 1 + Math.sin(t * 1.6 + cat._phase + 0.5) * 0.18;
                cat._halo.scale.set(hs, hs, hs);
                cat._halo.material.opacity = 0.08 + Math.abs(Math.sin(t + cat._phase)) * 0.14;
            }
        });

        renderer.render(scene, camera);
    }
    animate();

    // ── RESIZE ──────────────────────────────
    window.addEventListener('resize', () => {
        const w = container.offsetWidth, h = container.offsetHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }, { passive: true });

})();
JSEOF
