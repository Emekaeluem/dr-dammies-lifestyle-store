// ============================================
// MOBILE MENU TOGGLE
// ============================================
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Close menu when clicking a link
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

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Globe group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // --- Wireframe Sphere ---
    const sphereGeometry = new THREE.IcosahedronGeometry(2, 2);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x004723,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const wireframeSphere = new THREE.Mesh(sphereGeometry, wireframeMaterial);
    globeGroup.add(wireframeSphere);

    // --- Inner Glow Sphere ---
    const glowGeometry = new THREE.IcosahedronGeometry(1.95, 3);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xC4DA84,
        transparent: true,
        opacity: 0.08
    });
    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    globeGroup.add(glowSphere);

    // --- Connection Lines ---
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xC4DA84,
        transparent: true,
        opacity: 0.4
    });

    const vertices = sphereGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 9) {
        const points = [];
        points.push(new THREE.Vector3(vertices[i], vertices[i+1], vertices[i+2]));
        points.push(new THREE.Vector3(vertices[i+3], vertices[i+4], vertices[i+5]));
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        globeGroup.add(line);
    }

    // --- Floating Particles ---
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 2.2 + Math.random() * 0.8;
        
        particlePositions[i] = r * Math.sin(phi) * Math.cos(theta);
        particlePositions[i+1] = r * Math.sin(phi) * Math.sin(theta);
        particlePositions[i+2] = r * Math.cos(phi);
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xC4DA84,
        size: 0.03,
        transparent: true,
        opacity: 0.6
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    globeGroup.add(particles);

    // --- Wellness Nodes (Icons) ---
    const nodePositions = [
        { pos: [1.2, 0.8, 1.2], icon: '🌿' },
        { pos: [-1.3, 0.5, 1.0], icon: '💚' },
        { pos: [0.5, 1.4, -0.8], icon: '🍃' },
        { pos: [-0.8, -1.0, 1.3], icon: '✨' },
        { pos: [1.0, -1.2, -0.9], icon: '🌱' },
        { pos: [-1.1, 1.1, -0.7], icon: '💊' },
        { pos: [0.3, 0.3, 1.9], icon: '❤️' },
        { pos: [-0.5, -1.4, -0.8], icon: '🧘' }
    ];

    const nodeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    
    nodePositions.forEach(node => {
        // Glow ring
        const ringGeometry = new THREE.RingGeometry(0.2, 0.25, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xC4DA84,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(...node.pos);
        ring.lookAt(0, 0, 0);
        globeGroup.add(ring);

        // Inner dot
        const dotMaterial = new THREE.MeshBasicMaterial({
            color: 0x004723,
            transparent: true,
            opacity: 0.9
        });
        const dot = new THREE.Mesh(nodeGeometry, dotMaterial);
        dot.position.set(...node.pos);
        globeGroup.add(dot);
    });

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0xC4DA84, 0.5);
    rimLight.position.set(5, 3, 5);
    scene.add(rimLight);

    // --- Animation ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0 };
    const autoRotationSpeed = 0.001;

    function animate() {
        requestAnimationFrame(animate);

        if (!isDragging) {
            globeGroup.rotation.y += autoRotationSpeed + rotationVelocity.x;
            globeGroup.rotation.x += rotationVelocity.y;
            
            // Damping
            rotationVelocity.x *= 0.95;
            rotationVelocity.y *= 0.95;
        }

        // Pulse effect for particles
        const time = Date.now() * 0.001;
        particles.rotation.y = time * 0.05;

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

    // --- Resize ---
    window.addEventListener('resize', () => {
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });
})();
