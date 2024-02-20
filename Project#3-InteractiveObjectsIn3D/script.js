import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.module.min.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'
import { DragControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/DragControls.js';
let camera, scene, renderer, cube;
let dragControls;
let orbitControls;
let draggableObjects = [];
initHTML();
init3D();

function init3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    let bgGeometery = new THREE.SphereGeometry(1000, 60, 40);
    bgGeometery.scale(-1, 1, 1);
    let panotexture = new THREE.TextureLoader().load("backgroundImg.jpeg");
    let backMaterial = new THREE.MeshBasicMaterial({ map: panotexture });
    let back = new THREE.Mesh(bgGeometery, backMaterial);
    scene.add(back);
    dragControls = new DragControls(draggableObjects, camera, renderer.domElement);
    orbitControls = new OrbitControls(camera, renderer.domElement);
    camera.position.z = .1;
    animate();
}

function animate() {
    orbitControls.update();
    for (let i = 0; i < draggableObjects.length; i++) {
        draggableObjects[i].lookAt(camera.position);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

function initHTML() {
    window.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            let mouse = { x: window.innerWidth / 2 - 75, y: window.innerHeight / 2 - 75};
            const pos = find3DCoornatesInFrontOfCamera(100, mouse);
            createNewText(generateRandomColor(), pos);
            console.log(generateRandomColor());
        }
    });
}

function find3DCoornatesInFrontOfCamera(distance, mouse) {
    let vector = new THREE.Vector3();
    vector.set(
        (mouse.x / window.innerWidth) * 2 - 1,
        - (mouse.y / window.innerHeight) * 2 + 1,
        0
    );
    vector.unproject(camera);
    vector.multiplyScalar(distance)
    return vector;
}

function createNewText(text_msg, posInWorld) {
    console.log("Created New Text", posInWorld);
    var canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    var context = canvas.getContext("2d");
    context.fillStyle = text_msg;
    context.beginPath();
    context.arc(50, 50, 50, 0, 2 * Math.PI);
    context.fill();
    var textTexture = new THREE.Texture(canvas);
    textTexture.needsUpdate = true;
    var material = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
    var geo = new THREE.PlaneGeometry(1, 1);
    var mesh = new THREE.Mesh(geo, material);

    mesh.position.x = posInWorld.x;
    mesh.position.y = posInWorld.y;
    mesh.position.z = posInWorld.z;

    console.log(posInWorld);
    mesh.lookAt(0, 0, 0);
    mesh.scale.set(10, 10, 10);
    scene.add(mesh);
    mesh.lookAt(0, 0, 0);
    draggableObjects.push(mesh);
}

function generateRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}