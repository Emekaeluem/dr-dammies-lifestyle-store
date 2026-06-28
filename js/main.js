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
// 3D WELLNESS GLOBE
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

    // --- Wireframe Sphere (denser) ---
    const sphereGeometry = new THREE.IcosahedronGeometry(2, 3);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x004723,
        wireframe: true,
        transparent: true,
        opacity: 0.25
    });
    const wireframeSphere = new THREE.Mesh(sphereGeometry, wireframeMaterial);
    globeGroup.add(wireframeSphere);

    // --- Inner Glow Sphere ---
    const glowGeometry = new THREE.IcosahedronGeometry(1.95, 4);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xC4DA84,
        transparent: true,
        opacity: 0.06
    });
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    globeGroup.add(glowSphere);

    // --- Outer Wireframe (second layer for depth) ---
    const outerGeometry = new THREE.IcosahedronGeometry(2.3, 2);
    const outerMaterial = new THREE.MeshBasicMaterial({
        color: 0xC4DA84,
        wireframe: true,
        transparent: true,
        opacity: 0.08
    });
    const outerSphere = new THREE.Mesh(outerGeometry, outerMaterial);
    globeGroup.add(outerSphere);

    // --- Connection Lines between vertices ---
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xC4DA84,
        transparent: true,
        opacity: 0.3
    });

    const vertices = sphereGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 12) {
        if (i + 6 < vertices.length) {
            const points = [];
            points.push(new THREE.Vector3(vertices[i], vertices[i+1], vertices[i+2]));
            points.push(new THREE.Vector3(vertices[i+3], vertices[i+4], vertices[i+5]));
            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeometry, lineMaterial);
            globeGroup.add(line);
        }
    }

    // --- Floating Particles (more dense) ---
    const particleCount = 400;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 2.3 + Math.random() * 1.2;
        
        particlePositions[i] = r * Math.sin(phi) * Math.cos(theta);
        particlePositions[i+1] = r * Math.sin(phi) * Math.sin(theta);
        particlePositions[i+2] = r * Math.cos(phi);
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xC4DA84,
        size: 0.025,
        transparent: true,
        opacity: 0.5
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    globeGroup.add(particles);

    // --- Wellness Nodes with Custom SVG Icons ---
    const wellnessNodes = [
        { pos: [1.4, 0.9, 1.1], icon: 'leaf', label: 'Organic' },
        { pos: [-1.2, 0.6, 1.3], icon: 'heart', label: 'Heart Health' },
        { pos: [0.4, 1.5, -0.6], icon: 'plant', label: 'Plant-Based' },
        { pos: [-0.9, -1.1, 1.2], icon: 'shield', label: 'Wellness' },
        { pos: [1.1, -1.3, -0.8], icon: 'apple', label: 'Healthy Eating' },
        { pos: [-1.3, 1.0, -0.5], icon: 'pill', label: 'Supplements' },
        { pos: [0.2, 0.3, 1.9], icon: 'heart-pulse', label: 'Vitality' },
        { pos: [-0.4, -1.4, -0.9], icon: 'sprout', label: 'Natural' }
    ];

    // Create SVG textures for icons
    function createIconTexture(svgContent) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Draw circle background
        ctx.fillStyle = '#004723';
        ctx.beginPath();
        ctx.arc(64, 64, 60, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw glow ring
        ctx.strokeStyle = '#C4DA84';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(64, 64, 56, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw icon
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(svgContent, 64, 64);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    // Simple icon mapping
    const iconMap = {
        'leaf': '🌿',
        'heart': '❤️',
        'plant': '🌱',
        'shield': '🛡️',
        'apple': '🍎',
        'pill': '💊',
        'heart-pulse': '💚',
        'sprout': '🌾'
    };

    wellnessNodes.forEach((node, index) => {
        const pos = new THREE.Vector3(...node.pos);
        
        // Glow ring
        const ringGeometry = new THREE.RingGeometry(0.22, 0.28, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xC4DA84,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(pos);
        ring.lookAt(0, 0, 0);
        globeGroup.add(ring);

        // Outer glow
        const outerGlowGeometry = new THREE.RingGeometry(0.32, 0.38, 32);
        const outerGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0xC4DA84,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
        outerGlow.position.copy(pos);
        outerGlow.lookAt(0, 0, 0);
        globeGroup.add(outerGlow);

        // Icon sprite
        const texture = createIconTexture(iconMap[node.icon] || '✨');
        const spriteMaterial = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            opacity: 0.95
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.copy(pos);
        sprite.scale.set(0.5, 0.5, 0.5);
        globeGroup.add(sprite);

        // Store for animation
        node.ring = ring;
        node.outerGlow = outerGlow;
        node.sprite = sprite;
        node.basePos = pos.clone();
    });

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0xC4DA84, 0.6);
    rimLight.position.set(5, 3, 5);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0x004723, 0.3);
    fillLight.position.set(-5, -2, 3);
    scene.add(fillLight);

    // --- Animation ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0 };
    const autoRotationSpeed = 0.0008;

    function animate() {
        requestAnimationFrame(animate);

        if (!isDragging) {
            globeGroup.rotation.y += autoRotationSpeed + rotationVelocity.x;
            globeGroup.rotation.x += rotationVelocity.y;
            
            rotationVelocity.x *= 0.95;
            rotationVelocity.y *= 0.95;
        }

        // Animate particles
        const time = Date.now() * 0.001;
        particles.rotation.y = time * 0.03;

        // Pulse nodes
        wellnessNodes.forEach((node, i) => {
            const pulse = 1 + Math.sin(time * 2 + i) * 0.1;
            if (node.ring) node.ring.scale.set(pulse, pulse, pulse);
            if (node.outerGlow) node.outerGlow.scale.set(pulse * 1.2, pulse * 1.2, pulse * 1.2);
        });

        // Rotate outer sphere slowly
        outerSphere.rotation.y -= 0.0003;
        outerSphere.rotation.x += 0.0002;

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
