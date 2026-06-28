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

// ============================================
// LIGHT CONSTELLATION GLOBE
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
        R  = Math.min(W, H) * 0.48; // Made slightly larger to match image proportion
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let rotY = -0.5, rotX = 0.15;
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
        dragging = false; canvas.style.cursor = 'grab';
        setTimeout(() => auto = true, 3000);
    });

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

    // ── Nodes matching reference image ──
    const NODES = [
        { lat: 48, lon: -15, r: 20, fillDark: false, icon: 'leaf', label: 'Organic' },
        { lat: 10, lon: -45, r: 24, fillDark: true,  icon: 'bowl', label: 'Superfoods' },
        { lat: 15, lon: 45,  r: 18, fillDark: false, icon: 'bottle', label: 'Supplements' },
        { lat: -15, lon: 10, r: 24, fillDark: false, icon: 'heart', label: 'Heart Health' },
        { lat: -25, lon: 55, r: 18, fillDark: true,  icon: 'lotus', label: 'Wellness' },
        { lat: -55, lon: 15, r: 20, fillDark: false, icon: 'bottle', label: 'Vitamins' },
    ];

    // ── Mesh & Scatter Points ──
    const MESH_POINTS = [];
    const DOTS = [];
    (function () {
        let rng = 123;
        const rand = () => { rng = (rng * 1664525 + 1013904223) & 0xFFFFFFFF; return (rng >>> 0) / 0xFFFFFFFF; };
        
        // Mesh structural points (for the green connecting lines)
        for (let i = 0; i < 180; i++) {
            const theta = Math.acos(2 * rand() - 1);
            const phi   = rand() * Math.PI * 2;
            MESH_POINTS.push({ lat: (Math.PI / 2 - theta) * 180 / Math.PI, lon: phi * 180 / Math.PI - 180 });
        }
        
        // Fine scatter dots
        for (let i = 0; i < 900; i++) {
            const theta = Math.acos(2 * rand() - 1);
            const phi   = rand() * Math.PI * 2;
            DOTS.push({ lat: (Math.PI / 2 - theta) * 180 / Math.PI, lon: phi * 180 / Math.PI - 180, size: 0.5 + rand() * 1.5 });
        }
    })();

    function drawIcon(px, py, r, icon, dark) {
        const fg = dark ? '#FFFFFF' : '#044C27';
        const s  = r * 0.65; 
        ctx.save();
        ctx.translate(px, py);
        ctx.strokeStyle = fg; ctx.fillStyle = fg;
        ctx.lineWidth = s * 0.12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';

        if (icon === 'leaf') {
            ctx.beginPath();
            ctx.moveTo(0, s * 0.5);
            ctx.bezierCurveTo(-s * 0.6, 0, -s * 0.6, -s * 0.6, 0, -s * 0.6);
            ctx.bezierCurveTo(s * 0.6, -s * 0.6, s * 0.6, 0, 0, s * 0.5);
            ctx.fill();
        } else if (icon === 'bowl') {
            // A bowl with two leaves popping out
            ctx.beginPath();
            ctx.arc(0, s*0.2, s*0.5, 0, Math.PI, false);
            ctx.fill();
            // leaves
            ctx.beginPath();
            ctx.moveTo(0, s*0.1);
            ctx.bezierCurveTo(-s*0.4, -s*0.1, -s*0.4, -s*0.6, 0, -s*0.6);
            ctx.bezierCurveTo(s*0.4, -s*0.6, s*0.4, -s*0.1, 0, s*0.1);
            ctx.fill();
        } else if (icon === 'heart') {
            // Heart pulse
            ctx.beginPath();
            ctx.moveTo(0, s * 0.3);
            ctx.bezierCurveTo(-s * 0.7, -s * 0.2, -s * 0.7, -s * 0.7, 0, -s * 0.3);
            ctx.bezierCurveTo(s * 0.7, -s * 0.7, s * 0.7, -s * 0.2, 0, s * 0.3);
            ctx.fillStyle = fg;
            ctx.fill();
            
            // Draw a white pulse line inside
            ctx.beginPath();
            ctx.moveTo(-s*0.3, -s*0.2); ctx.lineTo(-s*0.1, -s*0.2);
            ctx.lineTo(0, -s*0.5); ctx.lineTo(s*0.1, s*0.1);
            ctx.lineTo(s*0.2, -s*0.2); ctx.lineTo(s*0.4, -s*0.2);
            ctx.strokeStyle = dark ? '#044C27' : '#FFFFFF';
            ctx.lineWidth = s * 0.08;
            ctx.stroke();
        } else if (icon === 'bottle') {
            const bw = s * 0.5, bh = s * 0.7;
            const nx = -bw / 2, ny = -bh * 0.3;
            ctx.beginPath();
            ctx.roundRect(nx, ny, bw, bh, s * 0.1);
            ctx.fill();
            ctx.beginPath();
            ctx.roundRect(nx + bw * 0.15, ny - s * 0.25, bw * 0.7, s * 0.2, s * 0.05);
            ctx.fill();
            // Inner cutout
            ctx.fillStyle = dark ? '#044C27' : '#FFFFFF';
            ctx.beginPath();
            ctx.roundRect(nx + bw*0.2, ny + bh*0.2, bw*0.6, bh*0.4, s*0.05);
            ctx.fill();
        } else if (icon === 'lotus') {
            ctx.beginPath();
            ctx.moveTo(0, s * 0.5);
            ctx.bezierCurveTo(-s * 0.3, s * 0.1, -s * 0.3, -s * 0.6, 0, -s * 0.6);
            ctx.bezierCurveTo(s * 0.3, -s * 0.6, s * 0.3, s * 0.1, 0, s * 0.5);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(-s * 0.1, s * 0.4);
            ctx.bezierCurveTo(-s * 0.6, s * 0.2, -s * 0.7, -s * 0.3, -s * 0.4, -s * 0.4);
            ctx.bezierCurveTo(-s * 0.2, -s * 0.2, -s * 0.1, 0, 0, s * 0.4);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(s * 0.1, s * 0.4);
            ctx.bezierCurveTo(s * 0.6, s * 0.2, s * 0.7, -s * 0.3, s * 0.4, -s * 0.4);
            ctx.bezierCurveTo(s * 0.2, -s * 0.2, s * 0.1, 0, 0, s * 0.4);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawMesh() {
        ctx.save();
        const pts = MESH_POINTS.map(mp => ({ ...project(mp.lat, mp.lon), origZ: project(mp.lat, mp.lon).z }));

        for (let i = 0; i < pts.length; i++) {
            if (!pts[i].v) continue;
            const dists = [];
            for (let j = 0; j < pts.length; j++) {
                if (i === j || !pts[j].v) continue;
                const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
                dists.push({ j, d: Math.sqrt(dx * dx + dy * dy) });
            }
            dists.sort((a, b) => a.d - b.d);

            for (let k = 0; k < Math.min(3, dists.length); k++) {
                const { j, d } = dists[k];
                if (d > R * 0.35 || j < i) continue;

                const avgZ = Math.max(0, (pts[i].origZ + pts[j].origZ) / 2);
                ctx.beginPath();
                ctx.moveTo(pts[i].x, pts[i].y);
                ctx.lineTo(pts[j].x, pts[j].y);
                // Crisp thin green lines
                ctx.strokeStyle = `rgba(4, 76, 39, ${avgZ * 0.4})`;
                ctx.lineWidth = 0.4;
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    function drawDots() {
        ctx.save();
        DOTS.forEach(d => {
            const p = project(d.lat, d.lon);
            if (!p.v) return;
            const alpha = Math.min(1, (p.z + 0.1) * 2);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#044C27';
            ctx.beginPath();
            ctx.arc(p.x, p.y, d.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    function drawNodes() {
        NODES.forEach(n => {
            const p = project(n.lat, n.lon);
            n.p = p;
            if (!p.v || p.z < 0.0) return;
            
            const radius = n.r;
            ctx.save();
            
            // Faint aura
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius + 8, 0, Math.PI * 2);
            ctx.strokeStyle = n.fillDark ? 'rgba(4, 76, 39, 0.15)' : 'rgba(154, 196, 92, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Main node body
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            if (n.fillDark) {
                ctx.fillStyle = '#044C27';
                ctx.fill();
            } else {
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#9AC45C';
                ctx.stroke();
            }

            drawIcon(p.x, p.y, radius, n.icon, n.fillDark);
            ctx.restore();
        });
    }

    function draw(ts) {
        requestAnimationFrame(draw);
        if (auto && !dragging) rotY += 0.0012;
        if (!dragging) { velX *= 0.92; velY *= 0.92; }

        ctx.clearRect(0, 0, W, H);
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.clip();
        
        // Very subtle background fill to hide backface
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fill();

        drawMesh();
        drawDots();
        ctx.restore();
        
        drawNodes();
    }
    requestAnimationFrame(draw);
})();
