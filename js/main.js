import * as THREE from 'three';

const SCENE_SIZE = 800;
const HALF_SCENE_SIZE = SCENE_SIZE / 2;
const INITIAL_OBJECT_SIZE = 200;
const SHRINK_FACTOR = 0.5;
const MIN_VISIBLE_SIZE = 2;
const INITIAL_SPEED = 250; 

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.OrthographicCamera(
  -HALF_SCENE_SIZE, HALF_SCENE_SIZE,
  HALF_SCENE_SIZE, -HALF_SCENE_SIZE,
  0.1, 10
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(SCENE_SIZE, SCENE_SIZE);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const dvdTexture = textureLoader.load('DvD.png');
dvdTexture.colorSpace = THREE.SRGBColorSpace;

const dvdGeometry = new THREE.PlaneGeometry(INITIAL_OBJECT_SIZE, INITIAL_OBJECT_SIZE);
const dvdMaterial = new THREE.MeshBasicMaterial({ map: dvdTexture });
const dvdMesh = new THREE.Mesh(dvdGeometry, dvdMaterial);
dvdMesh.position.set(0, 0, 0); // always starts at the origin
scene.add(dvdMesh);

const velocity = new THREE.Vector2(1, 0.8).normalize().multiplyScalar(INITIAL_SPEED);
let currentSize = INITIAL_OBJECT_SIZE;
let bounceCount = 0;

function changeToRandomColor() {
  dvdMaterial.color.setHSL(Math.random(), 1, 0.5);
}

function shrinkObject() {
  currentSize *= SHRINK_FACTOR;
  dvdMesh.scale.setScalar(currentSize / INITIAL_OBJECT_SIZE);

  if (currentSize < MIN_VISIBLE_SIZE) {
    dvdMesh.visible = false;
  }
}

function handleBounce() {
  bounceCount++;
  changeToRandomColor();
  shrinkObject();
}

function updatePosition(deltaTime) {
  dvdMesh.position.x += velocity.x * deltaTime;
  dvdMesh.position.y += velocity.y * deltaTime;

  const halfObjectSize = currentSize / 2;
  const maxPosition = HALF_SCENE_SIZE - halfObjectSize;
  let hasHitBound = false;

  if (dvdMesh.position.x > maxPosition) {
    dvdMesh.position.x = maxPosition;
    velocity.x = -Math.abs(velocity.x);
    hasHitBound = true;
  } else if (dvdMesh.position.x < -maxPosition) {
    dvdMesh.position.x = -maxPosition;
    velocity.x = Math.abs(velocity.x);
    hasHitBound = true;
  }

  if (dvdMesh.position.y > maxPosition) {
    dvdMesh.position.y = maxPosition;
    velocity.y = -Math.abs(velocity.y);
    hasHitBound = true;
  } else if (dvdMesh.position.y < -maxPosition) {
    dvdMesh.position.y = -maxPosition;
    velocity.y = Math.abs(velocity.y);
    hasHitBound = true;
  }

  if (hasHitBound) {
    handleBounce();
  }
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  if (dvdMesh.visible) {
    updatePosition(clock.getDelta());
  }

  renderer.render(scene, camera);
}

animate();