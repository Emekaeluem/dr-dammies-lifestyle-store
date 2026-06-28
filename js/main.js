// ============================================
// MOBILE MENU TOGGLE
// ============================================
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('navLinks').classList.remove('active');
    });
});

// ============================================
// 3D WELLNESS GLOBE - Dr Dammies Style
// ============================================
(function() {
    const container = document.getElementById('globe-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.z = 5.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // --- COLORS ---
    const DEEP_GREEN = 0x004723;
    const SOFT_GREEN = 0xC4DA84;
    const WHITE = 0xFFFFFF;

    // --- Main Wireframe Sphere (dense, like your upload) ---
    const sphereGeometry = new THREE.IcosahedronGeometry(2, 4);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: DEEP_GREEN,
        wireframe: true,
        transparent: true,
        opacity: 0.18
    });
    const wireframeSphere = new THREE.Mesh(sphereGeometry, wireframeMaterial);
    globeGroup.add(wireframeSphere);

    // --- Inner Glow Sphere ---
    const glowGeometry = new THREE.IcosahedronGeometry(1.98, 5);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: SOFT_GREEN,
        transparent: true,
        opacity: 0.04
    });
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    globeGroup.add(glowSphere);

    // --- Outer faint wireframe (for depth) ---
    const outerGeometry = new THREE.IcosahedronGeometry(2.4, 2);
    const outerMaterial = new THREE.MeshBasicMaterial({
        color: SOFT_GREEN,
        wireframe: true,
        transparent: true,
        opacity: 0.06
    });
    const outerSphere = new THREE.Mesh(outerGeometry, outerMaterial);
    globeGroup.add(outerSphere);

    // --- Connection Lines (organic network feel) ---
    const lineMaterial = new THREE.LineBasicMaterial({
        color: SOFT_GREEN,
        transparent: true,
        opacity: 0.2
    });

    const vertices = sphereGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 15) {
        if (i + 6 < vertices.length) {
            const points = [];
            points.push(new THREE.Vector3(vertices[i], vertices[i+1], vertices[i+2]));
            points.push(new THREE.Vector3(vertices[i+3], vertices[i+4], vertices[i+5]));
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            globeGroup.add(line);
        }
    }

    // --- Floating Particles (many, small, subtle) ---
    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 2.2 + Math.random() * 1.5;
        
        particlePositions[i] = r * Math.sin(phi) * Math.cos(theta);
        particlePositions[i+1] = r * Math.sin(phi) * Math.sin(theta);
        particlePositions[i+2] = r * Math.cos(phi);
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: SOFT_GREEN,
        size: 0.018,
        transparent: true,
        opacity: 0.4
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    globeGroup.add(particles);

    // --- MINIMAL WELLNESS NODES (small, elegant, not colorful) ---
    // These are the icons on the globe - minimal SVG style
    const wellnessNodes = [
        { pos: [1.3, 0.8, 1.1], label: 'Organic' },
        { pos: [-1.2, 0.6, 1.3], label: 'Heart' },
        { pos: [0.4, 1.4, -0.6], label: 'Plant' },
        { pos: [-0.9, -1.0, 1.2], label: 'Wellness' },
        { pos: [1.1, -1.2, -0.8], label: 'Nutrition' },
        { pos: [-1.3, 1.0, -0.5], label: 'Supplements' },
        { pos: [0.2, 0.3, 1.9], label: 'Vitality' },
        { pos: [-0.4, -1.4, -0.9], label: 'Natural' }
    ];

    // Create minimal icon textures using canvas
    function createMinimalIcon(type) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        // Clear
        ctx.clearRect(0, 0, 64, 64);
        
        // Small circle background
        ctx.fillStyle = '#004723';
        ctx.beginPath();
        ctx.arc(32, 32, 28, 0, Math.PI * 2);
        ctx.fill();
        
        // Thin ring
        ctx.strokeStyle = '#C4DA84';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(32, 32, 24, 0, Math.PI * 2);
        ctx.stroke();
        
        // Minimal icon in white
        ctx.strokeStyle = '#FFFFFF';
        ctx.fillStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        switch(type) {
            case 'Organic':
                // Leaf
                ctx.beginPath();
                ctx.moveTo(32, 20);
                ctx.quadraticCurveTo(42, 24, 42, 32);
                ctx.quadraticCurveTo(42, 42, 32, 44);
                ctx.quadraticCurveTo(22, 42, 22, 32);
                ctx.quadraticCurveTo(22, 24, 32, 20);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(32, 20);
                ctx.lineTo(32, 38);
                ctx.stroke();
                break;
            case 'Heart':
                // Heart
                ctx.beginPath();
                ctx.moveTo(32, 42);
                ctx.bezierCurveTo(20, 34, 20, 26, 26, 22);
                ctx.bezierCurveTo(30, 20, 32, 24, 32, 24);
                ctx.bezierCurveTo(32, 24, 34, 20, 38, 22);
                ctx.bezierCurveTo(44, 26, 44, 34, 32, 42);
                ctx.fill();
                break;
            case 'Plant':
                // Sprout
                ctx.beginPath();
                ctx.moveTo(32, 44);
                ctx.lineTo(32, 28);
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(26, 26, 6, 10, -0.5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(38, 26, 6, 10, 0.5, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'Wellness':
                // Shield
                ctx.beginPath();
                ctx.moveTo(32, 18);
                ctx.lineTo(44, 24);
                ctx.lineTo(44, 34);
                ctx.quadraticCurveTo(44, 44, 32, 48);
                ctx.quadraticCurveTo(20, 44, 20, 34);
                ctx.lineTo(20, 24);
                ctx.closePath();
                ctx.stroke();
                break;
            case 'Nutrition':
                // Apple
                ctx.beginPath();
                ctx.arc(32, 34, 12, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(32, 22);
                ctx.lineTo(32, 16);
                ctx.stroke();
                ctx.beginPath();
                ctx.quadraticCurveTo(36, 16, 38, 20);
                ctx.stroke();
                break;
            case 'Supplements':
                // Pill
                ctx.beginPath();
                ctx.rect(24, 26, 16, 12, 6);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(32, 26);
                ctx.lineTo(32, 38);
                ctx.stroke();
                break;
            case 'Vitality':
                // Heartbeat
                ctx.beginPath();
                ctx.moveTo(20, 32);
                ctx.lineTo(26, 32);
                ctx.lineTo(28, 24);
                ctx.lineTo(32, 40);
                ctx.lineTo(36, 28);
                ctx.lineTo(38, 32);
                ctx.lineTo(44, 32);
                ctx.stroke();
                break;
            case 'Natural':
                // Leaf/flower
                ctx.beginPath();
                ctx.arc(32, 32, 10, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(32, 32, 4, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        return texture;
    }

    wellnessNodes.forEach((node, index) => {
        const pos = new THREE.Vector3(...node.pos);
        
        // Small glow ring (subtle)
        const ringGeometry = new THREE.RingGeometry(0.18, 0.22, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: SOFT_GREEN,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(pos);
        ring.lookAt(0, 0, 0);
        globeGroup.add(ring);

        // Outer faint glow
        const outerGlowGeometry = new THREE.RingGeometry(0.28, 0.32, 32);
        const outerGlowMaterial = new THREE.MeshBasicMaterial({
            color: SOFT_GREEN,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
        outerGlow.position.copy(pos);
        outerGlow.lookAt(0, 0, 0);
        globeGroup.add(outerGlow);

        // Icon sprite (small, not big)
        const texture = createMinimalIcon(node.label);
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            opacity: 0.95
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.copy(pos);
        sprite.scale.set(0.35, 0.35, 0.35);
        globeGroup.add(sprite);

        // Store for animation
        node.ring = ring;
        node.outerGlow = outerGlow;
        node.sprite = sprite;
        node.basePos = pos.clone();
        node.phase = index * 0.8;
    });

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(SOFT_GREEN, 0.4);
    rimLight.position.set(5, 3, 5);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(DEEP_GREEN, 0.2);
    fillLight.position.set(-5, -2, 3);
    scene.add(fillLight);

    // --- Animation ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0 };
    const autoRotationSpeed = 0.0006;

    function animate() {
        requestAnimationFrame(animate);

        if (!isDragging) {
            globeGroup.rotation.y += autoRotationSpeed + rotationVelocity.x;
            globeGroup.rotation.x += rotationVelocity.y;
            
            rotationVelocity.x *= 0.95;
            rotationVelocity.y *= 0.95;
        }

        // Animate particles slowly
        const time = Date.now() * 0.001;
        particles.rotation.y = time * 0.02;

        // Gentle pulse for nodes
        wellnessNodes.forEach((node) => {
            const pulse = 1 + Math.sin(time * 1.5 + node.phase) * 0.08;
            if (node.ring) node.ring.scale.set(pulse, pulse, pulse);
            if (node.outerGlow) node.outerGlow.scale.set(pulse * 1.3, pulse * 1.3, pulse * 1.3);
        });

        // Slow outer sphere rotation
        outerSphere.rotation.y -= 0.0002;
        outerSphere.rotation.x += 0.0001;

        renderer.render(scene, camera);
    }
    animate();

    // --- Mouse Interaction ---
    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaMove = {
            x: e.clientX - previousMousePosition.x,
            y: e.clientY - previousMousePosition.y
        };

        rotationVelocity.x = deltaMove.x * 0.0005;
        rotationVelocity.y = deltaMove.y * 0.0005;

        globeGroup.rotation.y += deltaMove.x * 0.005;
        globeGroup.rotation.x += deltaMove.y * 0.005;

        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mouseup', () => {
        isDragging = false;
    });

    container.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    // Touch support
    container.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    container.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const deltaMove = {
            x: e.touches[0].clientX - previousMousePosition.x,
            y: e.touches[0].clientY - previousMousePosition.y
        };

        rotationVelocity.x = deltaMove.x * 0.0005;
        rotationVelocity.y = deltaMove.y * 0.0005;

        globeGroup.rotation.y += deltaMove.x * 0.005;
        globeGroup.rotation.x += deltaMove.y * 0.005;

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    container.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Resize
    window.addEventListener('resize', () => {
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
})();
