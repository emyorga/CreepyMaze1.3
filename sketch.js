// Define the map with walls (1) and open spaces (0)
const gameMap = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

let player;
let wallTexture;
let bgMusic;
let t = 0; // Time variable for the warped background
let collectibles = []; // Array to hold collectible objects
const numCollectibles = 5; // Number of collectibles
let pillars = []; // Array to hold pillar positions
let collectedCount = 0; // Counter for collectibles collected

let scaryImage;
let screechSound;
let showScaryImage = false;
let scaryTime = 60000; // 1 minute in milliseconds (initial time)
let startTime;
const extraTimePerCollectible = 60000; // Extra 1 minute per collectible

function preload() {
  wallTexture = loadImage('wallll.jpg'); // Wall texture
  bgMusic = loadSound('Crowander - Creepy Atmo.mp3'); // Background music
  scaryImage = loadImage('scary_image2.jpg'); // Scary image to display
  screechSound = loadSound('screech.mp3'); // Screech sound effect
}

function setup() {
  createCanvas(800, 800);
  player = {
    x: 3.5, // Player's starting X position
    y: 3.5, // Player's starting Y position
    angle: 0, // Player's initial direction facing
    fov: PI / 3, // Field of view (60 degrees)
    speed: 0.03 // Movement speed
  };

  bgMusic.loop(); // Play the background music in a loop

  // Generate random collectibles
  findPillars();
  generateCollectibles();
  
  startTime = millis(); // Start the timer
}

function draw() {
  let elapsedTime = millis() - startTime; // Calculate elapsed time
  
  if (elapsedTime > scaryTime && !showScaryImage) {
    showScaryImage = true;
    screechSound.play(); // Play the screech sound
  }
  
  // If the scary event is triggered, display the image
  if (showScaryImage) {
    image(scaryImage, 0, 0, width, height); // Display the scary image
    return; // Exit the draw loop after the image appears
  }
  
  // Create a simple, constantly shifting background effect
  createSimpleWarpedBackground();

  // Draw the walls with textures
  for (let i = 0; i < width; i++) {
    let rayAngle = player.angle + atan((i - width / 2) / (width / 2)) * player.fov;
    let distanceToWall = castRay(rayAngle);

    let lineHeight = height / (distanceToWall + 0.0001);
    let lineTop = (height - lineHeight) / 2;
    let lineBottom = lineTop + lineHeight;

    let textureX = int(map(distanceToWall, 0, 20, 0, wallTexture.width - 1));

    let texHeight = int(lineHeight);
    copy(wallTexture, textureX, 0, 1, wallTexture.height, i, int(lineTop), 1, texHeight); // Apply texture
  }

  // Draw collectibles if player is facing them
  drawCollectibles();

  movePlayer(); // Update player position
  checkCollection(); // Check for collectible collection
  
  // Draw the collectibles counter
  drawCounter();
}

// Function to find pillar positions
function findPillars() {
  for (let y = 0; y < gameMap.length; y++) {
    for (let x = 0; x < gameMap[y].length; x++) {
      if (gameMap[y][x] === 1) {
        pillars.push({ x: x, y: y });
      }
    }
  }
}

// Function to generate random collectible positions
function generateCollectibles() {
  for (let i = 0; i < numCollectibles; i++) {
    let pillar = random(pillars);
    collectibles.push({ x: pillar.x, y: pillar.y, collected: false });
  }
}

// Function to create a simple, constantly shifting background effect
function createSimpleWarpedBackground() {
  background(0); // Start with a solid black background

  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      let noiseValue = noise(x * 0.01, y * 0.01, t * 0.01);
      let redValue = map(noiseValue, 0, 1, 0, 255);
      fill(redValue, 0, 0); // Set fill color to red shades
      noStroke();
      rect(x, y, 10, 10);
    }
  }
  t += 0.02; // Increment time to create continuous movement
}

// Function to draw collectibles if the player is facing them
function drawCollectibles() {
  for (let i = 0; i < collectibles.length; i++) {
    if (!collectibles[i].collected) {
      let angleToCollectible = atan2(collectibles[i].y - player.y, collectibles[i].x - player.x);
      let distanceToCollectible = dist(player.x, player.y, collectibles[i].x, collectibles[i].y);

      // Check if the collectible is within the player's field of view and distance
      if (abs(angleToCollectible - player.angle) < player.fov / 2 && distanceToCollectible < 5) {
        fill(255, 0, 0); // Red color for collectible
        noStroke();
        ellipse(width / 2, height / 2, 20, 20); // Draw the collectible at the center
      }
    }
  }
}

// Function to move the player
function movePlayer() {
  let moveStep = player.speed;

  if (keyIsDown(87)) { // W key
    let newX = player.x + cos(player.angle) * moveStep;
    let newY = player.y + sin(player.angle) * moveStep;
    if (gameMap[int(newY)][int(newX)] === 0) { // Check for walls
      player.x = newX;
      player.y = newY;
    }
  }
  if (keyIsDown(83)) { // S key
    let newX = player.x - cos(player.angle) * moveStep;
    let newY = player.y - sin(player.angle) * moveStep;
    if (gameMap[int(newY)][int(newX)] === 0) {
      player.x = newX;
      player.y = newY;
    }
  }
  if (keyIsDown(65)) { // A key
    player.angle -= 0.03; // Rotate counterclockwise
  }
  if (keyIsDown(68)) { // D key
    player.angle += 0.03; // Rotate clockwise
  }
}

// Function to cast a ray and determine wall distance
function castRay(angle) {
  let sinA = sin(angle);
  let cosA = cos(angle);

  let x = player.x;
  let y = player.y;

  while (true) {
    x += cosA * 0.01;
    y += sinA * 0.01;

    if (gameMap[int(y)][int(x)] === 1) {
      return dist(player.x, player.y, x, y);
    }
  }
}

// Function to check if the player collects a collectible
function checkCollection() {
  for (let i = 0; i < collectibles.length; i++) {
    if (!collectibles[i].collected) {
      let distance = dist(player.x, player.y, collectibles[i].x, collectibles[i].y);
      if (distance < 0.5) { // Collect the item if within range
        collectibles[i].collected = true;
        collectedCount++;
        scaryTime += extraTimePerCollectible; // Add extra time to scaryTime
      }
    }
  }
}

// Function to draw the collectibles counter on the screen
function drawCounter() {
  fill(255);
  textSize(20);
  text("Collected: " + collectedCount + " / " + numCollectibles, 10, 30);
}
