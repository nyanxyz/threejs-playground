import * as THREE from "three";
import { DragControls } from "three/examples/jsm/controls/DragControls.js";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#F4F7EE");

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster();

/**
 * Texture
 */
const loader = new THREE.TextureLoader();
const textures = [
  loader.load("./texture0.png"),
  loader.load("./texture1.png"),
  loader.load("./texture2.png"),
  loader.load("./texture3.png"),
  loader.load("./texture4.png"),
  loader.load("./texture5.png"),
  loader.load("./texture6.png"),
  loader.load("./texture7.png"),
  loader.load("./texture8.png"),
  loader.load("./texture9.png"),
];

/**
 * Objects
 */
const xPositions = [0, 0.05, 0.25, 0.15, 0.1, 0.25, 0.2, -0.1, 0, -0.3];
const objects = xPositions.map((x, i) => {
  const materials = [
    new THREE.MeshBasicMaterial(),
    new THREE.MeshBasicMaterial(),
    new THREE.MeshBasicMaterial(),
    new THREE.MeshBasicMaterial(),
    new THREE.MeshBasicMaterial({ map: textures[i] }),
    new THREE.MeshBasicMaterial(),
  ];

  const object = new THREE.Mesh(new THREE.BoxGeometry(1, 0.15, 0.5), materials);
  object.position.x = x;
  object.position.y = -0.8 + 0.155 * i;

  object.userData.x = object.position.x;
  object.userData.y = object.position.y;
  object.userData.z = object.position.z;
  object.userData.index = i;

  return object;
});

scene.add(...objects);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  const aspectRatio = sizes.width / sizes.height;

  // Update camera
  camera.left = -aspectRatio;
  camera.right = aspectRatio;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const aspectRatio = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera(
  -aspectRatio,
  aspectRatio,
  1,
  -1,
  0.1,
  100
);
camera.position.z = 3;
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
const controls = new DragControls(objects, camera, renderer.domElement);

let isDragging = false;

controls.addEventListener("dragstart", function () {
  isDragging = true;
});
controls.addEventListener("dragend", function () {
  isDragging = false;
});

controls.addEventListener("drag", function (event) {
  const position = event.object.position;

  if (position.x > -0.01 && position.x < 0.01) {
    position.x = 0;
  } else {
    position.x = Math.min(0.4, Math.max(-0.4, position.x));
  }
  position.y = event.object.userData.y;
  position.z = event.object.userData.z;

  const diff = position.x - event.object.userData.x;

  for (let i = event.object.userData.index + 1; i < objects.length; i++) {
    const object = objects[i];
    object.position.x += diff;
    object.userData.x = object.position.x;
  }

  event.object.userData.x = position.x;
});

/**
 * Mouse
 */
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

let success = false;

/**
 * Animate
 */
const tick = () => {
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(objects);

  if (intersects.length > 0) {
    document.body.style.cursor = "pointer";
  } else {
    document.body.style.cursor = "default";
  }

  if (
    !isDragging &&
    objects.every(
      (object) => object.position.x > -0.01 && object.position.x < 0.01
    )
  ) {
    if (!success) {
      alert("CLEAR");
    }
    success = true;
  }

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
