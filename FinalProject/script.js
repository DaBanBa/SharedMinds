const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

class Square {
  constructor(name, attack, HP, x, y, speed, power, color, job, Level, experience) {
    this.name = name;
    this.attack = attack;
    this.currentHP = HP;
    this.HP = HP;
    this.x = x;
    this.y = y;
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
      if (this instanceof Ally) {
        angleInRadians = -1 * angleInRadians;
      }
      ctx.rotate(angleInRadians);
      ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
    }

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
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
  constructor(name, attack, HP, x, y, speed, power, color, job, Level, experience) {
    super(name, attack, HP, x, y, speed, power, color, job, Level, experience);
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
    if (experience == 3 && this.level == 1){
      this.level += 1;
    }else if (experience == 4 && this.level == 2){
      this.level += 1;
    }
  }
}

class Enemy extends Square {
  constructor(name, attack, HP, x, y, speed, power, color, job) {
    super(name, attack, HP, x, y, speed, power, color, job);
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

const squares = [
  new Ally("Raccoon", 2, 18, 100, 150, 0, 3, "orange", "ranged"),
  new Ally("Cat", 3, 32, 170, 150, 0.5, 1, "red", "melee"),
  new Enemy("Bird", 1, 19, 600, 150, 0, 0.4, "green", "ranged"),
  new Enemy("Dog", 3, 28, 670, 150, -0.5, 0.3, "blue", "melee"),
  new Enemy("Elephant", 5, 22, 740, 150, -0.6, 1, "purple", "melee"),
];

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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

  requestAnimationFrame(gameLoop);
}

gameLoop();
