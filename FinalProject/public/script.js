const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let backgroundImage = new Image();
backgroundImage.src = "backgroundImg/fightBackground.PNG";

var socket = io.connect();

var winCount = 0;
var playerHp = 5;
var gamePhase = 0;
var ShopLevel = 5;
var cardCount = 0;

var infoDiv = null;

var images = [
  {
    name: "Nine tail",
    attack: "2",
    hp: "8",
    speed: "0",
    power: "0.5",
    color: "sprite/NineTail.PNG",
    job: "ranged",
    Level: "1",
    story:
      "The Nine-Tailed Fox is a mythical creature with the ability to transform into a beautiful woman. Known for its magical powers and wisdom, it symbolizes seduction and mystery. This legendary fox grows more powerful with each tail it gains as it ages.",
  },
  {
    name: "Kun Peng",
    attack: "3",
    hp: "32",
    speed: "0.5",
    power: "1",
    color: "sprite/KunPeng.PNG",
    job: "melee",
    Level: "1",
    story:
    "Kun is described as a giant fish or sea creature that dwells in the Northern Sea, which is also known as the Dark Sea or the Great Wilds. Kun is said to be so massive that it can transform into a bird known as the Peng, which has a wingspan large enough to darken the sky when it flies.",
  },
  {
    name: "Bai Ze",
    attack: "1",
    hp: "9",
    speed: "0",
    power: "0.4",
    color: "sprite/BaiZe.PNG",
    job: "ranged",
    Level: "1",
    story:
      "Bai Ze can speak human language and understands the emotions of all beings. It appears only when a wise and virtuous ruler governs the world. Bai Ze is knowledgeable about all ghosts and deities from the past to the present and is revered as a divine beast that wards off evil spirits.",
  },
  {
    name: "Dang Kang",
    attack: "3",
    hp: "28",
    speed: "0.5",
    power: "0.3",
    color: "sprite/DangKang.PNG",
    job: "melee",
    Level: "1",
    story:
      "Dangkang is a mythical creature in Chinese mythology known as a harbinger of bountiful harvests. According to legend, the Dangkang appears dancing from the mountains when a prosperous harvest is imminent.",
  },
  {
    name: "Pheonix",
    attack: "5",
    hp: "22",
    speed: "0.6",
    power: "1",
    color: "sprite/Pheonix.PNG",
    job: "melee",
    Level: "1",
    story:
      "The phoenix is considered the most beautiful bird in the world and is seen as a symbol of good fortune and royalty. Skilled in song and dance, the appearance of a phoenix is believed to signify a time of prosperity and peace.",
  },
];

let squares = [];
let balls = [];
let mydeck = [];
let enemydeck = [];

var bgMusic = document.getElementById("bgMusic");
var currentMusicIndex = 0;
var musicList = [
  "backgroundImg/battleMusic.ogg",
  "backgroundImg/backMusic.ogg",
];

document.getElementById("forInstruction").addEventListener("click", () => {
  document.getElementById("instruction").style.display = "flex";
});

document.getElementById("closeInstructions").addEventListener("click", () => {
  document.getElementById("instruction").style.display = "none";
});

function switchMusic() {
  currentMusicIndex = (currentMusicIndex + 1) % musicList.length;
  bgMusic.src = musicList[currentMusicIndex];
  bgMusic.play();
}

document.getElementById("startGame").addEventListener("click", () => {
  socket.emit("nextOpponent", { gamePhase: gamePhase });
  switchMusic()
  document.getElementById("beginGame").style.display = "none";
  document.getElementById("preparationPhase").style.display = "block";
});

document.getElementById("phase2").addEventListener("click", () => {
  switchMusic()
  document.getElementById("preparationPhase").style.display = "none";
  document.getElementById("gameCanvas").style.display = "block";
  var socketInfoToSend = {
    mydeck: mydeck,
    phaseNum: gamePhase,
  };
  socket.emit("logMyTeam", socketInfoToSend);
  // console.log("MyTeamDataSent");
  for (var i = 0; i < mydeck.length; i++) {
    if (mydeck[i] != null) {
      let attack = parseFloat(mydeck[i].attack);
      let hp = parseFloat(mydeck[i].hp);
      let speed = parseFloat(mydeck[i].speed);
      let power = parseFloat(mydeck[i].power);
      let ally = new Ally(
        mydeck[i].name,
        attack,
        hp,
        50 + (i - 1) * 70,
        speed,
        power,
        mydeck[i].color,
        mydeck[i].job,
        mydeck[i].Level
      );
      squares.push(ally);
    }
  }
  // console.log(squares);
  for (var i = 0; i < enemydeck.length; i++) {
    if (enemydeck[i] != null) {
      let newColor = enemydeck[i].color.replace("sprite/", "spriteEnemy/");
      let attack = parseFloat(enemydeck[i].attack);
      let hp = parseFloat(enemydeck[i].hp);
      let speed = parseFloat(enemydeck[i].speed);
      let power = parseFloat(enemydeck[i].power);
      let enemy = new Enemy(
        enemydeck[i].name,
        attack,
        hp,
        720 - (50 + (i - 1) * 70),
        -speed,
        power,
        newColor,
        enemydeck[i].job,
        enemydeck[i].Level
      );
      squares.push(enemy);
    }
  }
  gameLoop();
});

var theNextPhaseButtons = document.getElementsByClassName("nextPhase");
for (var i = 0; i < theNextPhaseButtons.length; i++) {
  theNextPhaseButtons[i].addEventListener("click", () => {
    switchMusic()
    if (playerHp <= 0) {
      document.getElementById("W").style.display = "none";
      document.getElementById("L").style.display = "none";
      document.getElementById("gameCanvas").style.display = "none";
      document.getElementById("finalResultL").style.display = "flex";
    } else if (winCount >= 10) {
      document.getElementById("W").style.display = "none";
      document.getElementById("L").style.display = "none";
      document.getElementById("gameCanvas").style.display = "none";
      document.getElementById("finalResultW").style.display = "flex";
    } else {
      document.getElementById("W").style.display = "none";
      document.getElementById("L").style.display = "none";
      document.getElementById("gameCanvas").style.display = "none";
      document.getElementById("preparationPhase").style.display = "block";
      socket.emit("nextOpponent", { gamePhase: gamePhase });
      document.getElementById("BattleLog").innerHTML =
        "Victories: " + winCount + " Hp: " + playerHp;
    }
  });
}

for (var i = 0; i < 5; i++) {
  ShopRefresh(i);
}

class Square {
  constructor(name, attack, HP, x, speed, power, color, job, Level) {
    this.name = name;
    this.attack = attack;
    this.currentHP = HP;
    this.HP = HP;
    this.x = x;
    this.y = 200;
    this.width = 50;
    this.height = 50;
    this.absoluteSpeed = speed;
    this.speed = speed;
    this.absolutePower = power;
    this.power = power;
    this.color = color;
    this.job = job;
    this.dead = false;
    this.knockedBack = false;
    this.lastShootTime = 0;
    this.level = Level;
  }

  move() {
    if (this.currentHP <= 0) {
      this.speed = 0;
    }
    this.x += this.speed;
    if (this.x <= 0 || this.x + this.width > canvas.width) {
      this.speed = this.absoluteSpeed;
    }
  }
}

class Ally extends Square {
  constructor(name, attack, HP, x, speed, power, color, job, Level) {
    super(name, attack, HP, x, speed, power, color, job, Level);
  }

  draw() {
    ctx.save();

    if (this.dead == true) {
      ctx.filter = "grayscale(100%)";
    } else {
      ctx.filter = "none";
    }

    if (this.knockedBack == true) {
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      let angleInRadians = (13 * Math.PI) / 180;
      angleInRadians = -1 * angleInRadians;
      ctx.rotate(angleInRadians);
      ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
    }

    let monsterSprite = new Image();
    monsterSprite.src = this.color;
    ctx.drawImage(monsterSprite, this.x, this.y, this.width, this.height);

    let text = "";
    if (this.dead) {
      text = this.name + " is Dead";
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x, this.y - 20, this.width, 5);
      ctx.fillStyle = "green";
      let hpPercentage = (this.currentHP / this.HP) * this.width;
      ctx.fillRect(this.x, this.y - 20, hpPercentage, 5);

      ctx.fillStyle = "black";
      ctx.font = "20px Mynerve, sans-serif";
      text = this.name;
    }
    const textWidth = ctx.measureText(text).width;
    const textX = this.x + (this.width - textWidth) / 2;
    ctx.fillText(text, textX, this.y - 30);

    ctx.restore();
  }

  collideWith(other) {
    if (
      this.x + this.width >= other.x &&
      other instanceof Enemy &&
      !this.dead &&
      !other.dead
    ) {
      let originalAllySpeed = this.speed;
      this.speed = 3 * -1;
      this.currentHP -= other.attack;
      this.knockedBack = true;
      if (this.job == "ranged") {
        setTimeout(() => {
          this.speed = originalAllySpeed;
          this.knockedBack = false;
          if (this.currentHP <= 0) {
            this.dead = true;
          }
        }, 40 * other.power);
      } else if (this.job == "melee") {
        setTimeout(() => {
          this.speed = originalAllySpeed;
          this.knockedBack = false;
          if (this.currentHP <= 0) {
            this.dead = true;
          }
        }, 200 * other.power);
      }
    }
  }

  shoot() {
    const ball = new Ball(
      this.x + this.width / 2,
      this.y + this.height / 2,
      3,
      "blue",
      this.power,
      "ally",
      3,
      this.attack
    );
    balls.push(ball);
  }

  update() {
    if (
      this.job === "ranged" &&
      Date.now() - this.lastShootTime > 1500 &&
      !this.dead
    ) {
      this.shoot();
      this.lastShootTime = Date.now();
    }
  }
}

class Enemy extends Square {
  constructor(name, attack, HP, x, speed, power, color, job, Level) {
    super(name, attack, HP, x, speed, power, color, job, Level);
  }

  draw() {
    ctx.save();

    if (this.dead == true) {
      ctx.filter = "grayscale(100%)";
    } else {
      ctx.filter = "none";
    }

    if (this.knockedBack == true) {
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      let angleInRadians = (13 * Math.PI) / 180;
      ctx.rotate(angleInRadians);
      ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
    }

    let monsterSprite = new Image();
    monsterSprite.src = this.color;
    ctx.drawImage(monsterSprite, this.x, this.y, this.width, this.height);

    let text = "";
    if (this.dead) {
      text = this.name + " is Dead";
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x, this.y + this.height + 5, this.width, 5);
      ctx.fillStyle = "green";
      let hpPercentage = (this.currentHP / this.HP) * this.width;
      ctx.fillRect(this.x, this.y + this.height + 5, hpPercentage, 5);

      ctx.fillStyle = "black";
      ctx.font = "20px Mynerve, sans-serif";
      text = this.name;
    }
    const textWidth = ctx.measureText(text).width;
    const textX = this.x + (this.width - textWidth) / 2;
    ctx.fillText(text, textX, this.y + this.height + 30);

    ctx.restore();
  }

  collideWith(other) {
    if (
      this.x <= other.x + this.width &&
      other instanceof Ally &&
      !this.dead &&
      !other.dead
    ) {
      let originalAllySpeed = this.speed;
      this.speed = -3 * -1;
      this.currentHP -= other.attack;
      this.knockedBack = true;
      if (this.job == "ranged") {
        setTimeout(() => {
          this.speed = originalAllySpeed;
          this.knockedBack = false;
          if (this.currentHP <= 0) {
            this.dead = true;
          }
        }, 40 * other.power);
      } else if (this.job == "melee") {
        setTimeout(() => {
          this.speed = originalAllySpeed;
          this.knockedBack = false;
          if (this.currentHP <= 0) {
            this.dead = true;
          }
        }, 200 * other.power);
      }
    }
  }

  shoot() {
    const ball = new Ball(
      this.x + this.width / 2,
      this.y + this.height / 2,
      3,
      "black",
      this.power,
      "enemy",
      -3,
      this.attack
    );
    balls.push(ball);
  }

  update() {
    if (this.job === "ranged" && Date.now() - this.lastShootTime > 1500) {
      this.shoot();
      this.lastShootTime = Date.now();
    }
  }
}

class Ball {
  constructor(x, y, radius, color, power, side, speed, attack) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.power = power;
    this.side = side;
    this.speed = speed;
    this.attack = attack;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }

  move() {
    this.x += this.speed;
  }

  collideWith(other) {
    if (
      (this.side === "ally" && other instanceof Enemy) ||
      (this.side === "enemy" && other instanceof Ally)
    ) {
      if (other.x <= this.x && this.x <= other.x + other.width && !other.dead) {
        let originalHitSpeed = other.speed;
        if (this.side === "ally") {
          other.speed = -3 * -1;
        } else if (this.side === "enemy") {
          other.speed = 3 * -1;
        }
        other.currentHP -= this.attack;
        other.knockedBack = true;
        setTimeout(() => {
          other.speed = originalHitSpeed;
          other.knockedBack = false;
          if (other.currentHP <= 0) {
            other.dead = true;
          }
        }, 100 * this.power);

        const index = balls.indexOf(this);
        if (index !== -1) {
          balls.splice(index, 1);
        }
      }
    }
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  ctx.font = "20px Mynerve, sans-serif";
  ctx.fillText("Your Team", 10, 30);
  ctx.fillText("Enemy Team", canvas.width - ctx.measureText("Enemy Team").width - 10, 30);

  squares.forEach((square) => {
    square.move();
    squares.forEach((other) => {
      if (square !== other) {
        square.collideWith(other);
      }
      if (square.job == "ranged") {
        square.update();
      }
    });
    square.draw();
  });

  balls.forEach((ball) => {
    ball.move();
    squares.forEach((square) => {
      ball.collideWith(square);
    });
    ball.draw();
  });

  balls.forEach((ball, index) => {
    if (ball.x > canvas.width) {
      balls.splice(index, 1);
    }
  });

  if (areAlliesDead()) {
    gamePhase += 1;
    playerHp -= 1;
    document.getElementById("L").style.display = "flex";
    squares = [];
    document.getElementById("TheShop").innerHTML = "";
    addAdditionalImages();
    for (var i = 0; i < ShopLevel; i++) {
      ShopRefresh();
    }
  } else if (areEnemiesDead()) {
    gamePhase += 1;
    winCount += 1;
    document.getElementById("W").style.display = "flex";
    squares = [];
    document.getElementById("TheShop").innerHTML = "";
    addAdditionalImages();
    for (var i = 0; i < ShopLevel; i++) {
      ShopRefresh();
    }
  } else {
    requestAnimationFrame(gameLoop);
  }
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  if (infoDiv) {
    document.getElementById("infoDiv").remove();
    var theInfoTabs = document.querySelectorAll(".moreInfo");
    theInfoTabs.forEach(function (infoTab) {
      infoTab.innerHTML = "Details";
      infoTab.style.backgroundColor = "black";
    });
  }
  ev.dataTransfer.setData("text", ev.target.id);
  ev.dataTransfer.setData("theid", ev.target.getAttribute("data-theid"));
  ev.dataTransfer.setData("hp", ev.target.getAttribute("data-hp"));
  ev.dataTransfer.setData("name", ev.target.getAttribute("data-name"));
  ev.dataTransfer.setData("speed", ev.target.getAttribute("data-speed"));
  ev.dataTransfer.setData("power", ev.target.getAttribute("data-power"));
  ev.dataTransfer.setData("color", ev.target.getAttribute("data-color"));
  ev.dataTransfer.setData("job", ev.target.getAttribute("data-job"));
  ev.dataTransfer.setData("imgid", ev.target.getAttribute("data-imgid"));
  ev.dataTransfer.setData("Level", ev.target.getAttribute("data-Level"));
  ev.dataTransfer.setData("attack", ev.target.getAttribute("data-attack"));
}

function drop(ev) {
  ev.preventDefault();
  // console.log(ev.currentTarget);
  var theid = ev.dataTransfer.getData("theid");
  var hp = ev.dataTransfer.getData("hp");
  var attack = ev.dataTransfer.getData("attack");
  var name = ev.dataTransfer.getData("name");
  var speed = ev.dataTransfer.getData("speed");
  var power = ev.dataTransfer.getData("power");
  var color = ev.dataTransfer.getData("color");
  var job = ev.dataTransfer.getData("job");
  var imgid = ev.dataTransfer.getData("imgid");
  var Level = ev.dataTransfer.getData("Level");
  var draggedImage = document.getElementById(theid);
  if (
    job == "eatable" &&
    mydeck[ev.currentTarget.id] != null &&
    0 < parseFloat(mydeck[ev.currentTarget.id].hp) + parseFloat(hp)
  ) {
    document.getElementById(theid).remove();
    var originalHp = mydeck[ev.currentTarget.id].hp;
    var originalAttack = mydeck[ev.currentTarget.id].attack;
    // console.log("Ate Food!");
    hp = parseFloat(originalHp) + parseFloat(hp);
    attack = parseFloat(originalAttack) + parseFloat(attack);
    if (attack < 0) {
      attack = 0;
    }
    // console.log(ev.currentTarget.childNodes[0].childNodes);
    var theNewId = ev.currentTarget.childNodes[0].childNodes[1].id;
    while (ev.currentTarget.childNodes[0].childNodes.length > 2) {
      ev.currentTarget.childNodes[0].removeChild(
        ev.currentTarget.childNodes[0].childNodes[2]
      );
    }
    var monInfo = document.createElement("div");
    if (parseFloat(mydeck[ev.currentTarget.id].Level) != 1) {
      var newname =
        mydeck[ev.currentTarget.id].name +
        " +" +
        (parseFloat(mydeck[ev.currentTarget.id].Level) - 1);
    } else {
      var newname = mydeck[ev.currentTarget.id].name;
    }
    monInfo.id = theNewId;
    monInfo.innerHTML = newname + "<br>HP: " + hp + "<br>Attack: " + attack;
    ev.currentTarget.childNodes[0].appendChild(monInfo);

    mydeck[ev.currentTarget.id] = {
      name: mydeck[ev.currentTarget.id].name,
      hp: hp,
      attack: attack,
      speed: mydeck[ev.currentTarget.id].speed,
      power: mydeck[ev.currentTarget.id].power,
      color: mydeck[ev.currentTarget.id].color,
      job: mydeck[ev.currentTarget.id].job,
      Level: mydeck[ev.currentTarget.id].Level,
    };
  } else if (
    job == "eatable" &&
    mydeck[ev.currentTarget.id] != null &&
    parseFloat(mydeck[ev.currentTarget.id].hp) + parseFloat(hp) < 0
  ) {
    alert(
      "The food is too powerful for the monster to eat!(Monster will die if it eats this food)"
    );
  } else if (job == "eatable" && mydeck[ev.currentTarget.id] == null) {
    alert("You can't feed a monster that doesn't exist!");
  } else {
    // console.log(mydeck[ev.currentTarget.id].name);
    var originalName = "";
    if (mydeck[ev.currentTarget.id] != null) {
      originalName = mydeck[ev.currentTarget.id].name;
    }
    if (originalName == name && mydeck[ev.currentTarget.id].Level <= 3) {
      document.getElementById(imgid).draggable = false;
      ev.currentTarget.innerHTML = "";
      ev.currentTarget.appendChild(draggedImage);
      var originalHp = mydeck[ev.currentTarget.id].hp;
      var originalAttack = mydeck[ev.currentTarget.id].attack;
      var originalLevel = mydeck[ev.currentTarget.id].Level;
      // console.log("LEVELED UP!");
      hp = parseFloat(originalHp) + 5;
      attack = parseFloat(originalAttack) + 1;
      Level = parseFloat(originalLevel) + 1;
      var childDiv = document.getElementById("monInfo" + theid.substring(2));
      draggedImage.removeChild(childDiv);
      var monInfo = document.createElement("div");
      monInfo.id = "monInfo" + theid.substring(2);
      if (Level != 1) {
        var newname = name + " +" + (parseFloat(Level) - 1);
      } else {
        var newname = name;
      }
      monInfo.innerHTML = newname + "<br>HP: " + hp + "<br>Attack: " + attack;
      draggedImage.appendChild(monInfo);
      mydeck[ev.currentTarget.id] = {
        name: name,
        hp: hp,
        attack: attack,
        speed: speed,
        power: power,
        color: color,
        job: job,
        Level: Level,
      };
    } else if (originalName == name && mydeck[ev.currentTarget.id].Level > 3) {
      alert("This monster has reached its maximum level!");
    } else {
      document.getElementById(imgid).draggable = false;
      ev.currentTarget.innerHTML = "";
      ev.currentTarget.appendChild(draggedImage);
      // console.log(ev.currentTarget);
      ev.currentTarget.childNodes[0].removeChild(
        ev.currentTarget.childNodes[0].childNodes[1]
      );
      var monInfo = document.createElement("div");
      monInfo.id = "monInfo" + theid.substring(2);
      monInfo.innerHTML = name + "<br>HP: " + hp + "<br>Attack: " + attack;
      draggedImage.appendChild(monInfo);
      mydeck[ev.currentTarget.id] = {
        name: name,
        hp: hp,
        attack: attack,
        speed: speed,
        power: power,
        color: color,
        job: job,
        Level: Level,
      };
    }
  }
}

function ShopRefresh() {
  cardCount += 1;
  var randomIndex = Math.floor(Math.random() * images.length);
  var imageData = images[randomIndex];
  var theid = "sc" + cardCount;
  var img = document.createElement("img");
  img.id = "scimg" + cardCount;
  img.classList.add("draggable");
  img.width = 80;
  img.height = 80;
  img.src = imageData.color;
  img.draggable = true;
  img.setAttribute("data-theid", theid);
  img.setAttribute("data-imgid", img.id);
  img.setAttribute("data-hp", imageData.hp);
  img.setAttribute("data-attack", imageData.attack);
  img.setAttribute("data-name", imageData.name);
  img.setAttribute("data-speed", imageData.speed);
  img.setAttribute("data-power", imageData.power);
  img.setAttribute("data-color", imageData.color);
  img.setAttribute("data-job", imageData.job);
  img.setAttribute("data-Level", imageData.Level);
  img.addEventListener("dragstart", drag);

  var theShop = document.getElementById("TheShop");
  var shopCard = document.createElement("div");
  shopCard.id = theid;
  var monInfo = document.createElement("div");
  monInfo.id = "monInfo" + cardCount;
  monInfo.innerHTML =
    imageData.name +
    "<br>HP: " +
    imageData.hp +
    "<br>Attack: " +
    imageData.attack;
  var moreInfo = document.createElement("div");
  moreInfo.innerHTML = "Details";
  moreInfo.classList.add("moreInfo");
  shopCard.classList.add("shopCard");
  shopCard.appendChild(img);
  shopCard.appendChild(monInfo);
  shopCard.appendChild(moreInfo);
  theShop.appendChild(shopCard);

  moreInfo.addEventListener("click", function () {
    if (infoDiv) {
      infoDiv.remove();
      infoDiv = null;
      var theInfoTabs = document.querySelectorAll(".moreInfo");
      theInfoTabs.forEach(function (infoTab) {
        infoTab.innerHTML = "Details";
        infoTab.style.backgroundColor = "black";
      });
    } else {
      infoDiv = document.createElement("div");
      infoDiv.id = "infoDiv";
      infoDiv.classList.add("allInfoDiv");
      var statsDiv = document.createElement("div");
      statsDiv.classList.add("statsDiv");
      statsDiv.innerHTML = imageData.name;
      var statsList = document.createElement("ul");
      if (imageData.job == "eatable") {
        var stats = [
          "HP " + imageData.hp,
          "Attack " + imageData.attack,
          "Class " + imageData.job,
        ];
      } else {
        var stats = [
          "HP " + imageData.hp,
          "Attack " + imageData.attack,
          "Speed " + imageData.speed,
          "Power " + imageData.power,
          "Class " + imageData.job,
        ];
      }
      stats.forEach(function (stat) {
        var statItem = document.createElement("li");
        statItem.textContent = stat;
        statsList.appendChild(statItem);
      });
      statsDiv.style.width = "100%";
      statsDiv.appendChild(statsList);
      var storyDiv = document.createElement("div");
      var story = imageData.story;
      storyDiv.innerHTML = "Background Story<br><br>" + story;
      infoDiv.appendChild(statsDiv);
      infoDiv.appendChild(storyDiv);
      document.getElementById("preparationPhase").appendChild(infoDiv);
      moreInfo.innerHTML = "Close";
      moreInfo.style.backgroundColor = "red";
    }
  });
}

function areAlliesDead() {
  return (
    squares.filter((square) => square instanceof Ally && square.dead == false)
      .length === 0
  );
}

function areEnemiesDead() {
  return (
    squares.filter((square) => square instanceof Enemy && square.dead == false)
      .length === 0
  );
}

function addAdditionalImages() {
  if (gamePhase === 1) {
    ShopLevel += 1;
    images.push(
      {
        name: "Bai Hu",
        attack: "8",
        hp: "30",
        speed: "1.2",
        power: "1",
        color: "sprite/BaiHu.PNG",
        job: "melee",
        Level: "1",
        story:
          "Bai Hu is a mythical being in charge of the West in mythology and is also regarded as a war deity. It possesses the powers to ward off evil, punish the wicked, promote the good, and helps people protect their homes and lands.",
      },
      {
        name: "Qing Luan",
        attack: "3",
        hp: "11",
        speed: "0",
        power: "0.6",
        color: "sprite/QingLuan.PNG",
        job: "ranged",
        Level: "1",
        story:
          "The Qing luan is considered the essence of divine spirits, and its appearance heralds peace and tranquility in the world. It also represents a messenger responsible for delivering messages.",
      },
      {
        name: "Yu",
        attack: "4",
        hp: "22",
        speed: "2",
        power: "0.9",
        color: "sprite/Yu.PNG",
        job: "melee",
        Level: "1",
        story:
          "The Yu bird looks like a mouse but has wings like a bird and can make sounds like a sheep. It is believed to have the ability to foresee military intelligence, ward off evil spirits, and prevent disasters related to war.",
      },
      {
        name: "Feng Mu",
        attack: "1",
        hp: "-4",
        color: "sprite/FengMu.PNG",
        job: "eatable",
        story:
          "Fengmu, despite its branches being covered in hard thorns, is considered a plant that grants immortality.",
      },
      {
        name: "Meng Cao",
        attack: "-1",
        hp: "6",
        color: "sprite/MengCao.PNG",
        job: "eatable",
        story:
          "Meng Cao, when worn, can instantly induce sleep and transform nightmares into pleasant dreams.",
      }
    );
  }

  if (gamePhase === 3) {
    ShopLevel += 1;
    images.push(
      {
        name: "Di Jiang",
        attack: "5",
        hp: "13",
        speed: "0",
        power: "1",
        color: "sprite/DiJiang.PNG",
        job: "ranged",
        Level: "1",
        story:
          "Di Jiang, a mythical creature with six legs and four wings, lacks a face but is skilled in singing and dancing. It symbolizes chaos.",
      },
      {
        name: "Cheng Huang",
        attack: "10",
        hp: "38",
        speed: "0.7",
        power: "1.2",
        color: "sprite/ChengHuang.PNG",
        job: "melee",
        Level: "1",
        story:
          "Cheng Huang symbolizes success and promotion. Legend has it that riding it can lead to longevity, allowing one to live up to two thousand years",
      },
      {
        name: "Er Shu",
        attack: "3",
        hp: "19",
        speed: "2",
        power: "1.3",
        color: "sprite/ErShu.PNG",
        job: "melee",
        Level: "1",
        story:
          "Ershu is depicted as a mouse with a rabbit's head that can fly using its tail. Consuming its meat is believed to cure bloating and provide resistance against all poisons.",
      },
      {
        name: "Zhu Yu",
        attack: "2",
        hp: "2",
        color: "sprite/ZhuYu.PNG",
        job: "eatable",
        story:
          "Zhu Yu is characterized by its green flowers, and legend has it that consuming this plant prevents people from feeling hungry again.",
      },
      {
        name: "Du Heng",
        attack: "3",
        hp: "1",
        color: "sprite/DuHeng.PNG",
        job: "eatable",
        story:
          "Du Heng has a faint fragrance, and wearing it on animals can make them run extremely fast.",
      }
    );
  }

  if (gamePhase === 6) {
    ShopLevel += 1;
    images.push(
      {
        name: "Fei Fei",
        attack: "6",
        hp: "42",
        speed: "0.8",
        power: "0.7",
        color: "sprite/FeiFei.PNG",
        job: "melee",
        Level: "1",
        story:
          "Feifei is a mythical creature known to eliminate diseases and misfortunes. Keeping it nearby can resolve various troubles in people's lives.",
      },
      {
        name: "Fu Zhu",
        attack: "2",
        hp: "15",
        speed: "0",
        power: "1.3",
        color: "sprite/FuZhu.PNG",
        job: "ranged",
        Level: "1",
        story:
          "Fu Zhu is a mythical creature depicted as a deer with four horns, known to bring floods. Legend states that its appearance is accompanied by overwhelming deluges.",
      },
      {
        name: "Wen Yao",
        attack: "2",
        hp: "61",
        speed: "0.1",
        power: "3",
        color: "sprite/WenYao.PNG",
        job: "melee",
        Level: "1",
        story:
          "The Wen Yao fish, with the body of a fish and the wings of a bird, is legendary for its healing powers against madness when consumed. Seeing it is believed to represent a bountiful harvest for fishermen worldwide.",
      },
      {
        name: "Bi Li",
        attack: "7",
        hp: "-10",
        color: "sprite/BiLi.PNG",
        job: "eatable",
        story:
          "Bili, a plant that grows on rocks, causes heartache when consumed.",
      },
      {
        name: "Wen Jing",
        attack: "-5",
        hp: "20",
        color: "sprite/WenJing.PNG",
        job: "eatable",
        story:
          "The fruit of the Wen Jing plant, which resembles a date, can be used to treat deafness.",
      }
    );
  }
}

socket.on("nextOpponent", function (opponentTeam) {
  console.log("Opponent Team:", opponentTeam);
  if (opponentTeam.mydeck == null) {
    opponentTeam.mydeck = [];
  }
  enemydeck = opponentTeam.mydeck.filter((deck) => deck !== null);
});
