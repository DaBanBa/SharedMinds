let handpose;
let video;
let hands = [];

let rats = [];
let ratEmoji = "🐀";
let spawnRate = 5000;
let score = 0;

function preload() {
  handpose = ml5.handpose();
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  handpose.detectStart(video, gotHands);
  textSize(32);

  setInterval(spawnRat, spawnRate);
}

function draw() {
  image(video, 0, 0, width, height);
  let textWidthValue = textWidth("Score :" + score);
  text("Score :" + score, 10, height - 12);
  if (hands[0]) {
    for (let i = 0; i < rats.length; i++) {
      text(ratEmoji, rats[i].x, rats[i].y);
    }
  } else {
    textSize(32);
    fill(255);
    stroke(0);
    strokeWeight(3);
    let textWidthValue = textWidth("Put your hands in the air to begin");
    text("Put your hands in the air to begin", 10, 10, textWidthValue);
  }

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    let keypoint = hand.keypoints[0];
    textSize(64);
    text("👊", keypoint.x, keypoint.y);
    for (let i = rats.length - 1; i >= 0; i--) {
      let rat = rats[i];
      let dx = keypoint.x - rat.x;
      let dy = keypoint.y - rat.y;
      let distanceSquared = dx * dx + dy * dy;
      let distance = Math.sqrt(distanceSquared);
      console.log(distance);
      if (distance <= 20) {
        rats.splice(i, 1);
        score++;
        console.log("Rat killed");
      }
    }
  }
}

function gotHands(results) {
  hands = results;
}

function spawnRat() {
  let x = random(width);
  let y = random(height);
  rats.push({ x: x, y: y });
}
