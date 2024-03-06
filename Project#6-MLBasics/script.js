const replicateProxy = "https://replicate-api-proxy.glitch.me"

let selectedPrompt = "";

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

document.getElementById("startGameButton").addEventListener("click", function () {
    selectedPrompt = getRandomPrompt(prompts);
    askForPicture(selectedPrompt);
    document.getElementById("startGameButton").style.display = "none";
})

document.getElementById("submitButt").addEventListener("click", function () {
    checkInputMatch(document.getElementById("inputValue").value, selectedPrompt);
})



async function askForPicture(p_prompt) {
    const LoadingText = document.getElementById("LoadingText");
    LoadingText.innerHTML = "Generating ...";
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
        LoadingText.innerHTML = '';
        guessingImg.src = proxy_said.output[0];
        document.getElementById("answeringZone").style.display = "flex";
    }
}

function getRandomPrompt(prompts) {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
}

function checkInputMatch(inputValue, selectedPrompt) {
    const promptWords = selectedPrompt.split(" ");
    const inputWords = inputValue.split(" ");
    
    const matchingWords = inputWords.filter(word => promptWords.includes(word));
    
    if (inputValue == selectedPrompt) {
        alert("You got it!");
        window.location.reload();
    } else if(matchingWords.length == 0) {
        alert("No matching words! Try again!");
    } else{
        alert("The words " + matchingWords + " exist in the prompt! Try again!");
    }
}