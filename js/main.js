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
// WORLD MAP SKETCH GLOBE
// ============================================
(function () {
    const container = document.getElementById('globe-container');
    if (!container) return;

    // ── Canvas Setup ──
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
        R  = Math.min(W, H) * 0.38;
    }
    resize();
    window.addEventListener('resize', () => { resize(); }, { passive: true });

    // ── Globe rotation state ──
    let rotY = 0.4;   // longitude offset
    let rotX = 0.18;  // tilt
    let velX = 0, velY = 0;
    let isDragging = false;
    let dragStart  = { x: 0, y: 0 };
    let autoSpin   = true;
    const AUTO_SPEED = 0.0018;

    // ── Drag ──
    canvas.addEventListener('mousedown', e => {
        isDragging = true; autoSpin = false;
        dragStart = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', e => {
        if (!isDragging) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        velY = dx * 0.004;
        velX = dy * 0.004;
        rotY += velY;
        rotX += velX;
        rotX = Math.max(-0.65, Math.min(0.65, rotX));
        dragStart = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
        setTimeout(() => { autoSpin = true; }, 1800);
    });
    canvas.addEventListener('touchstart', e => {
        isDragging = true; autoSpin = false;
        dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
        e.preventDefault();
        const dx = e.touches[0].clientX - dragStart.x;
        const dy = e.touches[0].clientY - dragStart.y;
        velY = dx * 0.004;
        velX = dy * 0.004;
        rotY += velY;
        rotX += velX;
        rotX = Math.max(-0.65, Math.min(0.65, rotX));
        dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: false });
    canvas.addEventListener('touchend', () => {
        isDragging = false;
        setTimeout(() => { autoSpin = true; }, 1800);
    });

    // ── Projection helpers ──
    // Converts (lat, lon) degrees → 3D unit sphere → projected 2D with rotation
    function project(latDeg, lonDeg) {
        const lat = latDeg * Math.PI / 180;
        const lon = lonDeg * Math.PI / 180 + rotY;

        // Apply x-rotation (tilt)
        let x = Math.cos(lat) * Math.cos(lon);
        let y = Math.sin(lat);
        let z = Math.cos(lat) * Math.sin(lon);

        const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
        const y2 =  y * cosX - z * sinX;
        const z2 =  y * sinX + z * cosX;

        return {
            x: cx + x * R,
            y: cy - y2 * R,
            z: z2,
            visible: z2 > -0.08
        };
    }

    function isVisible(latDeg, lonDeg) {
        return project(latDeg, lonDeg).z > -0.04;
    }

    // ── Great circle arc between two lat/lon points ──
    function drawArc(ctx, lat1, lon1, lat2, lon2, steps = 40) {
        const pts = [];
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const lt = lat1 + (lat2 - lat1) * t;
            const ln = lon1 + (lon2 - lon1) * t;
            const p = project(lt, ln);
            pts.push(p);
        }
        // Draw only visible segments
        let drawing = false;
        for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            if (p.z > 0) {
                if (!drawing) { ctx.moveTo(p.x, p.y); drawing = true; }
                else ctx.lineTo(p.x, p.y);
            } else {
                drawing = false;
            }
        }
    }

    // ── World map polyline data (simplified continental outlines) ──
    // Each shape = array of [lat, lon] pairs
    const CONTINENTS = [

        // North America
        [ [70,-140],[72,-120],[68,-100],[62,-90],[58,-94],[52,-90],[48,-88],[45,-76],[44,-66],
          [42,-70],[41,-72],[38,-76],[34,-78],[30,-81],[25,-80],[24,-82],[24,-90],[22,-90],
          [16,-88],[12,-84],[8,-82],[8,-77],[10,-75],[12,-72],[14,-66],[18,-67],[20,-74],
          [22,-80],[24,-90],[26,-97],[22,-106],[20,-105],[16,-96],[14,-92],[14,-88],[16,-88],
          [22,-90],[24,-90],[24,-110],[28,-112],[30,-116],[32,-117],[36,-120],[38,-122],
          [40,-124],[44,-124],[48,-124],[50,-125],[54,-130],[58,-136],[60,-146],[60,-150],
          [58,-152],[56,-160],[54,-164],[58,-158],[60,-152],[62,-150],[62,-146],[60,-140],
          [62,-138],[64,-140],[66,-166],[68,-166],[70,-162],[70,-156],[68,-150],[70,-140] ],

        // Greenland
        [ [76,-70],[78,-60],[82,-50],[84,-44],[82,-30],[78,-24],[72,-22],[70,-26],[68,-30],
          [66,-36],[66,-44],[68,-50],[68,-58],[70,-64],[72,-68],[74,-68],[76,-70] ],

        // South America
        [ [12,-72],[10,-62],[10,-60],[6,-60],[2,-52],[0,-50],[-4,-44],[-8,-36],[-12,-38],
          [-16,-38],[-20,-40],[-22,-42],[-24,-46],[-28,-48],[-32,-52],[-34,-54],[-38,-58],
          [-42,-64],[-46,-66],[-50,-70],[-54,-70],[-56,-68],[-54,-64],[-50,-66],[-46,-65],
          [-42,-62],[-38,-58],[-34,-53],[-30,-50],[-24,-46],[-18,-40],[-12,-38],[-8,-36],
          [-4,-39],[0,-44],[4,-52],[6,-58],[8,-62],[10,-62],[12,-72] ],

        // Europe
        [ [70,28],[68,20],[64,14],[60,5],[56,8],[52,4],[50,2],[48,0],[44,-2],[44,6],
          [42,8],[38,0],[36,-6],[36,8],[38,16],[40,18],[40,22],[38,26],[36,28],[36,34],
          [38,34],[40,30],[42,28],[44,28],[46,30],[48,22],[50,18],[52,14],[54,10],[56,10],
          [58,8],[60,6],[62,6],[64,10],[66,14],[68,16],[70,22],[70,28] ],

        // Africa
        [ [36,10],[32,12],[28,12],[24,16],[20,16],[16,16],[12,12],[8,4],[4,2],[0,6],
          [-4,10],[-8,14],[-12,18],[-16,20],[-20,18],[-24,16],[-28,18],[-32,18],
          [-34,22],[-34,26],[-30,32],[-26,34],[-22,36],[-16,38],[-10,40],[-4,40],
          [0,42],[4,44],[8,48],[12,52],[12,42],[8,38],[4,36],[0,34],[4,32],[8,30],
          [12,32],[16,34],[20,36],[24,36],[28,32],[32,30],[36,10] ],

        // Asia (simplified)
        [ [70,30],[68,38],[64,40],[60,44],[56,48],[52,52],[48,58],[44,58],[40,60],
          [36,62],[32,64],[28,66],[24,68],[20,70],[16,74],[12,78],[8,78],[8,80],
          [12,80],[16,82],[20,86],[24,90],[28,92],[28,98],[24,100],[20,100],[16,104],
          [12,108],[8,108],[4,108],[0,110],[4,114],[8,116],[12,120],[16,120],[20,116],
          [24,116],[28,120],[32,120],[36,120],[40,122],[44,128],[48,134],[52,140],
          [56,140],[60,150],[64,148],[64,140],[60,132],[56,130],[52,132],[48,140],
          [44,142],[44,148],[48,140],[52,140],[56,138],[60,140],[64,148],[68,150],
          [70,154],[72,148],[70,140],[66,134],[62,130],[60,128],[56,124],[52,120],
          [48,116],[44,110],[40,106],[36,102],[32,100],[28,96],[24,92],[20,88],
          [16,84],[12,80],[8,78],[4,76],[4,70],[8,66],[12,62],[16,56],[20,58],
          [24,56],[28,50],[32,46],[36,44],[40,42],[44,40],[48,44],[52,46],[56,48],
          [60,44],[64,40],[68,38],[70,30] ],

        // Australia
        [ [-16,136],[-12,130],[-14,126],[-18,122],[-22,116],[-26,114],[-30,116],
          [-32,116],[-34,118],[-36,120],[-38,126],[-38,130],[-36,136],[-34,138],
          [-36,140],[-38,146],[-40,148],[-38,150],[-34,152],[-30,154],[-26,154],
          [-24,152],[-22,150],[-18,148],[-16,144],[-14,140],[-12,136],[-14,132],
          [-16,136] ],

        // Japan (simplified)
        [ [40,140],[38,140],[36,136],[34,132],[34,130],[36,130],[38,134],[40,138],[40,140] ],

        // UK
        [ [50,-6],[52,-4],[54,-2],[56,0],[58,-2],[58,-4],[56,-6],[54,-4],[52,-4],
          [50,-6] ],

        // Iceland
        [ [64,-24],[64,-18],[66,-14],[66,-24],[64,-24] ],

        // New Zealand (simplified)
        [ [-34,172],[-36,174],[-38,176],[-40,176],[-44,170],[-46,170],[-44,172],
          [-42,172],[-38,174],[-36,174],[-34,172] ],

        // Philippines (simplified cluster)
        [ [18,122],[16,120],[14,122],[12,124],[10,126],[10,122],[12,120],[14,120],[16,120],[18,122] ],

        // Indonesia (simplified)
        [ [0,106],[0,110],[0,114],[-4,114],[-6,110],[-6,106],[-4,104],[0,106] ],

        // Sri Lanka
        [ [10,80],[8,80],[6,82],[8,82],[10,80] ],

        // Cuba
        [ [22,-76],[22,-82],[20,-76],[22,-76] ],

        // Madagascar
        [ [-12,50],[-16,46],[-20,44],[-24,46],[-26,50],[-22,50],[-18,48],[-14,50],[-12,50] ],
    ];

    // ── Latitude / Longitude grid ──
    function drawGrid() {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 71, 35, 0.07)';
        ctx.lineWidth = 0.6;
        ctx.setLineDash([2, 4]);

        // Latitude rings
        for (let lat = -80; lat <= 80; lat += 20) {
            ctx.beginPath();
            for (let lon = -180; lon <= 180; lon += 3) {
                const p = project(lat, lon);
                if (!p.visible) continue;
                if (lon === -180) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        }

        // Longitude meridians
        for (let lon = -180; lon < 180; lon += 30) {
            ctx.beginPath();
            for (let lat = -90; lat <= 90; lat += 3) {
                const p = project(lat, lon);
                if (!p.visible) continue;
                if (lat === -90) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        }

        ctx.restore();
    }

    // ── Tropic/Equator lines ──
    function drawSpecialLines() {
        const specialLats = [
            { lat: 0,    color: 'rgba(196,218,132,0.22)', dash: [4, 4] },
            { lat: 23.5, color: 'rgba(196,218,132,0.13)', dash: [2, 5] },
            { lat: -23.5,color: 'rgba(196,218,132,0.13)', dash: [2, 5] },
            { lat: 66.5, color: 'rgba(0,71,35,0.09)',    dash: [2, 6] },
            { lat: -66.5,color: 'rgba(0,71,35,0.09)',    dash: [2, 6] },
        ];
        specialLats.forEach(({ lat, color, dash }) => {
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.lineWidth = lat === 0 ? 1 : 0.7;
            ctx.setLineDash(dash);
            for (let lon = -180; lon <= 180; lon += 2) {
                const p = project(lat, lon);
                if (!p.visible) continue;
                if (lon === -180) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
            ctx.restore();
        });
    }

    // ── Draw continent outlines ──
    function drawContinents() {
        CONTINENTS.forEach(shape => {
            ctx.save();
            ctx.beginPath();

            // Sketch effect: slightly irregular stroke
            ctx.strokeStyle = 'rgba(0, 61, 31, 0.55)';
            ctx.lineWidth = 1.2;
            ctx.lineJoin = 'round';
            ctx.lineCap  = 'round';
            ctx.setLineDash([]);

            let started = false;
            let lastVisible = false;

            shape.forEach(([lat, lon], i) => {
                const p = project(lat, lon);
                if (p.visible) {
                    if (!started || !lastVisible) {
                        ctx.moveTo(p.x, p.y);
                        started = true;
                    } else {
                        ctx.lineTo(p.x, p.y);
                    }
                    lastVisible = true;
                } else {
                    lastVisible = false;
                }
            });

            ctx.stroke();

            // Second pass: subtle fill for land mass feel
            ctx.beginPath();
            started = false; lastVisible = false;
            shape.forEach(([lat, lon]) => {
                const p = project(lat, lon);
                if (p.visible) {
                    if (!started || !lastVisible) { ctx.moveTo(p.x, p.y); started = true; }
                    else ctx.lineTo(p.x, p.y);
                    lastVisible = true;
                } else { lastVisible = false; }
            });
            ctx.fillStyle = 'rgba(196, 218, 132, 0.06)';
            ctx.fill();
            ctx.restore();
        });
    }

    // ── Dot pattern for land mass texture ──
    // Draw tiny scattered dots over major continents for sketch texture
    function drawLandTexture() {
        // Sparse dots only in land regions (rough bounding box check)
        const landDots = [];
        // Pre-generate fixed dot positions
        if (!window._globeDots) {
            const seed = [];
            const regions = [
                // North America
                { latMin: 25, latMax: 65, lonMin: -130, lonMax: -60, count: 60 },
                // South America
                { latMin: -50, latMax: 10, lonMin: -80, lonMax: -35, count: 50 },
                // Europe
                { latMin: 36, latMax: 70, lonMin: -10, lonMax: 40, count: 40 },
                // Africa
                { latMin: -34, latMax: 36, lonMin: -18, lonMax: 52, count: 70 },
                // Asia
                { latMin: 0, latMax: 70, lonMin: 25, lonMax: 145, count: 120 },
                // Australia
                { latMin: -40, latMax: -12, lonMin: 114, lonMax: 154, count: 35 },
            ];
            let rng = 42;
            const rand = () => { rng = (rng * 1664525 + 1013904223) & 0xFFFFFFFF; return (rng >>> 0) / 0xFFFFFFFF; };
            regions.forEach(({ latMin, latMax, lonMin, lonMax, count }) => {
                for (let i = 0; i < count; i++) {
                    seed.push([
                        latMin + rand() * (latMax - latMin),
                        lonMin + rand() * (lonMax - lonMin),
                    ]);
                }
            });
            window._globeDots = seed;
        }

        ctx.save();
        window._globeDots.forEach(([lat, lon]) => {
            const p = project(lat, lon);
            if (!p.visible) return;
            const alpha = 0.12 + p.z * 0.08;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 61, 31, ${alpha})`;
            ctx.fill();
        });
        ctx.restore();
    }

    // ── Gradient node icon maker ──
    function makeNodeCanvas(emoji, label) {
        const size = 88;
        const cvs = document.createElement('canvas');
        cvs.width = cvs.height = size;
        const c = cvs.getContext('2d');

        // Gradient background — forest to sage radial
        const grad = c.createRadialGradient(size/2, size/3, 4, size/2, size/2, size * 0.47);
        grad.addColorStop(0,   'rgba(0, 92, 46, 0.97)');
        grad.addColorStop(0.5, 'rgba(0, 71, 35, 0.97)');
        grad.addColorStop(1,   'rgba(0, 40, 20, 0.95)');

        // Outer glow
        c.shadowColor = 'rgba(196, 218, 132, 0.45)';
        c.shadowBlur  = 10;
        c.beginPath();
        c.arc(size/2, size/2, size * 0.45, 0, Math.PI * 2);
        c.fillStyle = grad;
        c.fill();
        c.shadowBlur = 0;

        // Sage-to-forest ring gradient
        const ringGrad = c.createLinearGradient(0, 0, size, size);
        ringGrad.addColorStop(0,   '#C4DA84');
        ringGrad.addColorStop(0.4, '#8FB55A');
        ringGrad.addColorStop(1,   '#004723');

        c.strokeStyle = ringGrad;
        c.lineWidth   = 2.2;
        c.beginPath();
        c.arc(size/2, size/2, size * 0.41, 0, Math.PI * 2);
        c.stroke();

        // Inner subtle ring
        c.strokeStyle = 'rgba(196, 218, 132, 0.2)';
        c.lineWidth   = 1;
        c.beginPath();
        c.arc(size/2, size/2, size * 0.33, 0, Math.PI * 2);
        c.stroke();

        // Emoji icon
        c.font = `${size * 0.34}px serif`;
        c.textAlign    = 'center';
        c.textBaseline = 'middle';
        c.fillText(emoji, size/2, size/2 + 1);

        return cvs;
    }

    // ── Wellness nodes ──
    const NODES = [
        { lat:  5,  lon: 20,  emoji: '🌿', label: 'Organic',      tip: '🌿 Organic Products' },
        { lat: 22,  lon: -100, emoji: '🥑', label: 'Keto',         tip: '🥑 Keto-Friendly'    },
        { lat: 51,  lon: 10,  emoji: '🌾', label: 'Gluten-Free',  tip: '🌾 Gluten-Free'       },
        { lat: -25, lon: 135, emoji: '🥗', label: 'Low-Carb',     tip: '🥗 Low-Carb Options'  },
        { lat: 35,  lon: 105, emoji: '🍵', label: 'Wellness',     tip: '🛡 Wellness'           },
        { lat: -10, lon: -55, emoji: '🍫', label: 'Chocolate',    tip: '🍫 Chocolate & Treats' },
        { lat: 55,  lon: 80,  emoji: '🥜', label: 'Snacks',       tip: '🥜 Healthy Snacks'     },
        { lat: 25,  lon: 70,  emoji: '💊', label: 'Supplements',  tip: '💊 Supplements'        },
        { lat: -35, lon: 25,  emoji: '❤️', label: 'Heart',        tip: '❤️ Heart Health'       },
        { lat: 15,  lon: 45,  emoji: '🌱', label: 'Plant',        tip: '🌱 Plant-Based'        },
        { lat: 60,  lon: -90, emoji: '⚡', label: 'Vitality',     tip: '⚡ Vitality Boosters'  },
    ];

    // Pre-render node canvases
    NODES.forEach(n => { n._canvas = makeNodeCanvas(n.emoji, n.label); });

    // ── Tooltip ──
    const tooltip = document.createElement('div');
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

    let hoveredNode = null;

    canvas.addEventListener('mousemove', e => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        hoveredNode = null;

        NODES.forEach(n => {
            if (!n._projected || !n._projected.visible) return;
            const dx = mx - n._projected.x;
            const dy = my - n._projected.y;
            if (Math.sqrt(dx*dx + dy*dy) < 22) {
                hoveredNode = n;
            }
        });

        if (hoveredNode) {
            tooltip.textContent   = hoveredNode.tip;
            tooltip.style.left    = (e.clientX + 16) + 'px';
            tooltip.style.top     = (e.clientY - 12) + 'px';
            tooltip.style.opacity = '1';
        } else {
            tooltip.style.opacity = '0';
        }
    });
    canvas.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });

    // ── Draw nodes ──
    function drawNodes(t) {
        NODES.forEach(n => {
            const p = project(n.lat, n.lon);
            n._projected = p;
            if (!p.visible || p.z < 0.05) return;

            const alpha = Math.min(1, (p.z - 0.05) * 3);
            const pulse = 1 + Math.sin(t * 1.8 + n.lat * 0.1) * 0.08;
            const nodeR = 18 * pulse;
            const iconSize = 36;

            ctx.save();
            ctx.globalAlpha = alpha;

            // Outer pulse ring
            ctx.beginPath();
            ctx.arc(p.x, p.y, nodeR * 1.55, 0, Math.PI * 2);
            const pulseAlpha = 0.18 + Math.sin(t * 1.8 + n.lat * 0.1) * 0.12;
            ctx.strokeStyle = `rgba(196, 218, 132, ${pulseAlpha})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Mid ring — gradient effect via arc stroke
            const rGrad = ctx.createLinearGradient(p.x - nodeR, p.y - nodeR, p.x + nodeR, p.y + nodeR);
            rGrad.addColorStop(0,   'rgba(196, 218, 132, 0.8)');
            rGrad.addColorStop(0.5, 'rgba(143, 181, 90, 0.6)');
            rGrad.addColorStop(1,   'rgba(0, 71, 35, 0.5)');
            ctx.beginPath();
            ctx.arc(p.x, p.y, nodeR * 1.15, 0, Math.PI * 2);
            ctx.strokeStyle = rGrad;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Draw node canvas (icon)
            ctx.drawImage(n._canvas, p.x - iconSize/2, p.y - iconSize/2, iconSize, iconSize);

            ctx.restore();
        });
    }

    // ── Connection lines between nearby nodes ──
    function drawConnections(t) {
        ctx.save();
        for (let i = 0; i < NODES.length; i++) {
            for (let j = i + 1; j < NODES.length; j++) {
                const a = NODES[i], b = NODES[j];
                if (!a._projected?.visible || !b._projected?.visible) continue;
                if (a._projected.z < 0.15 || b._projected.z < 0.15) continue;

                const dx = a._projected.x - b._projected.x;
                const dy = a._projected.y - b._projected.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist > R * 0.7) continue;

                const alpha = (1 - dist / (R * 0.7)) * 0.12 *
                              Math.sin(t * 0.5 + i + j) * 0.5 + 0.06;
                ctx.beginPath();
                ctx.moveTo(a._projected.x, a._projected.y);
                ctx.lineTo(b._projected.x, b._projected.y);
                ctx.strokeStyle = `rgba(196, 218, 132, ${alpha})`;
                ctx.lineWidth = 0.6;
                ctx.setLineDash([3, 6]);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }
        ctx.restore();
    }

    // ── Globe sphere base ──
    function drawSphere() {
        // Outer ambient glow
        const outerGlow = ctx.createRadialGradient(cx - R*0.2, cy - R*0.2, R*0.1, cx, cy, R * 1.35);
        outerGlow.addColorStop(0,   'rgba(196, 218, 132, 0.04)');
        outerGlow.addColorStop(0.7, 'rgba(0, 71, 35, 0.03)');
        outerGlow.addColorStop(1,   'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2);
        ctx.fillStyle = outerGlow;
        ctx.fill();

        // Main sphere gradient
        const sphereGrad = ctx.createRadialGradient(cx - R*0.25, cy - R*0.25, R*0.05, cx, cy, R);
        sphereGrad.addColorStop(0,   'rgba(247, 250, 243, 0.65)');
        sphereGrad.addColorStop(0.5, 'rgba(240, 246, 234, 0.35)');
        sphereGrad.addColorStop(1,   'rgba(196, 218, 132, 0.08)');
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = sphereGrad;
        ctx.fill();

        // Crisp sphere edge
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        const edgeGrad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
        edgeGrad.addColorStop(0,   'rgba(196, 218, 132, 0.35)');
        edgeGrad.addColorStop(0.4, 'rgba(0, 71, 35, 0.20)');
        edgeGrad.addColorStop(1,   'rgba(0, 36, 18, 0.25)');
        ctx.strokeStyle = edgeGrad;
        ctx.lineWidth   = 1.5;
        ctx.stroke();

        // Specular highlight
        const spec = ctx.createRadialGradient(cx - R*0.32, cy - R*0.30, 0, cx - R*0.28, cy - R*0.26, R*0.45);
        spec.addColorStop(0,   'rgba(255,255,255,0.22)');
        spec.addColorStop(0.6, 'rgba(255,255,255,0.04)');
        spec.addColorStop(1,   'transparent');
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = spec;
        ctx.fill();
    }

    // ── Particle ring orbiting outside ──
    const ORBIT_PARTICLES = Array.from({ length: 60 }, (_, i) => ({
        theta: (i / 60) * Math.PI * 2,
        r:     R * (1.18 + (i % 3) * 0.06),
        size:  0.8 + (i % 4) * 0.5,
        speed: 0.00015 + (i % 5) * 0.00006,
        tilt:  (i % 3 - 1) * 0.3,
    }));

    function drawOrbitParticles(t) {
        ctx.save();
        ORBIT_PARTICLES.forEach(p => {
            p.theta += p.speed;
            const x = cx + Math.cos(p.theta) * p.r;
            const y = cy + Math.sin(p.theta + p.tilt) * p.r * 0.42;
            const alpha = 0.2 + Math.sin(p.theta * 3) * 0.15;
            ctx.beginPath();
            ctx.arc(x, y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(196, 218, 132, ${alpha})`;
            ctx.fill();
        });
        ctx.restore();
    }

    // ── Main render ──
    function draw(t) {
        ctx.clearRect(0, 0, W, H);

        drawOrbitParticles(t);
        drawSphere();
        drawGrid();
        drawSpecialLines();
        drawLandTexture();
        drawContinents();
        drawConnections(t);
        drawNodes(t);
    }

    // ── Animation loop ──
    let lastT = 0;
    function animate(ts) {
        requestAnimationFrame(animate);
        const t = ts * 0.001;

        if (autoSpin && !isDragging) {
            rotY += AUTO_SPEED;
        }
        if (!isDragging) {
            velX *= 0.92;
            velY *= 0.92;
        }

        draw(t);
    }
    requestAnimationFrame(animate);
})();
