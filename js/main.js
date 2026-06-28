cat > /mnt/user-data/outputs/drdammie/js/main.js << 'EOF'
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
// CONSTELLATION GLOBE — DR. DAMMIE'S EDITION
// ============================================
(function () {
    const container = document.getElementById('globe-container');
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;cursor:grab;';
    container.style.position = 'relative';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W, H, cx, cy, R;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = container.offsetWidth;
        H = container.offsetHeight;
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width  = W + 'px';
        canvas.style.height = H + 'px';
        ctx.scale(dpr, dpr);
        cx = W / 2;
        cy = H / 2;
        R  = Math.min(W, H) * 0.42;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // ── Rotation state ──
    let rotY = 0.3, rotX = 0.15;
    let velX = 0, velY = 0;
    let dragging = false, auto = true;
    let ds = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', e => {
        dragging = true; auto = false;
        ds = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', e => {
        if (!dragging) return;
        const dx = e.clientX - ds.x, dy = e.clientY - ds.y;
        velY = dx * 0.005; velX = dy * 0.005;
        rotY += velY;
        rotX = Math.max(-0.55, Math.min(0.55, rotX + velX));
        ds = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => {
        dragging = false;
        canvas.style.cursor = 'grab';
        setTimeout(() => auto = true, 2200);
    });
    canvas.addEventListener('touchstart', e => {
        dragging = true; auto = false;
        ds = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        const dx = e.touches[0].clientX - ds.x, dy = e.touches[0].clientY - ds.y;
        velY = dx * 0.005; velX = dy * 0.005;
        rotY += velY;
        rotX = Math.max(-0.55, Math.min(0.55, rotX + velX));
        ds = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: false });
    canvas.addEventListener('touchend', () => {
        dragging = false;
        setTimeout(() => auto = true, 2200);
    });

    // ── Projection ──
    function project(latD, lonD) {
        const lat = latD * Math.PI / 180;
        const lon = lonD * Math.PI / 180 + rotY;
        let x = Math.cos(lat) * Math.cos(lon);
        let y = Math.sin(lat);
        let z = Math.cos(lat) * Math.sin(lon);
        const cX = Math.cos(rotX), sX = Math.sin(rotX);
        const y2 = y * cX - z * sX;
        const z2 = y * sX + z * cX;
        return { x: cx + x * R, y: cy - y2 * R, z: z2, v: z2 > -0.05 };
    }

    // ── Continental outline coordinates ──
    const CONTS = [
        // North America
        [[70,-140],[68,-110],[62,-90],[58,-94],[48,-88],[44,-66],[42,-70],[38,-76],[30,-81],[24,-82],[22,-90],[16,-88],[12,-84],[8,-77],[18,-67],[20,-74],[24,-90],[22,-106],[20,-105],[16,-96],[14,-88],[22,-90],[24,-110],[28,-112],[30,-116],[32,-117],[38,-122],[44,-124],[50,-125],[56,-130],[60,-146],[60,-152],[58,-158],[64,-166],[68,-166],[70,-162],[68,-150],[70,-140]],
        // Greenland
        [[76,-70],[80,-52],[84,-44],[82,-28],[76,-22],[70,-26],[66,-36],[66,-46],[70,-64],[76,-70]],
        // South America
        [[12,-72],[8,-62],[4,-52],[0,-50],[-4,-44],[-8,-36],[-14,-38],[-20,-40],[-24,-46],[-30,-50],[-36,-54],[-42,-64],[-50,-70],[-56,-68],[-52,-64],[-46,-65],[-38,-58],[-30,-50],[-22,-42],[-14,-38],[-6,-36],[0,-44],[6,-58],[10,-62],[12,-72]],
        // Europe
        [[70,28],[66,14],[60,5],[56,8],[52,4],[48,0],[44,-2],[44,6],[42,8],[38,0],[36,-6],[36,8],[38,16],[40,18],[40,22],[36,28],[36,34],[40,30],[44,28],[46,30],[48,22],[52,14],[56,10],[60,6],[64,10],[68,16],[70,22],[70,28]],
        // Africa
        [[36,10],[28,12],[20,16],[12,12],[8,4],[0,6],[-4,10],[-10,14],[-18,20],[-28,18],[-34,22],[-34,26],[-28,34],[-22,36],[-14,38],[-4,40],[4,44],[8,48],[12,52],[12,42],[8,38],[4,36],[0,34],[8,30],[14,32],[20,36],[28,32],[34,30],[36,10]],
        // Asia
        [[70,30],[64,40],[60,44],[56,48],[52,52],[48,58],[44,58],[36,62],[28,66],[20,70],[16,74],[8,78],[8,80],[16,82],[24,90],[28,98],[24,100],[20,100],[16,104],[12,108],[4,108],[0,110],[4,114],[8,116],[16,120],[20,116],[24,116],[28,120],[36,120],[40,122],[44,128],[50,140],[56,140],[60,150],[64,148],[60,132],[56,130],[52,132],[48,140],[44,142],[44,148],[48,140],[52,140],[56,138],[60,140],[64,148],[68,150],[70,154],[70,140],[66,134],[60,128],[56,124],[48,116],[40,106],[36,102],[28,96],[20,88],[12,80],[8,78],[4,76],[4,70],[8,66],[12,62],[16,56],[20,58],[24,56],[28,50],[32,46],[36,44],[40,42],[44,40],[52,46],[56,48],[60,44],[64,40],[68,38],[70,30]],
        // Australia
        [[-16,136],[-12,130],[-18,122],[-26,114],[-32,116],[-36,120],[-38,128],[-36,136],[-34,138],[-36,140],[-40,148],[-36,152],[-30,154],[-22,150],[-16,144],[-12,136],[-16,136]],
        // Japan
        [[40,140],[38,140],[36,136],[34,132],[34,130],[36,130],[38,134],[40,138],[40,140]],
        // UK
        [[50,-6],[52,-4],[56,0],[58,-4],[56,-6],[52,-4],[50,-6]],
        // New Zealand
        [[-34,172],[-38,176],[-44,170],[-46,170],[-44,172],[-38,174],[-34,172]],
    ];

    // ── Scatter dots — surface dots on globe (constellation feel) ──
    // Pre-generate: a mix of dense clusters and sparse fills
    const DOTS = [];
    (function () {
        let rng = 137;
        const rand = () => { rng = (rng * 1664525 + 1013904223) & 0xFFFFFFFF; return (rng >>> 0) / 0xFFFFFFFF; };

        // Dr. Dammie's palette dot colors
        const COLS = [
            'rgba(196,218,132,IDX)',   // sage — main
            'rgba(196,218,132,IDX)',   // sage — repeated for weight
            'rgba(0,92,46,IDX)',       // forest mid
            'rgba(216,233,168,IDX)',   // sage light
            'rgba(143,181,90,IDX)',    // mid green
            'rgba(255,255,255,IDX)',   // white accent
        ];

        for (let i = 0; i < 480; i++) {
            // Fibonacci sphere distribution for even spread
            const theta = Math.acos(2 * rand() - 1);
            const phi   = rand() * Math.PI * 2;
            const latD  = (Math.PI / 2 - theta) * 180 / Math.PI;
            const lonD  = phi * 180 / Math.PI - 180;
            const col   = COLS[Math.floor(rand() * COLS.length)];
            const size  = 0.9 + rand() * 1.6;
            const alpha = 0.25 + rand() * 0.55;
            const shape = rand() > 0.72 ? 'sq' : 'ci'; // mix squares and circles like reference
            DOTS.push({ lat: latD, lon: lonD, col: col.replace('IDX', alpha.toFixed(2)), size, shape });
        }
    })();

    // ── Planet nodes ──
    const NODES = [
        { lat: 4,   lon: 20,   label: '🌿 Organic',      r: 22, fill: '#C4DA84', ring: '#8FB55A', glow: 'rgba(196,218,132,0.35)' },
        { lat: 22,  lon: -102, label: '🥑 Keto',          r: 18, fill: '#003D1F', ring: '#C4DA84', glow: 'rgba(196,218,132,0.3)'  },
        { lat: 51,  lon: 10,   label: '🌾 Gluten-Free',   r: 20, fill: '#D8E9A8', ring: '#004723', glow: 'rgba(216,233,168,0.35)' },
        { lat: -24, lon: 133,  label: '🥗 Low-Carb',      r: 16, fill: '#005C2E', ring: '#C4DA84', glow: 'rgba(0,92,46,0.4)'      },
        { lat: 34,  lon: 108,  label: '🍵 Wellness',      r: 22, fill: '#C4DA84', ring: '#003D1F', glow: 'rgba(196,218,132,0.4)'  },
        { lat: -10, lon: -54,  label: '🍫 Chocolate',     r: 17, fill: '#004723', ring: '#D8E9A8', glow: 'rgba(0,71,35,0.45)'     },
        { lat: 55,  lon: 78,   label: '🥜 Snacks',        r: 19, fill: '#8FB55A', ring: '#003D1F', glow: 'rgba(143,181,90,0.35)'  },
        { lat: 24,  lon: 70,   label: '💊 Supplements',   r: 15, fill: '#D8E9A8', ring: '#005C2E', glow: 'rgba(216,233,168,0.3)'  },
        { lat: -34, lon: 25,   label: '❤️ Heart Health',  r: 20, fill: '#003D1F', ring: '#C4DA84', glow: 'rgba(196,218,132,0.35)' },
        { lat: 15,  lon: 44,   label: '🌱 Plant-Based',   r: 14, fill: '#C4DA84', ring: '#004723', glow: 'rgba(196,218,132,0.3)'  },
        { lat: 60,  lon: -90,  label: '⚡ Vitality',      r: 18, fill: '#005C2E', ring: '#D8E9A8', glow: 'rgba(0,92,46,0.4)'      },
    ];

    // ── Tooltip ──
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
        position:fixed;z-index:500;pointer-events:none;
        background:rgba(0,25,12,0.94);border:1px solid rgba(196,218,132,0.5);
        border-radius:10px;padding:8px 15px;
        font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;
        color:#C4DA84;backdrop-filter:blur(14px);
        opacity:0;transition:opacity 0.18s;white-space:nowrap;
        box-shadow:0 4px 22px rgba(0,71,35,0.4);
    `;
    document.body.appendChild(tooltip);

    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        let found = null;
        NODES.forEach(n => {
            if (!n.p || !n.p.v) return;
            const dx = mx - n.p.x, dy = my - n.p.y;
            if (Math.sqrt(dx * dx + dy * dy) < n.r + 8) found = n;
        });
        if (found) {
            tooltip.textContent = found.label;
            const tx = Math.min(e.clientX + 16, window.innerWidth - 160);
            tooltip.style.left = tx + 'px';
            tooltip.style.top  = (e.clientY - 14) + 'px';
            tooltip.style.opacity = '1';
        } else {
            tooltip.style.opacity = '0';
        }
    });
    canvas.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });

    // ── Draw the dark sphere background ──
    function drawSphere() {
        // Deep dark sphere fill — like the reference image
        const g = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.22, R * 0.05, cx, cy, R);
        g.addColorStop(0,   'rgba(0, 28, 14, 0.96)');
        g.addColorStop(0.5, 'rgba(0, 20, 10, 0.97)');
        g.addColorStop(1,   'rgba(0, 10, 5,  0.98)');
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        // Soft green rim glow
        const rim = ctx.createRadialGradient(cx, cy, R * 0.75, cx, cy, R * 1.05);
        rim.addColorStop(0,   'transparent');
        rim.addColorStop(0.7, 'rgba(0, 71, 35, 0.08)');
        rim.addColorStop(1,   'rgba(196,218,132, 0.12)');
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.05, 0, Math.PI * 2);
        ctx.fillStyle = rim;
        ctx.fill();

        // Edge ring
        const edgeG = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
        edgeG.addColorStop(0,   'rgba(196,218,132, 0.22)');
        edgeG.addColorStop(0.5, 'rgba(0, 71, 35,   0.15)');
        edgeG.addColorStop(1,   'rgba(0, 20, 10,   0.20)');
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.strokeStyle = edgeG;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Specular top-left highlight
        const spec = ctx.createRadialGradient(cx - R * 0.30, cy - R * 0.28, 0, cx - R * 0.26, cy - R * 0.22, R * 0.42);
        spec.addColorStop(0,   'rgba(196,218,132, 0.10)');
        spec.addColorStop(0.5, 'rgba(196,218,132, 0.03)');
        spec.addColorStop(1,   'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = spec;
        ctx.fill();
    }

    // ── Clip to sphere ──
    function clipToSphere() {
        ctx.beginPath();
        ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2);
        ctx.clip();
    }

    // ── Draw lat/lon grid — very faint ──
    function drawGrid() {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 71, 35, 0.18)';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([3, 8]);
        for (let lat = -80; lat <= 80; lat += 20) {
            ctx.beginPath();
            for (let lon = -180; lon <= 180; lon += 3) {
                const p = project(lat, lon);
                if (!p.v) continue;
                lon === -180 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        }
        for (let lon = -180; lon < 180; lon += 30) {
            ctx.beginPath();
            for (let lat = -90; lat <= 90; lat += 3) {
                const p = project(lat, lon);
                if (!p.v) continue;
                lat === -90 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        }
        ctx.restore();
    }

    // ── Draw continent outlines ──
    function drawConts() {
        ctx.save();
        ctx.strokeStyle = 'rgba(196, 218, 132, 0.30)';
        ctx.lineWidth = 1.0;
        ctx.lineJoin = 'round';
        ctx.lineCap  = 'round';
        ctx.setLineDash([]);
        CONTS.forEach(shape => {
            ctx.beginPath();
            let lv = false;
            shape.forEach(([lat, lon]) => {
                const p = project(lat, lon);
                if (p.v) { !lv ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); lv = true; }
                else lv = false;
            });
            ctx.stroke();
        });
        ctx.restore();
    }

    // ── Draw scatter dots (constellation feel) ──
    function drawDots() {
        ctx.save();
        DOTS.forEach(d => {
            const p = project(d.lat, d.lon);
            if (!p.v) return;
            // Fade dots near edge
            const fadeAlpha = Math.min(1, (p.z + 0.05) * 3);
            ctx.globalAlpha = fadeAlpha;
            ctx.fillStyle = d.col;
            if (d.shape === 'sq') {
                const s = d.size * 1.1;
                ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, d.size * 0.75, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    // ── Draw connection lines between nodes ──
    function drawConnections(t) {
        ctx.save();
        ctx.setLineDash([4, 8]);
        for (let i = 0; i < NODES.length; i++) {
            for (let j = i + 1; j < NODES.length; j++) {
                const a = NODES[i], b = NODES[j];
                if (!a.p?.v || !b.p?.v) continue;
                if (a.p.z < 0.05 || b.p.z < 0.05) continue;
                const dx = a.p.x - b.p.x, dy = a.p.y - b.p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > R * 0.85) continue;
                const base = (1 - dist / (R * 0.85)) * 0.22;
                const pulse = base * (0.7 + Math.sin(t * 0.6 + i * 0.8 + j * 0.5) * 0.3);
                ctx.beginPath();
                ctx.moveTo(a.p.x, a.p.y);
                ctx.lineTo(b.p.x, b.p.y);
                ctx.strokeStyle = `rgba(196,218,132,${pulse.toFixed(3)})`;
                ctx.lineWidth = 0.65;
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    // ── Draw planet-style nodes ──
    function drawNodes(t) {
        NODES.forEach(n => {
            const p = project(n.lat, n.lon);
            n.p = p;
            if (!p.v || p.z < 0.04) return;

            const alpha = Math.min(1, (p.z - 0.04) * 4);
            const pulse = 1 + Math.sin(t * 1.8 + n.lat * 0.15) * 0.06;

            ctx.save();
            ctx.globalAlpha = alpha;

            // Outer glow halo
            const haloR = (n.r + 10) * pulse;
            const halo = ctx.createRadialGradient(p.x, p.y, n.r * 0.5, p.x, p.y, haloR * 1.6);
            halo.addColorStop(0,   n.glow.replace(')', ', 0.5)').replace('rgba(', 'rgba(').replace(/,\s*[\d.]+\)$/, `, ${(0.28 * alpha).toFixed(2)})`));
            halo.addColorStop(0.5, n.glow.replace(/,\s*[\d.]+\)$/, ', 0.08)'));
            halo.addColorStop(1,   'transparent');
            ctx.beginPath();
            ctx.arc(p.x, p.y, haloR * 1.6, 0, Math.PI * 2);
            ctx.fillStyle = halo;
            ctx.fill();

            // Outer ring (like the reference image)
            ctx.beginPath();
            ctx.arc(p.x, p.y, (n.r + 5) * pulse, 0, Math.PI * 2);
            ctx.strokeStyle = n.ring;
            ctx.lineWidth = 2.5;
            ctx.globalAlpha = alpha * 0.55;
            ctx.stroke();

            // Mid ring
            ctx.beginPath();
            ctx.arc(p.x, p.y, (n.r + 1) * pulse, 0, Math.PI * 2);
            ctx.strokeStyle = n.ring;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = alpha * 0.85;
            ctx.stroke();

            // Planet body
            const bodyG = ctx.createRadialGradient(
                p.x - n.r * 0.3, p.y - n.r * 0.3, n.r * 0.05,
                p.x, p.y, n.r * pulse
            );
            bodyG.addColorStop(0,   lighten(n.fill, 0.25));
            bodyG.addColorStop(0.5, n.fill);
            bodyG.addColorStop(1,   darken(n.fill, 0.35));
            ctx.beginPath();
            ctx.arc(p.x, p.y, n.r * pulse, 0, Math.PI * 2);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = bodyG;
            ctx.fill();

            // Specular shine on planet
            const shine = ctx.createRadialGradient(
                p.x - n.r * 0.28, p.y - n.r * 0.28, 0,
                p.x - n.r * 0.2,  p.y - n.r * 0.2,  n.r * 0.55
            );
            shine.addColorStop(0,   'rgba(255,255,255,0.28)');
            shine.addColorStop(0.6, 'rgba(255,255,255,0.06)');
            shine.addColorStop(1,   'transparent');
            ctx.beginPath();
            ctx.arc(p.x, p.y, n.r * pulse, 0, Math.PI * 2);
            ctx.fillStyle = shine;
            ctx.fill();

            ctx.restore();
        });
    }

    // ── Color helpers ──
    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }
    function lighten(hex, amt) {
        const [r, g, b] = hexToRgb(hex);
        return `rgb(${Math.min(255, Math.round(r + (255 - r) * amt))},${Math.min(255, Math.round(g + (255 - g) * amt))},${Math.min(255, Math.round(b + (255 - b) * amt))})`;
    }
    function darken(hex, amt) {
        const [r, g, b] = hexToRgb(hex);
        return `rgb(${Math.round(r * (1 - amt))},${Math.round(g * (1 - amt))},${Math.round(b * (1 - amt))})`;
    }

    // ── Outer ambient glow ring around globe ──
    function drawAmbient() {
        const g = ctx.createRadialGradient(cx, cy, R * 0.88, cx, cy, R * 1.45);
        g.addColorStop(0,   'transparent');
        g.addColorStop(0.4, 'rgba(0, 71, 35, 0.07)');
        g.addColorStop(0.8, 'rgba(196,218,132, 0.06)');
        g.addColorStop(1,   'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.45, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
    }

    // ── Animation loop ──
    function draw(ts) {
        requestAnimationFrame(draw);
        const t = ts * 0.001;

        if (auto && !dragging) {
            rotY += 0.0016;
        }
        if (!dragging) {
            velX *= 0.90;
            velY *= 0.90;
        }

        ctx.clearRect(0, 0, W, H);

        drawAmbient();

        ctx.save();
        drawSphere();
        ctx.restore();

        // Clip everything inside to sphere
        ctx.save();
        clipToSphere();
        drawGrid();
        drawConts();
        drawDots();
        drawConnections(t);
        ctx.restore();

        // Nodes drawn outside clip so rings can bleed slightly
        drawNodes(t);
    }
    requestAnimationFrame(draw);
})();
EOF
echo "done"
