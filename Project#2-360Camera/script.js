import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.module.min.js';
let camera, scene, renderer;

initHTML();
init3D();

function init3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('THREEcontainer').appendChild(renderer.domElement)
    createPanoVideo("ieproject2_22.mp4")
    moveCameraWithMouse();
    camera.position.z = 0;
    animate();
}

function createPanoVideo(filename) {
    let geometry = new THREE.SphereGeometry(1000, 60, 40);
    geometry.scale(- 1, 1, 1);
    let videoElement = document.createElement('video');
    videoElement.crossOrigin = 'anonymous';
    videoElement.loop = false;
    videoElement.muted = false;
    videoElement.src = filename;
    videoElement.setAttribute('webkit-playsinline', 'webkit-playsinline');
    videoElement.pause();
    videoElement.style.filter = "brightness(50%)";
    let videoTexture = new THREE.VideoTexture(videoElement);
    var material = new THREE.MeshBasicMaterial({ map: videoTexture });
    let mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    document.getElementById('startButton').addEventListener('click', function() {
        document.getElementById('startButton').style.display = 'none';
        document.getElementById('THREEcontainer').style.backgroundColor = 'transparent';
        document.getElementById('textBox').style.display = 'none';
        videoElement.play();
    });
    videoElement.addEventListener('ended', function() {
        location.reload();
    });
    window.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            if (videoElement.paused) {
                videoElement.play();
            } else {
                videoElement.pause();
            }
        }
    });
}

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

function initHTML() {
    const THREEcontainer = document.createElement("div");
    THREEcontainer.setAttribute("id", "THREEcontainer");
    document.body.appendChild(THREEcontainer);
    THREEcontainer.style.position = "absolute";
    THREEcontainer.style.top = "0";
    THREEcontainer.style.left = "0";
    THREEcontainer.style.width = "100%";
    THREEcontainer.style.height = "100%";
    THREEcontainer.style.zIndex = "1";

    const startButton = document.createElement("button");
    startButton.setAttribute("id", "startButton");
    startButton.innerText = "Start";
    startButton.style.position = "absolute";
    startButton.style.fontFamily = "'Courier New', monospace";
    startButton.style.color = "red";
    startButton.style.fontSize = "24px";
    startButton.style.backgroundColor = "#340002";
    startButton.style.border = "none";
    startButton.style.padding = "15px 32px";
    startButton.style.boxShadow = "0 0 20px 5px #340002";
    startButton.style.textAlign = "center";
    startButton.style.textDecoration = "none";
    startButton.style.borderRadius = "12px";
    startButton.style.top = "50%";
    startButton.style.left = "50%";
    startButton.style.transform = "translate(-50%, -50%)";
    startButton.style.zIndex = "2";
    startButton.addEventListener('mouseover', function() {
        startButton.style.backgroundColor = "red";
        startButton.style.color = "white";
        startButton.style.boxShadow = "0 0 20px 5px red";
        startButton.style.transition = "0.5s";
        startButton.style.cursor = "pointer";
    });
    
    startButton.addEventListener('mouseout', function() {
        startButton.style.backgroundColor = "#340002";
        startButton.style.color = "red";
        startButton.style.boxShadow = "0 0 20px 5px #340002";
        startButton.style.transition = "0.5s";
        startButton.style.cursor = "pointer";
    });
    document.body.appendChild(startButton);

    const introText = document.createElement("div");
    introText.innerText = "Content Warning: This video contains potentially scary and/or claustrophobic elements, viewer discretion is advised.";
    introText.style.position = "absolute";
    introText.setAttribute("id", "textBox");
    introText.style.fontFamily = "'Courier New', monospace";
    introText.style.color = "red";
    introText.style.fontSize = "24px";
    introText.style.textAlign = "center";
    introText.style.top = "40%";
    introText.style.left = "50%";
    introText.style.transform = "translate(-50%, -50%)";
    introText.style.zIndex = "2";
    document.body.appendChild(introText);
}

/////MOUSE STUFF

let mouseDownX = 0, mouseDownY = 0;
let lon = -90, mouseDownLon = 0;
let lat = 0, mouseDownLat = 0;
let isUserInteracting = false;


function moveCameraWithMouse() {
    //set up event handlers
    const div3D = document.getElementById('THREEcontainer');
    div3D.addEventListener('mousedown', div3DMouseDown, false);
    div3D.addEventListener('mousemove', div3DMouseMove, false);
    div3D.addEventListener('mouseup', div3DMouseUp, false);
    div3D.addEventListener('wheel', div3DMouseWheel, { passive: true });
    window.addEventListener('resize', onWindowResize, false);
    //document.addEventListener('keydown', onDocumentKeyDown, false);
    camera.target = new THREE.Vector3(0, 0, 0);  //something for the camera to look at
}

function div3DMouseDown(event) {
    mouseDownX = event.clientX;
    mouseDownY = event.clientY;
    mouseDownLon = lon;
    mouseDownLat = lat;
    isUserInteracting = true;
}

function div3DMouseMove(event) {
    if (isUserInteracting) {
        lon = (mouseDownX - event.clientX) * 0.1 + mouseDownLon;
        lat = (event.clientY - mouseDownY) * 0.1 + mouseDownLat;
        computeCameraOrientation();
    }
}

function div3DMouseUp(event) {
    isUserInteracting = false;
}

function div3DMouseWheel(event) {
    camera.fov += event.deltaY * 0.05;
    camera.fov = Math.max(5, Math.min(100, camera.fov)); //limit zoom
    camera.updateProjectionMatrix();
}

function computeCameraOrientation() {
    lat = Math.max(- 30, Math.min(30, lat));  //restrict movement
    let phi = THREE.MathUtils.degToRad(90 - lat);  //restrict movement
    let theta = THREE.MathUtils.degToRad(lon);
    //move the target that the camera is looking at
    camera.target.x = 100 * Math.sin(phi) * Math.cos(theta);
    camera.target.y = 100 * Math.cos(phi);
    camera.target.z = 100 * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(camera.target);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log('Resized');
}
