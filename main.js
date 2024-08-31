import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

document.getElementById('darkModeToggle').addEventListener('change', function () {
  const isChecked = this.checked;
  const modeIndicator = document.getElementById('modeIndicator');
  
  if (isChecked) {
    bgImage2.style.opacity = '1';
    bgImage1.style.opacity = '0';
    modeIndicator.textContent = 'Light Mode'; // Mettre à jour le texte
  } else {
    bgImage2.style.opacity = '0';
    bgImage1.style.opacity = '1';
    modeIndicator.textContent = 'Dark Mode'; // Mettre à jour le texte
  }
});


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass({ x: 0.8, y: 0.8 }, 1.5, 0.4, 0.85));

// Torus Geometry (Circle around Jupiter)
const geometry = new THREE.TorusGeometry(4, 0.5, 2, 100);
const circleTexture = new THREE.TextureLoader().load('cercle.jpg');
const material = new THREE.MeshStandardMaterial({ map: circleTexture });
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);

// Lighting
const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0x404040, 3); // Augmente l'intensité
scene.add(pointLight, ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(-10, 10, 10);
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);

// Starry Background
function addStar() {
  const starTexture = new THREE.TextureLoader().load('star.png');
  const material = new THREE.SpriteMaterial({
    map: starTexture,
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  });

  const star = new THREE.Sprite(material);
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  star.scale.set(1.5, 1.5, 1.5);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

// Space Background
const spaceTexture = new THREE.TextureLoader().load('space.jpg');
const nightTexture = new THREE.TextureLoader().load('night.jpg');




scene.background = spaceTexture;

document.getElementById('darkModeToggle').addEventListener('click', () => {
  if (scene.background === spaceTexture) {
      scene.background = nightTexture;
  } else {
      scene.background = spaceTexture;
  }
});

// Profile Picture
const naderTexture = new THREE.TextureLoader().load('me.png');
const nader = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3),
  new THREE.MeshBasicMaterial({ map: naderTexture })
);
scene.add(nader);

// Moon Geometry
const moonTexture = new THREE.TextureLoader().load('moon.png');
const normalTexture = new THREE.TextureLoader().load('normal.jpg');
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
  })
);
scene.add(moon);

moon.position.z = 30;
moon.position.setX(-10);

// Rotating Planets Function
function addRotatingPlanet(texture, size, orbitRadius) {
  const planetTexture = new THREE.TextureLoader().load(texture);
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(size, 32, 32),
    new THREE.MeshStandardMaterial({ map: planetTexture })
  );
  scene.add(planet);

  planet.userData = {
    angle: Math.random() * Math.PI * 2,
    orbitRadius: orbitRadius,
    speed: 0.01 + Math.random() * 0.02,
  };

  return planet;
}

// Add Planets
const planets = [
  addRotatingPlanet('earth.jpg', 1.5, 20),
  addRotatingPlanet('mars.jpg', 1.2, 25),
];

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.05;
  moon.rotation.y += 0.075;
  moon.rotation.z += 0.05;

  nader.rotation.y += 0.01;
  nader.rotation.z += 0.01;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;

function animate() {
  requestAnimationFrame(animate);
  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  // Animate Planets
  planets.forEach(planet => {
    planet.userData.angle += planet.userData.speed;
    planet.position.x = Math.cos(planet.userData.angle) * planet.userData.orbitRadius;
    planet.position.z = Math.sin(planet.userData.angle) * planet.userData.orbitRadius;
  });
  animateSpaceship();

  controls.update();
  composer.render();

  camera.position.x += (mouseX * 10 - camera.position.x) * 0.05;
  camera.position.y += (mouseY * 10 - camera.position.y) * 0.05;
}


// Load spaceship texture
const spaceshipTexture = new THREE.TextureLoader().load('spaceship.png');

// Create spaceship geometry and material
const spaceshipGeometry = new THREE.BoxGeometry(2, 1, 4); // Basic spaceship shape
const spaceshipMaterial = new THREE.MeshStandardMaterial({
  map: spaceshipTexture,
  transparent: true,
});

// Create spaceship mesh
const spaceship = new THREE.Mesh(spaceshipGeometry, spaceshipMaterial);
spaceship.position.set(0, 0, -20); // Initial position
scene.add(spaceship);



// Fonction pour créer une étoile filante
function createShootingStar() {
  const geometry = new THREE.SphereGeometry(0.2, 8, 8); // Petite sphère pour l'étoile filante
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const star = new THREE.Mesh(geometry, material);

  // Position initiale aléatoire
  star.position.set(
    THREE.MathUtils.randFloatSpread(100),
    THREE.MathUtils.randFloatSpread(100),
    THREE.MathUtils.randFloatSpread(100)
  );

  // Direction aléatoire
  star.userData.direction = new THREE.Vector3(
    THREE.MathUtils.randFloatSpread(2),
    THREE.MathUtils.randFloatSpread(2),
    THREE.MathUtils.randFloatSpread(2)
  ).normalize();

  // Vitesse aléatoire
  star.userData.speed = 0.3 + Math.random() * 0.3;

  return star;
}

// Ajouter les étoiles filantes à la scène
const shootingStars = Array(10).fill().map(createShootingStar);
shootingStars.forEach(star => scene.add(star));

// Fonction d'animation des étoiles filantes
function animateShootingStars() {
  shootingStars.forEach(star => {
    star.position.add(star.userData.direction.clone().multiplyScalar(star.userData.speed));

    // Si l'étoile sort de la scène, repositionner
    if (Math.abs(star.position.x) > 50 || Math.abs(star.position.y) > 50 || Math.abs(star.position.z) > 50) {
      star.position.set(
        THREE.MathUtils.randFloatSpread(100),
        THREE.MathUtils.randFloatSpread(100),
        THREE.MathUtils.randFloatSpread(100)
      );
    }
  });

  // Appel récursif pour l'animation continue
  requestAnimationFrame(animateShootingStars);
}

// Démarrer l'animation des étoiles filantes
animateShootingStars()








// Spaceship animation
function animateSpaceship() {
  spaceship.position.x += 0.05 * Math.sin(Date.now() * 0.001);
  spaceship.position.y += 0.05 * Math.cos(Date.now() * 0.001);
  spaceship.position.z += 0.1 * Math.sin(Date.now() * 0.001);

  spaceship.rotation.y += 0.01;

  console.log(`Spaceship position: ${spaceship.position.x}, ${spaceship.position.y}, ${spaceship.position.z}`);

}


// Variables pour stocker les coordonnées de la souris
let mouseX = 0;
let mouseY = 0;

// Écouteur d'événements pour les mouvements de la souris
document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});




renderer.gammaFactor = 2.2;
renderer.gammaOutput = true;
renderer.outputEncoding = THREE.sRGBEncoding;
composer.addPass(new UnrealBloomPass({ x: 0.1, y: 0.1 }, 0, 0, 0.1));

const bgImage1 = document.createElement('img');
bgImage1.src = 'space.jpg';
bgImage1.id = 'backgroundImage1';
document.body.appendChild(bgImage1);

const bgImage2 = document.createElement('img');
bgImage2.src = 'night.jpg';
bgImage2.id = 'backgroundImage2';
document.body.appendChild(bgImage2);

document.getElementById('darkModeToggle').addEventListener('change', function () {
  const isChecked = this.checked;
  
  if (isChecked) {
    bgImage2.style.opacity = '1';
    bgImage1.style.opacity = '0';
  } else {
    bgImage2.style.opacity = '0';
    bgImage1.style.opacity = '1';
  }
});



const sections = document.querySelectorAll("section");
const menuLinks = document.querySelectorAll(".vertical-menu a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    if (scrollY >= sectionTop - 60) {
      current = section.getAttribute("id");
    }
  });

  menuLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").includes(current)) {
      link.classList.add("active");
    }
  });
});



animate();
