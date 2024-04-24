const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let backgroundImage = new Image();
backgroundImage.src = "backgroundImg/battleBackground.PNG";

var images = [
  {
    name: "Nine tail",
    attack: "2",
    hp: "18",
    speed: "0",
    power: "3",
    color: "sprite/NineTail.PNG",
    job: "ranged",
    Level: "1",
    experience: "0",
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
    experience: "0",
  },
  {
    name: "Bai Ze",
    attack: "1",
    hp: "19",
    speed: "0",
    power: "0.4",
    color: "sprite/BaiZe.PNG",
    job: "ranged",
    Level: "1",
    experience: "0",
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
    experience: "0",
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
    experience: "0",
  },
];

let squares = [];

let mydeck = [];

class Square {
  constructor(
    name,
    attack,
    HP,
    x,
    speed,
    power,
    color,
    job,
    Level,
    experience
  ) {
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
    this.experience = experience;
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
  constructor(
    name,
    attack,
    HP,
    x,
    speed,
    power,
    color,
    job,
    Level,
    experience
  ) {
    super(name, attack, HP, x, speed, power, color, job, Level, experience);
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
    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    let text = "";
    if (this.dead) {
      text = this.name + " is Dead";
    } else {
      text = this.name + " " + this.currentHP + "/" + this.HP;
    }
    const textWidth = ctx.measureText(text).width;
    const textX = this.x + (this.width - textWidth) / 2;
    ctx.fillText(text, textX, this.y - 10);

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
    console.log("shoot");
  }

  update() {
    if (
      this.job === "ranged" &&
      Date.now() - this.lastShootTime > 4000 &&
      !this.dead
    ) {
      this.shoot();
      this.lastShootTime = Date.now();
    }
  }

  levelUp() {
    if (experience == 3 && this.level == 1) {
      this.level += 1;
    } else if (experience == 4 && this.level == 2) {
      this.level += 1;
    }
  }
}

class Enemy extends Square {
  constructor(name, attack, HP, x, speed, power, color, job) {
    super(name, attack, HP, x, speed, power, color, job);
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
    ctx.fillStyle = "black";
    ctx.font = "10px Arial";
    let text = "";
    if (this.dead) {
      text = this.name + " is Dead";
    } else {
      text = this.name + " " + this.currentHP + "/" + this.HP;
    }
    const textWidth = ctx.measureText(text).width;
    const textX = this.x + (this.width - textWidth) / 2;
    ctx.fillText(text, textX, this.y - 10);

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
    if (this.job === "ranged" && Date.now() - this.lastShootTime > 4000) {
      this.shoot();
      this.lastShootTime = Date.now();
    }
  }
}

const balls = [];

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
    alert("You lost!");
    location.reload();
  } else if (areEnemiesDead()) {
    alert("You won!");
    location.reload();
  } else {
    requestAnimationFrame(gameLoop);
  }
}

document.getElementById("phase2").addEventListener("click", () => {
  document.getElementById("preparationPhase").style.display = "none";
  document.getElementById("gameCanvas").style.display = "block";
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
        mydeck[i].job
      );
      squares.push(ally);
    }
  }
  console.log(squares);
  let enemy1 = new Enemy("Bird",1,19,610,0,0.4,"spriteEnemy/NineTail.PNG","ranged");
  let enemy2 = new Enemy("Dang Kang",3,28,680,-0.5,0.3,"spriteEnemy/DangKang.PNG","melee");
  let enemy3 = new Enemy("Pheonix",5,22,750,-0.6,1,"spriteEnemy/Pheonix.PNG","melee");
  squares.push(enemy1);
  squares.push(enemy2);
  squares.push(enemy3);
  gameLoop();
});

for (var i = 0; i < 5; i++) {
  ShopRefresh(i);
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
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
  ev.dataTransfer.setData(
    "experience",
    ev.target.getAttribute("data-experience")
  );
  ev.dataTransfer.setData("attack", ev.target.getAttribute("data-attack"));
}

function drop(ev) {
  ev.preventDefault();
  console.log(ev.currentTarget);
  var data = ev.dataTransfer.getData("text");
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
  var experience = ev.dataTransfer.getData("experience");
  var draggedImage = document.getElementById(theid);
  console.log(imgid);
  document.getElementById(imgid).draggable = false;
  ev.currentTarget.innerHTML = "";
  ev.currentTarget.appendChild(draggedImage);
  mydeck[ev.currentTarget.id] = {
    name: name,
    hp: hp,
    attack: attack,
    speed: speed,
    power: power,
    color: color,
    job: job,
    Level: Level,
    experience: experience,
  };
}

function ShopRefresh(i) {
  var randomIndex = Math.floor(Math.random() * images.length);
  var imageData = images[randomIndex];
  var theid = "sc" + i;
  console.log(theid);
  var img = document.createElement("img");
  img.id = "scimg" + i;
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
  img.setAttribute("data-experience", imageData.experience);
  img.addEventListener("dragstart", drag);

  var theShop = document.getElementById("TheShop");
  var shopCard = document.createElement("div");
  shopCard.id = theid;
  var monInfo = document.createElement("div");
  monInfo.innerHTML =imageData.name + "<br>HP: " + imageData.hp + "<br>Attack: " + imageData.attack;
  shopCard.classList.add("shopCard");
  shopCard.appendChild(img);
  shopCard.appendChild(monInfo);
  theShop.appendChild(shopCard);
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
