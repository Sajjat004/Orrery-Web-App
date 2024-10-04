let player;
let asteroids = [];
let score = 0;
let highscore = 0;
let asteroidImg, destroyerImg;
let stars = [];  // Array to hold stars
let kills = 0;
let unlockedAchievements = [];

// List of achievements (notable asteroids)
const achievements = [
  { name: '2012 DA14', details: 'Passed within 27,700 km of Earth in February 2013.' },
  { name: '2005 YU55', details: 'Passed by Earth at about 324,600 km in November 2011.' },
  { name: '1999 KW4', details: 'A binary asteroid, came within 5.2 million km of Earth in May 2019.' },
  { name: '2020 QG', details: 'Set a record by flying just 2,950 km above Earth in August 2020.' },
  { name: '2023 DZ2', details: 'Came within 174,000 km of Earth in March 2023.' },
  { name: 'Chelyabinsk Meteor', details: 'Exploded over Russia in 2013, causing significant damage.' },
  { name: 'Tunguska Event', details: 'Flattened 80 million trees in Siberia in 1908.' },
  { name: 'Chicxulub Impactor', details: 'Caused the extinction of the dinosaurs ~66 million years ago.' },
  { name: '2008 TC3', details: 'Entered Earth’s atmosphere and exploded over Sudan in 2008.' }
];

function preload() {
  asteroidImg = loadImage('assets/asteroid_image-Photoroom.png');  // Replace with actual path
  destroyerImg = loadImage('assets/destroyer_image-Photoroom.png');  // Replace with actual path
}

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  player = new Player();

  // Generate random stars for the background
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3)  // Random star size
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // Space-like background with stars
  background(0);
  drawStars();  // Function to draw stars

  // Draw and update the player (ship)
  player.draw();
  player.update();

  // Draw and update asteroids
  for (let i = asteroids.length - 1; i >= 0; i--) {
    asteroids[i].draw();
    asteroids[i].update();

    // Check for collision
    if (asteroids[i].ateYou()) {
      restart();
      break;
    }

    // Check if asteroid was shot
    if (player.hasShot(asteroids[i])) {
      kills++;
      score++;
      asteroids.splice(i, 1);

      // Check if an achievement has been unlocked every 10 kills
      if (kills % 5 === 0 && kills / 5 <= achievements.length) {
        let achievement = achievements[(kills / 5) - 1];
        unlockedAchievements.push(achievement);
      }
    }
  }

  // Spawn new asteroids
  if (frameCount % 60 === 0) {
    asteroids.push(new Asteroid(random(1, 3)));
  }

  // Display score
  fill(255);  // White color for text
  textAlign(CENTER);
  textSize(20);
  text("Score: " + score, width / 2, 50);
  text("Highscore: " + highscore, width / 2, 80);
}

function drawStars() {
  noStroke();
  fill(255);  // White color for stars
  for (let star of stars) {
    ellipse(star.x, star.y, star.size, star.size);  // Draw each star as a small circle
  }
}

function restart() {
  player = new Player();
  asteroids = [];
  if (score > highscore) {
    highscore = score;
  }
  score = 0;
  kills = 0;

  // Show achievements when game is over
  showAchievements();
}

function mouseClicked() {
  player.shoot();
}

class Player {
  constructor() {
    this.pos = createVector(width / 2, height / 2);  // Start at center
    this.angle = 0;  // Angle for rotation towards mouse
    this.bullets = [];  // Array of bullets
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angle);
    imageMode(CENTER);
    image(destroyerImg, 0, 0, 50, 50);  // Draw the destroyer image
    pop();

    // Draw and update bullets
    for (let bullet of this.bullets) {
      bullet.update();
      bullet.draw();
    }
  }

  update() {
    let xSpeed = 0;
    let ySpeed = 0;

    // Movement (WASD)
    if (keyIsDown(65)) {  // A key
      xSpeed = -5;
    }
    if (keyIsDown(68)) {  // D key
      xSpeed = 5;
    }
    if (keyIsDown(87)) {  // W key
      ySpeed = -5;
    }
    if (keyIsDown(83)) {  // S key
      ySpeed = 5;
    }

    this.pos.add(xSpeed, ySpeed);
    this.angle = atan2(mouseY - this.pos.y, mouseX - this.pos.x);  // Rotate towards the mouse
  }

  shoot() {
    this.bullets.push(new Bullet(this.pos.x, this.pos.y, this.angle));
  }

  hasShot(asteroid) {
    for (let i = 0; i < this.bullets.length; i++) {
      if (dist(this.bullets[i].x, this.bullets[i].y, asteroid.pos.x, asteroid.pos.y) < 20) {
        this.bullets.splice(i, 1);  // Remove the bullet on impact
        return true;
      }
    }
    return false;
  }
}

class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = 10;
  }

  draw() {
    push();
    fill(255, 255, 0);
    noStroke();
    ellipse(this.x, this.y, 10, 10);  // Draw the bullet
    pop();
  }

  update() {
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
  }
}

class Asteroid {
  constructor(speed) {
    this.speed = speed;
    let y = random(-300, height + 300);  // Spawn anywhere vertically
    let x = random(-300, width + 300);  // Spawn anywhere horizontally
    this.pos = createVector(x, y);
  }

  draw() {
    push();
    imageMode(CENTER);
    image(asteroidImg, this.pos.x, this.pos.y, 50, 50);  // Draw asteroid image
    pop();
  }

  update() {
    let difference = p5.Vector.sub(player.pos, this.pos);
    difference.limit(this.speed);
    this.pos.add(difference);
  }

  ateYou() {
    return dist(this.pos.x, this.pos.y, player.pos.x, player.pos.y) < 20;
  }
}

// Function to display achievements in a styled modal
function showAchievements() {
  const modal = document.getElementById("modal");
  const achievementList = document.getElementById("achievement-list");

  if (unlockedAchievements.length > 0) {
    let achievementHTML = "<h3>You've unlocked the following achievements:</h3>";
    for (let achievement of unlockedAchievements) {
      achievementHTML += `<p><strong>${achievement.name}</strong>: ${achievement.details}</p>`;
    }
    achievementList.innerHTML = achievementHTML;
  } else {
    achievementList.innerHTML = "<p>No achievements earned this time.</p>";
  }
  unlockedAchievements = [];
  // Show the modal
  modal.style.display = "block";

  // Close modal when clicking the "Close" button
  const closeButton = document.getElementById("closeModal");
  closeButton.onclick = function() {
    modal.style.display = "none";
  }

  // Close modal when clicking the "X" button
  const span = document.getElementsByClassName("close")[0];
  span.onclick = function() {
    modal.style.display = "none";
  }

  // Close modal when clicking outside of the modal content
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  }
}
