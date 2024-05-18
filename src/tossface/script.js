import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();

/**
 * Model
 */
const gltfLoader = new GLTFLoader();

/**
 * Objects
 */
const objects = [];

function gaussianRandom(mean = 0, stdev = 1) {
  let u = 1 - Math.random();
  let v = 1 - Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

gltfLoader.load("../models/Duck/glTF-Binary/Duck.glb", (gltf) => {
  const model = gltf.scene;

  for (let i = 0; i < 300; i++) {
    const object = model.clone();

    object.position.x = gaussianRandom(0, 10);
    object.position.y = gaussianRandom(0, 10);
    object.position.z = gaussianRandom(0, 10);

    object.rotation.x = Math.random() * 2 * Math.PI;
    object.rotation.y = Math.random() * 2 * Math.PI;
    object.rotation.z = Math.random() * 2 * Math.PI;

    const scale = Math.random() + 0.5;
    object.scale.set(scale, scale, scale);

    scene.add(object);
    objects.push(object);
  }
});

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight("#ffffff", 0.9);
scene.add(ambientLight);

// Directional light
const directionalLight = new THREE.DirectionalLight("#ffffff", 2.1);
directionalLight.position.set(1, 2, 3);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera
 */
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(75, aspectRatio, 1, 100);
camera.position.z = 15;
scene.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Drag Controls
 */
const controls = new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.maxDistance = 35;

/**
 * Mouse
 */
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

/**
 * Animate
 */
const tick = () => {
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster
    .intersectObjects(objects)
    .map((intersect) => intersect.object.parent.parent);

  for (const intersect of intersects) {
    intersect.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.05);
  }

  for (const object of objects) {
    if (!intersects.find((intersect) => intersect === object)) {
      object.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05);
    }
  }

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

/**
 * Event Listeners
 */
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  const aspectRatio = sizes.width / sizes.height;

  // Update camera
  camera.aspect = aspectRatio;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
