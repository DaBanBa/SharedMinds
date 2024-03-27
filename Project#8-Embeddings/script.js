const replicateProxy = "https://replicate-api-proxy.glitch.me";

let words = [
  "Chair",
  "Lamp",
  "Table",
  "Book",
  "Phone",
  "Tree",
  "Car",
  "Guitar",
  "Shoes",
  "Watch",
];

let theGuessingWord = getRandomWord();
document.getElementById("submitButt").addEventListener("click", function () {
  askForEmbeddings(
    theGuessingWord + "," + document.getElementById("inputValue").value
  );
});

async function askForEmbeddings(guess) {
  let promptInLines = guess.replace(/,/g, "\n");
  let data = {
    version: "75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a",
    input: {
      inputs: promptInLines,
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
  const url = replicateProxy + "/create_n_get/";
  console.log("url", url, "options", options);
  const raw = await fetch(url, options);
  const proxy_said = await raw.json();
  let output = proxy_said.output;
  console.log("Proxy Returned", output);
  distances = [];
  let firstOne = output[0];
  let thisOne = output[1];
  let cdist = cosineSimilarity(firstOne.embedding, thisOne.embedding);
  let aGuess = document.createElement("div");
  aGuess.classList.add("guessStyles");
  let theGuess = document.createElement("div");
  theGuess.textContent = thisOne.input;
  theGuess.classList.add("theGuess");
  aGuess.appendChild(theGuess);
  let thePercentage = document.createElement("div");
  let number = cdist * 100;
  thePercentage.textContent = Number(number.toFixed(1)) + "%";
  thePercentage.classList.add("Correctness");
  aGuess.appendChild(thePercentage);
  let percentage = cdist * 60;
  let red = Math.round((255 * (100 - percentage)) / 100);
  let green = Math.round((255 * percentage) / 100);
  let color = `rgb(${red}, ${green}, 0)`;
  thePercentage.style.backgroundColor = color;
  document.getElementById("guesses").appendChild(aGuess);
  if (thePercentage.textContent == "100%") {
    alert("You got it! Refresh the page for a new object!");
  }
}

function cosineSimilarity(vecA, vecB) {
  return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB));
}

function dotProduct(vecA, vecB) {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

function magnitude(vec) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

function getRandomWord() {
  let randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}
