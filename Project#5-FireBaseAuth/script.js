import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, onValue, update, set, push, onChildAdded, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.1/three.module.min.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'
import { DragControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/DragControls.js';
import { getAuth, signOut, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"

let draggableObjects = [];
let savedObjects = [];
let camera, scene, renderer, cube;
let dragControls;
let orbitControls;
let dbName = "Project4Data";

let db, auth;
let googleAuthProvider;

intitHTML();
init3D();
initFirebase()
recall();

export function getUser() {
    return auth.currentUser;
}

function save() {
    let forFirebase = {objects: savedObjects };
    setDataInFirebase(dbName, forFirebase);
}

function recall() {
    scene.remove()
    getStuffFromFirebase(dbName, (data) => {
        if (data) {
            for (let i = 0; i < data.objects.length; i++) {
                createNewDot(data.objects[i].color, data.objects[i].position);
            }
        }
    });
}

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

function intitHTML() {
    window.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            const user = auth.currentUser;
            if (!user) {
                alert("Please Log in");
            }else{
                let mouse = { x: window.innerWidth / 2 - 75, y: window.innerHeight / 2 - 75};
                const pos = find3DCoornatesInFrontOfCamera(100, mouse);
                createNewDot(generateRandomColor(), pos);
                save();
            }
        }
    });
}

function animate() {
    orbitControls.update();
    for (let i = 0; i < draggableObjects.length; i++) {
        draggableObjects[i].lookAt(camera.position);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
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

function createNewDot(color, posInWorld) {
    console.log("Created New Text", posInWorld);
    var canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    var context = canvas.getContext("2d");
    context.fillStyle = color;
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
    let dot = { color: color, position: posInWorld };

    mesh.lookAt(0, 0, 0);
    mesh.scale.set(10, 10, 10);
    scene.add(mesh);
    mesh.lookAt(0, 0, 0);
    draggableObjects.push(mesh);
    savedObjects.push(dot);
}

function generateRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

////FIREBASE STUFF

function initFirebase() {
    const firebaseConfig = {
        apiKey: "AIzaSyBQSe5-ThWzs0y13sstZyNq262F2umFQh8",
        authDomain: "sharedminds-64cc1.firebaseapp.com",
        projectId: "sharedminds-64cc1",
        storageBucket: "sharedminds-64cc1.appspot.com",
        messagingSenderId: "509972261161",
        appId: "1:509972261161:web:a3ae8ceb47d722b00a6f38"
      };
    const app = initializeApp(firebaseConfig);
    //make a folder in your firebase for this example
    db = getDatabase();
    auth = getAuth();
    googleAuthProvider = new GoogleAuthProvider();
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            console.log("userino is signed in", user);
            showLogOutButton(user);
        } else {
            console.log("userino is signed out");
            showLoginButtons();
        }
    });
    return auth.currentUser;
}

function setDataInFirebase(folder, data) {
    //if it doesn't exist, it adds (pushes) with you providing the key
    //if it does exist, it overwrites
    const dbRef = ref(db, folder + '/')
    set(dbRef, data);
}

function getStuffFromFirebase(folder, callback) {
    //make a one time ask, not a subscription
    const dbRef = ref(db, folder + '/');
    onValue(dbRef, (snapshot) => {
        console.log("here is a snapshot of everyting", snapshot.val());
        callback(snapshot.val());

    });
}

let authDiv = document.createElement("div");
authDiv.style.position = "absolute";
authDiv.style.top = "10%";
authDiv.style.left = "85%";
authDiv.style.width = "150px";
//authDiv.style.height = "150px";
authDiv.style.backgroundColor = "lightpink";
authDiv.style.border = "1px solid black";
authDiv.style.padding = "10px";
authDiv.style.zIndex = "3000";
document.body.appendChild(authDiv);

function showLoginButtons() {
    authDiv.innerHTML = "";
    console.log("showing login buttons");
    let signUpWithGoogleButton = document.createElement("button");
    signUpWithGoogleButton.innerHTML = "Google Login";
    signUpWithGoogleButton.setAttribute("id", "signInWithGoogle");
    signUpWithGoogleButton.setAttribute("class", "authButton");
    authDiv.appendChild(signUpWithGoogleButton);

    document.getElementById("signInWithGoogle").addEventListener("click", function () {
        signInWithPopup(auth, googleAuthProvider)
            .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                // IdP data available using getAdditionalUserInfo(result)
                // ...
            }).catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
            });
    });
}

function showLogOutButton(user) {
    authDiv.innerHTML = "";
    let userNameDiv = document.createElement("div");
    if (user.photoURL) {
        console.log("photo url", user.photoURL);
        let userPic = document.createElement("img");
        userPic.style.width = "50px";
        userPic.style.height = "50px";

        userPic.onload = function (img) {
            console.log("loaded", img);
            authDiv.appendChild(userPic);
        }
        userPic.src = user.photoURL;
    }

    if (user.displayName) {
        userNameDiv.innerHTML = user.displayName;
    } else {
        userNameDiv.innerHTML = user.email;
    }
    let logOutButton = document.createElement("button");
    authDiv.appendChild(userNameDiv);
    logOutButton.innerHTML = "Log Out";
    logOutButton.setAttribute("id", "logOut");
    authDiv.appendChild(logOutButton);
    document.getElementById("logOut").addEventListener("click", function () {
        signOut(auth).then(() => {
            // Sign-out successful.
            console.log("signed out");
        }).catch((error) => {
            // An error happened.
            console.log("error signing out");
        });
    });
}
