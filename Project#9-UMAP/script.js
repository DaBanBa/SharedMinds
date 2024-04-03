import { UMAP } from "https://cdn.skypack.dev/umap-js";

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

let ctx = document.getElementById("myCanvas").getContext("2d");

let theGuessingWord = getRandomWord();
document.getElementById("submitButt").addEventListener("click", function () {
  createUniverse(
    document.getElementById("inputValue").value
  );
});

function placeSentence(sentence, fitting) {
  console.log("running over the embedded sentenses", sentence);
  ctx.font = "12px Arial";
  ctx.fillStyle = "black";
  let w = ctx.measureText(sentence).width;
  ctx.fillText(sentence, fitting[0] * 700 - w / 2, fitting[1] * 400);
}

function runUMAP(embeddingsAndSentences) {
  let embeddings = [];
  for (let i = 0; i < embeddingsAndSentences.length; i++) {
      embeddings.push(embeddingsAndSentences[i].embedding);
  }
  var myrng = new Math.seedrandom('hello.');
  let umap = new UMAP({
      nNeighbors: 6,
      minDist: .5,
      nComponents: 2,
      random: myrng,
      spread: .99,
  });
  console.log(embeddings);
  let fittings = umap.fit(embeddings);
  fittings = normalize(fittings);
  for (let i = 0; i < embeddingsAndSentences.length; i++) {
      console.log("checkpoint 4");
      placeSentence(embeddingsAndSentences[i].input, fittings[i]);
  }
}

async function createUniverse(universalMotto) {
  if(universalMotto.toLowerCase() == theGuessingWord.toLowerCase()){
    alert('You Got It!')
    location.reload();
    return;
  }
  console.log("checkpoint 1");
  console.log("This game doesn't work that great, but it kinda got me to understand UMAP(WHY DOES IT NEED AT LEAST 6 CORDS TO WORK??? the small things in this lib is driving me insane) if you are wondering, the answer is " + theGuessingWord);
  let text = "give me a json object with 10 hints that links between" + universalMotto + " and " + theGuessingWord + " in a way that is obvious to a human, do not contain the words " + theGuessingWord + " or " + universalMotto + " in the hints.";
  const data = {
      model: "gpt-3.5-turbo-instruct",
      prompt: text,
      temperature: 0,
      max_tokens: 1000,
  };

  let options = {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
      },
      body: JSON.stringify(data),
  };
  const openAIProxy = "https://openai-api-proxy.glitch.me";
  console.log("checkpoint 2");

  const url = openAIProxy + "/AskOpenAI/";
  console.log("asking sentences", url, "words options", options);
  const response = await fetch(url, options);
  const openAI_json = await response.json();
  let arrayOfStrings = openAI_json.choices[0].text.split("\n");
  let sentences = "";
  for (let i = 0; i < arrayOfStrings.length; i++) {
      let thisSentence = arrayOfStrings[i].substring(1);
      if (thisSentence.length < 30) {
          continue;
      }
      sentences += thisSentence + "\n";
  }
  let embeddingData = {
      version: "75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a",
      input: {
          inputs: sentences,
      },
  };
  options = {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(embeddingData),
  };
  const replicateProxy = "https://replicate-api-proxy.glitch.me"

  const replicateURL = replicateProxy + "/create_n_get/";
  console.log("url", replicateURL, "options", options);
  let raw = await fetch(replicateURL, options)
  console.log("checkpoint 3", raw);
  let embeddingsJSON = await raw.json();
  console.log("fuckingrawjson", embeddingsJSON);
  localStorage.setItem("embeddings", JSON.stringify(embeddingsJSON.output));
  runUMAP(embeddingsJSON.output)
}

function getRandomWord() {
  let randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}

function normalize(arrayOfNumbers) {
  //find max and min in the array
  let max = [0, 0];
  let min = [0, 0];
  for (let i = 0; i < arrayOfNumbers.length; i++) {
      for (let j = 0; j < 2; j++) {
          if (arrayOfNumbers[i][j] > max[j]) {
              max[j] = arrayOfNumbers[i][j];
          }
          if (arrayOfNumbers[i][j] < min[j]) {
              min[j] = arrayOfNumbers[i][j];
          }
      }
  }
  //normalize
  for (let i = 0; i < arrayOfNumbers.length; i++) {
      for (let j = 0; j < 2; j++) {
          arrayOfNumbers[i][j] = (arrayOfNumbers[i][j] - min[j]) / (max[j] - min[j]);
      }
  }
  return arrayOfNumbers;
}