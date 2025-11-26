(function () {
  const size = 64; // favicon canvas size

  // Scene & transparent renderer
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    1,
    0.1,
    1000
  );
  // angled camera: height 2.9, distance 3.8
  camera.position.set(0, 2.9, 3.8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(1);
  renderer.setSize(size, size);
  renderer.setClearColor(0x000000, 0); // transparent background

  // Group for the globe so we can tilt it
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // Slight tilt so rotation is clearly visible
  globeGroup.rotation.x = 0.45;

  // EXTRA LOW POLY square/lat-long grid globe in purple
  const radius = 1.4;
  const latSteps = 6;  // fewer steps = chunkier bands
  const lonSteps = 8;  // fewer meridians = bigger squares

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xbf5fff, // purple
    transparent: true,
    opacity: 1.0
  });

  // Latitudes
  for (let i = 1; i < latSteps; i++) {
    const phi = (i / latSteps) * Math.PI - Math.PI / 2; // -pi/2..pi/2
    const segments = lonSteps;
    const positions = [];
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      const x = radius * Math.cos(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi);
      const z = radius * Math.cos(phi) * Math.sin(theta);
      positions.push(x, y, z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const line = new THREE.LineLoop(geo, lineMaterial);
    globeGroup.add(line);
  }

  // Longitudes
  for (let i = 0; i < lonSteps; i++) {
    const theta = (i / lonSteps) * Math.PI * 2;
    const segments = latSteps;
    const positions = [];
    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      const phi = t * Math.PI - Math.PI / 2;
      const x = radius * Math.cos(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi);
      const z = radius * Math.cos(phi) * Math.sin(theta);
      positions.push(x, y, z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const line = new THREE.Line(geo, lineMaterial);
    globeGroup.add(line);
  }

  const faviconEl = (function () {
    let el = document.getElementById("globe-favicon");
    if (!el) {
      el = document.createElement("link");
      el.id = "globe-favicon";
      el.rel = "icon";
      document.head.appendChild(el);
    }
    return el;
  })();

  const speed = 0.004; // clockwise

  function updateFavicon() {
    renderer.render(scene, camera);
    faviconEl.href = renderer.domElement.toDataURL("image/png");
  }

  function animate() {
    requestAnimationFrame(animate);

    // Spin + slight wobble so motion is obvious even at favicon size
    globeGroup.rotation.y -= speed;
    globeGroup.rotation.z += speed * 0.5;

    updateFavicon();
  }

  animate();
})();
