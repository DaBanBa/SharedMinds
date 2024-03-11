const replicateProxy = "https://replicate-api-proxy.glitch.me"
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, onValue, update, set, push, onChildAdded, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

let db;
let currentPrompt = "";

initFirebase();
subscribeToData();
recall();

const prompts = [
    "Lonely astronaut on barren planet",
    "Enchanted forest under starlight canopy",
    "Abandoned carnival with eerie lights",
    "Submerged cityscape with ancient ruins",
    "Gigantic mechanical creatures battling skyward",
    "Serene meadow amidst swirling mists",
    "Alien market bustling with activity",
    "Time-traveling train through surreal landscapes",
    "Haunted castle overlooking stormy sea",
    "Futuristic cityscape under neon skies"
];

const guessingImg = document.getElementById("guessingImg");

document.getElementById("submitButt").addEventListener("click", function () {
    checkInputMatch(document.getElementById("inputValue").value, currentPrompt);
})

async function askForPicture(p_prompt) {
    let data = {
        "version": "da77bc59ee60423279fd632efb4795ab731d9e3ca9705ef3341091fb989b7eaf",
        input: {
            "prompt": p_prompt,
            "width": 512,
            "height": 512,
        },
    };
    console.log("Asking for Picture Info From Replicate via Proxy", data);
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
    const url = replicateProxy + "/create_n_get/"
    console.log("url", url, "options", options);
    const picture_info = await fetch(url, options);
    const proxy_said = await picture_info.json();

    if (proxy_said.output.length == 0) {
        LoadingText.innerHTML = "Something went wrong, try it again";
    } else {
        save(proxy_said.output[0], p_prompt);
        window.location.reload();
    }
}

function getRandomPrompt(prompts) {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
}

function checkInputMatch(inputValue, currentPrompt) {
console.log(inputValue, currentPrompt);
    const promptWords = currentPrompt.split(" ");
    const inputWords = inputValue.split(" ");
    
    const matchingWords = inputWords.filter(word => promptWords.includes(word));
    
    if (inputWords == ""){
        alert("No Answer Entered!");
    }else if(inputValue == currentPrompt) {
        alert("You got it! Please wait until the next image is generated!");
        askForPicture(getRandomPrompt(prompts));
    } else if(matchingWords.length == 0) {
        alert("No matching words! Try again!");
    } else{
        alert("The words " + matchingWords + " exist in the prompt! Try again!");
    }
}

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
}

function recall() {
    getStuffFromFirebase("project7", (data) => {
        if (data) {
            console.log("got data", data);
            currentPrompt = data.prompts;
            console.log(data.prompts);
            document.getElementById("guessingImg").src = data.src;
        }
    });
}

function save(src, prompts) {
    let forFirebase = {src: src, prompts: prompts};
    setDataInFirebase("project7", forFirebase);
}

function setDataInFirebase(folder, data) {
    //if it doesn't exist, it adds (pushes) with you providing the key
    //if it does exist, it overwrites
    const dbRef = ref(db, folder + '/')
    update(dbRef, data);
}

function getStuffFromFirebase(folder, callback) {
    //make a one time ask, not a subscription
    const dbRef = ref(db, folder + '/');
    onValue(dbRef, (snapshot) => {
        callback(snapshot.val());
    });
}

function subscribeToData() {
    //get callbacks when there are changes either by you locally or others remotely
    const commentsRef = ref(db, 'project7/');
    onChildAdded(commentsRef, (data) => {
        currentPrompt = data.prompts;
        document.getElementById("guessingImg").src = data.src;
    });
}