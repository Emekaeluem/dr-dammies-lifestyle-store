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
// LIGHT CONSTELLATION GLOBE — DR. DAMMIE'S
// Light background, polygon mesh, dot scatter,
// green circular icon nodes — matches reference.
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
        R  = Math.min(W, H) * 0.43;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // ── Rotation state ──
    let rotY = 0.3, rotX = 0.12;
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

    // ── 3D projection ──
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

    // ── Scatter dots — evenly spread, light green ──
    const DOTS = [];
    (function () {
        let rng = 42;
        const rand = () => { rng = (rng * 1664525 + 1013904223) & 0xFFFFFFFF; return (rng >>> 0) / 0xFFFFFFFF; };

        // Light greens and sage tones to match reference
        const COLS = [
            [0,   71,  35,  0.20],  // deep forest, very faint
            [0,   71,  35,  0.14],
            [0,   71,  35,  0.28],
            [80,  140, 70,  0.22],  // mid green
            [80,  140, 70,  0.16],
            [120, 180, 80,  0.18],  // sage
            [120, 180, 80,  0.12],
            [0,   71,  35,  0.10],
        ];

        for (let i = 0; i < 520; i++) {
            // Fibonacci sphere for even distribution
            const theta = Math.acos(2 * rand() - 1);
            const phi   = rand() * Math.PI * 2;
            const latD  = (Math.PI / 2 - theta) * 180 / Math.PI;
            const lonD  = phi * 180 / Math.PI - 180;
            const col   = COLS[Math.floor(rand() * COLS.length)];
            const size  = 0.7 + rand() * 1.4;
            const shape = rand() > 0.65 ? 'sq' : 'ci';
            DOTS.push({ lat: latD, lon: lonD, col, size, shape });
        }
    })();

    // ── Polygon mesh nodes — distribute around the globe ──
    // These are the structural points that form the polygon mesh lines
    const MESH_POINTS = [];
    (function () {
        let rng = 99;
        const rand = () => { rng = (rng * 1664525 + 1013904223) & 0xFFFFFFFF; return (rng >>> 0) / 0xFFFFFFFF; };
        // Create ~60 evenly distributed mesh points
        for (let i = 0; i < 60; i++) {
            const theta = Math.acos(2 * rand() - 1);
            const phi   = rand() * Math.PI * 2;
            MESH_POINTS.push({
                lat: (Math.PI / 2 - theta) * 180 / Math.PI,
                lon: phi * 180 / Math.PI - 180,
            });
        }
    })();

    // ── Wellness icon nodes (the big circular ones) ──
    // Using SVG path data drawn inline on canvas
    const NODES = [
        {
            lat: 18, lon: -30,
            r: 28,
            fillDark: true,       // dark green fill (like in reference)
            icon: 'leaf',
            label: '🌿 Organic',
        },
        {
            lat: 46, lon: 68,
            r: 26,
            fillDark: false,      // light green fill with dark outline
            icon: 'heart-pulse',
            label: '❤️ Heart Health',
        },
        {
            lat: -18, lon: 112,
            r: 26,
            fillDark: true,
            icon: 'lotus',
            label: '🌱 Wellness',
        },
        {
            lat: 52, lon: -70,
            r: 24,
            fillDark: false,
            icon: 'bottle',
            label: '💊 Supplements',
        },
        {
            lat: -8, lon: -58,
            r: 22,
            fillDark: false,
            icon: 'bottle',
            label: '🥜 Snacks',
        },
    ];

    // ── Draw icon on canvas at (px, py) with given radius ──
    function drawIcon(px, py, r, icon, dark) {
        const fg = dark ? '#FFFFFF' : '#003D1F';
        const s  = r * 0.72; // icon scale
        ctx.save();
        ctx.translate(px, py);
        ctx.strokeStyle = fg;
        ctx.fillStyle   = fg;
        ctx.lineWidth   = s * 0.09;
        ctx.lineCap     = 'round';
        ctx.lineJoin    = 'round';

        if (icon === 'leaf') {
            // Simple leaf shape
            ctx.beginPath();
            ctx.moveTo(0, s * 0.55);
            ctx.bezierCurveTo(-s * 0.55, 0, -s * 0.55, -s * 0.5, 0, -s * 0.55);
            ctx.bezierCurveTo(s * 0.55, -s * 0.5, s * 0.55, 0, 0, s * 0.55);
            ctx.fill();
            // stem line
            ctx.beginPath();
            ctx.moveTo(0, s * 0.55);
            ctx.lineTo(0, -s * 0.55);
            ctx.strokeStyle = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,61,31,0.4)';
            ctx.lineWidth = s * 0.06;
            ctx.stroke();
        } else if (icon === 'heart-pulse') {
            // Heart outline
            ctx.beginPath();
            ctx.moveTo(0, s * 0.2);
            ctx.bezierCurveTo(-s * 0.05, s * 0.5, -s * 0.7, s * 0.5, -s * 0.7, s * 0.05);
            ctx.bezierCurveTo(-s * 0.7, -s * 0.3, -s * 0.35, -s * 0.55, 0, -s * 0.2);
            ctx.bezierCurveTo(s * 0.35, -s * 0.55, s * 0.7, -s * 0.3, s * 0.7, s * 0.05);
            ctx.bezierCurveTo(s * 0.7, s * 0.5, s * 0.05, s * 0.5, 0, s * 0.2);
            ctx.closePath();
            ctx.strokeStyle = fg;
            ctx.lineWidth   = s * 0.1;
            ctx.stroke();
            // pulse line through heart
            ctx.beginPath();
            ctx.moveTo(-s * 0.45, s * 0.12);
            ctx.lineTo(-s * 0.18, s * 0.12);
            ctx.lineTo(-s * 0.06, -s * 0.18);
            ctx.lineTo(s * 0.06,  s * 0.35);
            ctx.lineTo(s * 0.18,  s * 0.12);
            ctx.lineTo(s * 0.45,  s * 0.12);
            ctx.strokeStyle = fg;
            ctx.lineWidth   = s * 0.09;
            ctx.stroke();
        } else if (icon === 'lotus') {
            // Lotus / spa flower
            // Center petal
            ctx.beginPath();
            ctx.moveTo(0, s * 0.5);
            ctx.bezierCurveTo(-s * 0.25, s * 0.1, -s * 0.25, -s * 0.5, 0, -s * 0.55);
            ctx.bezierCurveTo(s * 0.25, -s * 0.5, s * 0.25, s * 0.1, 0, s * 0.5);
            ctx.strokeStyle = fg; ctx.lineWidth = s * 0.09; ctx.stroke();
            // left petal
            ctx.beginPath();
            ctx.moveTo(-s * 0.1, s * 0.3);
            ctx.bezierCurveTo(-s * 0.55, s * 0.2, -s * 0.7, -s * 0.2, -s * 0.5, -s * 0.45);
            ctx.bezierCurveTo(-s * 0.3, -s * 0.2, -s * 0.2, s * 0.0, -s * 0.1, s * 0.3);
            ctx.stroke();
            // right petal
            ctx.beginPath();
            ctx.moveTo(s * 0.1, s * 0.3);
            ctx.bezierCurveTo(s * 0.55, s * 0.2, s * 0.7, -s * 0.2, s * 0.5, -s * 0.45);
            ctx.bezierCurveTo(s * 0.3, -s * 0.2, s * 0.2, s * 0.0, s * 0.1, s * 0.3);
            ctx.stroke();
            // base arc
            ctx.beginPath();
            ctx.arc(0, s * 0.42, s * 0.32, Math.PI, 0, false);
            ctx.stroke();
        } else if (icon === 'bottle') {
            // Supplement bottle
            const bw = s * 0.42, bh = s * 0.75;
            const nx = -bw / 2, ny = -bh * 0.45;
            // cap
            ctx.beginPath();
            ctx.roundRect(nx + bw * 0.15, ny - s * 0.22, bw * 0.7, s * 0.22, s * 0.04);
            ctx.strokeStyle = fg; ctx.lineWidth = s * 0.09; ctx.stroke();
            // body
            ctx.beginPath();
            ctx.roundRect(nx, ny, bw, bh, s * 0.08);
            ctx.stroke();
            // label line
            ctx.beginPath();
            ctx.moveTo(nx + bw * 0.15, ny + bh * 0.35);
            ctx.lineTo(nx + bw * 0.85, ny + bh * 0.35);
            ctx.lineWidth = s * 0.07; ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(nx + bw * 0.2, ny + bh * 0.5);
            ctx.lineTo(nx + bw * 0.8, ny + bh * 0.5);
            ctx.stroke();
        }

        ctx.restore();
    }

    // ── Draw polygon mesh ──
    // Connect nearby mesh points with thin green lines to form irregular polygons
    function drawMesh() {
        ctx.save();
        const pts = MESH_POINTS.map(mp => {
            const p = project(mp.lat, mp.lon);
            return { ...p, origZ: p.z };
        });

        // Connect each point to its 2–4 nearest visible neighbours
        for (let i = 0; i < pts.length; i++) {
            if (!pts[i].v) continue;
            const aZ = Math.max(0, pts[i].origZ);

            // Find nearest neighbours
            const dists = [];
            for (let j = 0; j < pts.length; j++) {
                if (i === j || !pts[j].v) continue;
                const dx = pts[i].x - pts[j].x;
                const dy = pts[i].y - pts[j].y;
                dists.push({ j, d: Math.sqrt(dx * dx + dy * dy) });
            }
            dists.sort((a, b) => a.d - b.d);

            const maxConnect = 3;
            const maxDist = R * 0.68;

            for (let k = 0; k < Math.min(maxConnect, dists.length); k++) {
                const { j, d } = dists[k];
                if (d > maxDist) break;
                if (j < i) continue; // draw each edge once

                const bZ = Math.max(0, pts[j].origZ);
                const avgZ = (aZ + bZ) * 0.5;
                const alpha = avgZ * 0.28;  // very faint

                ctx.beginPath();
                ctx.moveTo(pts[i].x, pts[i].y);
                ctx.lineTo(pts[j].x, pts[j].y);
                ctx.strokeStyle = `rgba(0, 71, 35, ${alpha.toFixed(3)})`;
                ctx.lineWidth = 0.6;
                ctx.setLineDash([]);
                ctx.stroke();
            }
        }

        // Draw small dot at each mesh point
        pts.forEach(p => {
            if (!p.v || p.origZ < 0.0) return;
            const a = p.origZ * 0.35;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 71, 35, ${a.toFixed(3)})`;
            ctx.fill();
        });

        ctx.restore();
    }

    // ── Draw scatter dots ──
    function drawDots() {
        ctx.save();
        DOTS.forEach(d => {
            const p = project(d.lat, d.lon);
            if (!p.v) return;
            const fadeAlpha = Math.min(1, (p.z + 0.05) * 2.5);
            const [r, g, b, a] = d.col;
            ctx.globalAlpha = fadeAlpha * a * 3.5; // bring up to visible
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            if (d.shape === 'sq') {
                const s = d.size * 1.0;
                ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, d.size * 0.65, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    // ── Draw globe boundary circle ──
    function drawGlobeBorder() {
        // Very soft circle edge with fade
        const grad = ctx.createRadialGradient(cx, cy, R * 0.82, cx, cy, R);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, 'rgba(0, 71, 35, 0.06)');
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Crisp boundary ring
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 71, 35, 0.18)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([]);
        ctx.stroke();
    }

    // ── Draw lat/lon grid — very faint ──
    function drawGrid() {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 100, 50, 0.08)';
        ctx.lineWidth   = 0.5;
        ctx.setLineDash([3, 10]);
        // Latitude lines
        for (let lat = -60; lat <= 60; lat += 30) {
            ctx.beginPath();
            for (let lon = -180; lon <= 180; lon += 3) {
                const p = project(lat, lon);
                if (!p.v) continue;
                lon === -180 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        }
        // Longitude lines
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

    // ── Tooltip ──
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
        position:fixed;z-index:500;pointer-events:none;
        background:rgba(0,61,31,0.92);border:1px solid rgba(196,218,132,0.5);
        border-radius:10px;padding:7px 14px;
        font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;
        color:#C4DA84;backdrop-filter:blur(10px);
        opacity:0;transition:opacity 0.16s;white-space:nowrap;
        box-shadow:0 4px 18px rgba(0,61,31,0.22);
    `;
    document.body.appendChild(tooltip);

    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        let found = null;
        NODES.forEach(n => {
            if (!n.p || !n.p.v) return;
            const dx = mx - n.p.x, dy = my - n.p.y;
            if (Math.sqrt(dx * dx + dy * dy) < n.r + 10) found = n;
        });
        if (found) {
            tooltip.textContent = found.label;
            const tx = Math.min(e.clientX + 16, window.innerWidth - 160);
            tooltip.style.left  = tx + 'px';
            tooltip.style.top   = (e.clientY - 14) + 'px';
            tooltip.style.opacity = '1';
        } else {
            tooltip.style.opacity = '0';
        }
    });
    canvas.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });

    // ── Draw wellness icon nodes ──
    function drawNodes(t) {
        NODES.forEach(n => {
            const p = project(n.lat, n.lon);
            n.p = p;
            if (!p.v || p.z < 0.04) return;

            const alpha  = Math.min(1, (p.z - 0.04) * 5);
            const pulse  = 1 + Math.sin(t * 1.4 + n.lat * 0.12) * 0.04;
            const radius = n.r * pulse;

            ctx.save();
            ctx.globalAlpha = alpha;

            if (n.fillDark) {
                // Dark forest green filled circle
                // Outer ring (sage/light green)
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius + 6, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(0, 71, 35, 0.20)';
                ctx.lineWidth   = 1.5;
                ctx.stroke();

                // Second ring
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius + 2.5, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(0, 71, 35, 0.35)';
                ctx.lineWidth   = 1.2;
                ctx.stroke();

                // Main filled circle
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = '#003D1F';
                ctx.fill();

                // Subtle specular
                const shine = ctx.createRadialGradient(
                    p.x - radius * 0.28, p.y - radius * 0.28, 0,
                    p.x, p.y, radius
                );
                shine.addColorStop(0, 'rgba(255,255,255,0.14)');
                shine.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = shine;
                ctx.fill();

                drawIcon(p.x, p.y, radius, n.icon, true);
            } else {
                // Light fill — sage/white circle with dark green border
                // Outer glow ring
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius + 7, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(196, 218, 132, 0.45)';
                ctx.lineWidth   = 1.5;
                ctx.stroke();

                // Second ring
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius + 2.5, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(0, 71, 35, 0.55)';
                ctx.lineWidth   = 1.5;
                ctx.stroke();

                // Light fill body
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                const bg = ctx.createRadialGradient(
                    p.x - radius * 0.2, p.y - radius * 0.2, 0,
                    p.x, p.y, radius
                );
                bg.addColorStop(0, '#E8F4D8');
                bg.addColorStop(1, '#C4DA84');
                ctx.fillStyle = bg;
                ctx.fill();

                // Border
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = '#004723';
                ctx.lineWidth   = 1.8;
                ctx.stroke();

                drawIcon(p.x, p.y, radius, n.icon, false);
            }

            ctx.restore();
        });
    }

    // ── Clip to sphere ──
    function clipToSphere() {
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.clip();
    }

    // ── Main animation loop ──
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

        // Globe boundary (no fill — background stays light/white)
        drawGlobeBorder();

        // Clip everything to the sphere circle
        ctx.save();
        clipToSphere();
        drawGrid();
        drawMesh();
        drawDots();
        ctx.restore();

        // Nodes drawn outside clip so rings bleed slightly
        drawNodes(t);
    }
    requestAnimationFrame(draw);
})();
