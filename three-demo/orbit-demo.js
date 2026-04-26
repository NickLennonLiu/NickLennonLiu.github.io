const canvas = document.getElementById('orbit-canvas');
const status = document.getElementById('status');

let THREE;

try {
  THREE = await import('/lib/three.js');
} catch (localError) {
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js');
  } catch (cdnError) {
    status.textContent = `Unable to load Three.js: ${cdnError.message || localError.message}`;
    throw cdnError;
  }
}

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});

renderer.setClearColor(0x000000, 0);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
const clock = new THREE.Clock();
const root = new THREE.Group();

camera.position.set(0, 3.9, 8.8);
camera.lookAt(0, 0, 0);

scene.add(root);
scene.add(new THREE.AmbientLight(0xffffff, 1.6));

const keyLight = new THREE.DirectionalLight(0xffffff, 3.3);
keyLight.position.set(4, 5, 5);
scene.add(keyLight);

const fillLight = new THREE.PointLight(0x86d9ff, 5.2, 16);
fillLight.position.set(-4.2, 1.8, -3.5);
scene.add(fillLight);

const orbitRadius = 2.25;
const objects = [
  {
    phase: 0,
    speed: 0.74,
    mesh: new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 48, 32),
      new THREE.MeshStandardMaterial({ color: 0x45c8ff, roughness: 0.32, metalness: 0.14 })
    )
  },
  {
    phase: Math.PI * 2 / 3,
    speed: 0.88,
    mesh: new THREE.Mesh(
      new THREE.TetrahedronGeometry(0.82, 0),
      new THREE.MeshStandardMaterial({ color: 0xffc857, roughness: 0.46, metalness: 0.12 })
    )
  },
  {
    phase: Math.PI * 4 / 3,
    speed: 0.66,
    mesh: new THREE.Mesh(
      new THREE.BoxGeometry(1.04, 1.04, 1.04),
      new THREE.MeshStandardMaterial({ color: 0x83ef86, roughness: 0.38, metalness: 0.12 })
    )
  }
];

objects.forEach(({ mesh }) => root.add(mesh));

const orbitLine = new THREE.Line(
  new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: 181 }, (_, index) => {
      const angle = index / 180 * Math.PI * 2;
      return new THREE.Vector3(
        Math.cos(angle) * orbitRadius,
        0,
        Math.sin(angle) * orbitRadius
      );
    })
  ),
  new THREE.LineBasicMaterial({ color: 0x9ab7cc, transparent: true, opacity: 0.38 })
);

const connector = new THREE.LineLoop(
  new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3()
  ]),
  new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.26 })
);

root.add(orbitLine);
root.add(connector);

function resize() {
  const width = window.innerWidth || 1;
  const height = window.innerHeight || 1;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function animate() {
  const elapsed = clock.getElapsedTime();

  root.rotation.y = elapsed * 0.2;
  root.rotation.x = Math.sin(elapsed * 0.35) * 0.13;

  objects.forEach(({ mesh, phase, speed }, index) => {
    const angle = elapsed * speed + phase;
    mesh.position.set(
      Math.cos(angle) * orbitRadius,
      Math.sin(elapsed * 0.9 + phase) * 0.55,
      Math.sin(angle) * orbitRadius
    );
    mesh.rotation.x += 0.012 + index * 0.004;
    mesh.rotation.y += 0.018 + index * 0.005;
  });

  const positions = connector.geometry.attributes.position;
  objects.forEach(({ mesh }, index) => {
    positions.setXYZ(index, mesh.position.x, mesh.position.y, mesh.position.z);
  });
  positions.needsUpdate = true;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', resize);
resize();
status.dataset.state = 'ready';
animate();
