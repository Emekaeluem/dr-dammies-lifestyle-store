// ============================================
// NAVBAR — SCROLL EFFECT
// ============================================
const navbar = document.getElementById('navbar');
if (navbar) {
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
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
        const navLinks = document.getElementById('navLinks');
        const toggle   = document.querySelector('.menu-toggle');
        navLinks?.classList.remove('active');
        toggle?.classList.remove('open');
    });
});

// ============================================
// 3D WELLNESS GLOBE
// ============================================
(function () {
    const container = document.getElementById('globe-container');
    if (!container) return;

    // ---- Scene ----
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(42, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.z = 5.8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // ---- Colors ----
    const C_FOREST = 0x004723;
    const C_SAGE   = 0xC4DA84;
    const C_WHITE  = 0xFFFFFF;

    // ---- Core Wireframe ----
    const coreGeo = new THREE.IcosahedronGeometry(2, 5);
    const coreMat = new THREE.MeshBasicMaterial({
        color: C_FOREST,
        wireframe: true,
        transparent: true,
        opacity: 0.14
    });
    globeGroup.add(new THREE.Mesh(coreGeo, coreMat));

    // ---- Inner glow ----
    const innerGeo = new THREE.SphereGeometry(1.97, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
        color: C_SAGE,
        transparent: true,
        opacity: 0.05
    });
    globeGroup.add(new THREE.Mesh(innerGeo, innerMat));

    // ---- Outer halo ----
    const outerGeo = new THREE.IcosahedronGeometry(2.45, 2);
    const outerMat = new THREE.MeshBasicMaterial({
        color: C_SAGE,
        wireframe: true,
        transparent: true,
        opacity: 0.05
    });
    const outerSphere = new THREE.Mesh(outerGeo, outerMat);
    globeGroup.add(outerSphere);

    // ---- Latitude / Longitude rings ----
    const ringMat = new THREE.LineBasicMaterial({ color: C_SAGE, transparent: true, opacity: 0.18 });

    function makeLatRing(lat, radius = 2.01) {
        const r = radius * Math.cos(lat);
        const y = radius * Math.sin(lat);
        const pts = [];
        for (let i = 0; i <= 128; i++) {
            const a = (i / 128) * Math.PI * 2;
            pts.push(new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a)));
        }
        return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat);
    }

    function makeLonRing(lon, radius = 2.01) {
        const pts = [];
        for (let i = 0; i <= 128; i++) {
            const lat = (i / 128) * Math.PI - Math.PI / 2;
            pts.push(new THREE.Vector3(
                radius * Math.cos(lat) * Math.cos(lon),
                radius * Math.sin(lat),
                radius * Math.cos(lat) * Math.sin(lon)
            ));
        }
        return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat);
    }

    [-60, -30, 0, 30, 60].forEach(d => globeGroup.add(makeLatRing(d * Math.PI / 180)));
    [0, 45, 90, 135].forEach(d => globeGroup.add(makeLonRing(d * Math.PI / 180)));

    // ---- Particles ----
    const PCount  = 600;
    const pPos    = new Float32Array(PCount * 3);
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
    const pMat = new THREE.PointsMaterial({ color: C_SAGE, size: 0.016, transparent: true, opacity: 0.45 });
    const particles = new THREE.Points(pGeo, pMat);
    globeGroup.add(particles);

    // ---- Wellness Nodes ----
    const NODES = [
        { pos: [ 1.3,  0.8,  1.1], label: 'Organic'      },
        { pos: [-1.2,  0.6,  1.3], label: 'Heart'         },
        { pos: [ 0.4,  1.4, -0.6], label: 'Plant'         },
        { pos: [-0.9, -1.0,  1.2], label: 'Wellness'      },
        { pos: [ 1.1, -1.2, -0.8], label: 'Nutrition'     },
        { pos: [-1.3,  1.0, -0.5], label: 'Supplements'   },
        { pos: [ 0.2,  0.3,  1.9], label: 'Vitality'      },
        { pos: [-0.4, -1.4, -0.9], label: 'Natural'       },
    ];

    function makeNodeTexture(type) {
        const cvs = document.createElement('canvas');
        cvs.width = cvs.height = 80;
        const c   = cvs.getContext('2d');

        // Background circle
        c.fillStyle = '#004723';
        c.beginPath();
        c.arc(40, 40, 36, 0, Math.PI * 2);
        c.fill();

        // Sage ring
        c.strokeStyle = '#C4DA84';
        c.lineWidth = 2.5;
        c.beginPath();
        c.arc(40, 40, 30, 0, Math.PI * 2);
        c.stroke();

        // Icon
        c.strokeStyle = '#FFFFFF';
        c.fillStyle   = '#FFFFFF';
        c.lineWidth   = 2;
        c.lineCap     = 'round';
        c.lineJoin    = 'round';

        switch (type) {
            case 'Organic':
                c.beginPath(); c.moveTo(40, 22);
                c.quadraticCurveTo(52, 28, 52, 38);
                c.quadraticCurveTo(52, 52, 40, 55);
                c.quadraticCurveTo(28, 52, 28, 38);
                c.quadraticCurveTo(28, 28, 40, 22);
                c.stroke();
                c.beginPath(); c.moveTo(40, 22); c.lineTo(40, 50); c.stroke();
                break;
            case 'Heart':
                c.beginPath(); c.moveTo(40, 54);
                c.bezierCurveTo(24, 44, 24, 32, 31, 28);
                c.bezierCurveTo(35, 25, 40, 29, 40, 29);
                c.bezierCurveTo(40, 29, 45, 25, 49, 28);
                c.bezierCurveTo(56, 32, 56, 44, 40, 54);
                c.fill();
                break;
            case 'Plant':
                c.beginPath(); c.moveTo(40, 58); c.lineTo(40, 36); c.stroke();
                c.beginPath(); c.ellipse(33, 34, 7, 11, -0.5, 0, Math.PI * 2); c.stroke();
                c.beginPath(); c.ellipse(47, 34, 7, 11,  0.5, 0, Math.PI * 2); c.stroke();
                break;
            case 'Wellness':
                c.beginPath(); c.moveTo(40, 22); c.lineTo(54, 30); c.lineTo(54, 44);
                c.quadraticCurveTo(54, 56, 40, 60);
                c.quadraticCurveTo(26, 56, 26, 44);
                c.lineTo(26, 30); c.closePath(); c.stroke();
                break;
            case 'Nutrition':
                c.beginPath(); c.arc(40, 44, 14, 0, Math.PI * 2); c.stroke();
                c.beginPath(); c.moveTo(40, 30); c.lineTo(40, 22); c.stroke();
                c.beginPath(); c.moveTo(40, 22); c.quadraticCurveTo(46, 22, 48, 27); c.stroke();
                break;
            case 'Supplements':
                c.beginPath();
                c.roundRect(27, 32, 26, 16, 8);
                c.stroke();
                c.beginPath(); c.moveTo(40, 32); c.lineTo(40, 48); c.stroke();
                break;
            case 'Vitality':
                c.beginPath(); c.moveTo(22, 40);
                c.lineTo(30, 40); c.lineTo(33, 28); c.lineTo(40, 52);
                c.lineTo(47, 32); c.lineTo(50, 40); c.lineTo(58, 40);
                c.stroke();
                break;
            case 'Natural':
                c.beginPath(); c.arc(40, 40, 12, 0, Math.PI * 2); c.stroke();
                c.beginPath(); c.arc(40, 40, 5, 0, Math.PI * 2); c.fill();
                break;
        }

        const tex = new THREE.CanvasTexture(cvs);
        tex.minFilter = THREE.LinearFilter;
        return tex;
    }

    NODES.forEach((node, i) => {
        const pos = new THREE.Vector3(...node.pos);

        // Pulse ring
        const ringGeo = new THREE.RingGeometry(0.18, 0.23, 36);
        const ringMat = new THREE.MeshBasicMaterial({ color: C_SAGE, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
        const ring    = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.lookAt(0, 0, 0);
        globeGroup.add(ring);

        // Outer halo
        const haloGeo = new THREE.RingGeometry(0.3, 0.35, 36);
        const haloMat = new THREE.MeshBasicMaterial({ color: C_SAGE, transparent: true, opacity: 0.12, side: THREE.DoubleSide });
        const halo    = new THREE.Mesh(haloGeo, haloMat);
        halo.position.copy(pos);
        halo.lookAt(0, 0, 0);
        globeGroup.add(halo);

        // Icon sprite
        const sprite    = new THREE.Sprite(new THREE.SpriteMaterial({ map: makeNodeTexture(node.label), transparent: true, opacity: 0.95 }));
        sprite.position.copy(pos);
        sprite.scale.set(0.38, 0.38, 0.38);
        globeGroup.add(sprite);

        node.ring  = ring;
        node.halo  = halo;
        node.sprite = sprite;
        node.phase  = i * 0.78;
    });

    // ---- Lights ----
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const rim = new THREE.DirectionalLight(C_SAGE, 0.5);
    rim.position.set(5, 4, 5);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(C_FOREST, 0.25);
    fill.position.set(-5, -3, 3);
    scene.add(fill);

    // ---- Interaction ----
    let isDragging = false;
    let prevMouse  = { x: 0, y: 0 };
    let velocity   = { x: 0, y: 0 };
    const AUTO_SPEED = 0.0005;

    const onMouseDown = (x, y) => { isDragging = true; prevMouse = { x, y }; };
    const onMouseMove = (x, y) => {
        if (!isDragging) return;
        const dx = x - prevMouse.x;
        const dy = y - prevMouse.y;
        velocity.x = dx * 0.0004;
        velocity.y = dy * 0.0004;
        globeGroup.rotation.y += dx * 0.004;
        globeGroup.rotation.x += dy * 0.004;
        prevMouse = { x, y };
    };
    const onMouseUp   = () => { isDragging = false; };

    container.addEventListener('mousedown',  e => onMouseDown(e.clientX, e.clientY));
    container.addEventListener('mousemove',  e => onMouseMove(e.clientX, e.clientY));
    container.addEventListener('mouseup',    onMouseUp);
    container.addEventListener('mouseleave', onMouseUp);
    container.addEventListener('touchstart', e => onMouseDown(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    container.addEventListener('touchmove',  e => { e.preventDefault(); onMouseMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
    container.addEventListener('touchend',   onMouseUp);

    // ---- Animation ----
    let raf;
    function animate() {
        raf = requestAnimationFrame(animate);
        const t = Date.now() * 0.001;

        if (!isDragging) {
            globeGroup.rotation.y += AUTO_SPEED + velocity.x;
            globeGroup.rotation.x += velocity.y;
            velocity.x *= 0.94;
            velocity.y *= 0.94;
        }

        particles.rotation.y = t * 0.018;
        outerSphere.rotation.y -= 0.00018;
        outerSphere.rotation.x += 0.00009;

        NODES.forEach(node => {
            const s = 1 + Math.sin(t * 1.4 + node.phase) * 0.1;
            if (node.ring)  node.ring.scale.set(s, s, s);
            if (node.halo)  node.halo.scale.set(s * 1.4, s * 1.4, s * 1.4);
        });

        renderer.render(scene, camera);
    }
    animate();

    // ---- Resize ----
    window.addEventListener('resize', () => {
        const w = container.offsetWidth;
        const h = container.offsetHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }, { passive: true });
})();
