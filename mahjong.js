let tiles = [];
let tileSize = { width: 58, height: 78 };
let tileImages = [];
let selectedTiles = [];
let gif1, gif2;  // GIF elements to animate
let gif1Pos = null, gif2Pos = null;  // Store positions of matching tiles
let gifTimer = 0;
let errorTiles = [];  // Store non-matching tiles
let errorTimer = 0;   // Timer for error highlighting
let shakingTile = null; // Store the tile that is shaking
let shakeTimer = 0;   // Timer for shake animation
let shakeAmount = 0;  // Current shake amount

function preload() {
  for (let i = 1; i <= 20; i++) {
    tileImages.push(loadImage(`tile${i}.png`));
  }
  gif1 = loadImage('seg1.gif');
  gif2 = loadImage('seg1.gif');
}

function setup() {
  createCanvas(700, 600);
  
  clear();
  placeTiles();
}

function draw() {
  background(240);
  clear();
  tiles.sort((a, b) => a.z - b.z);
  
  for (let tile of tiles) {
    // Check if this tile is in the error state
    let isErrorTile = errorTiles.includes(tile);
    
    // Calculate shake offset if this is the shaking tile
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    
    if (tile === shakingTile && frameCount - shakeTimer < 30) {
      // Create a decreasing shake effect
      let shakeProgress = (frameCount - shakeTimer) / 30;
      let shakeMagnitude = 5 * (1 - shakeProgress);
      shakeOffsetX = sin(frameCount * 0.8) * shakeMagnitude;
    }
    
    if (selectedTiles.includes(tile)) {
      //yellow
      fill(255, 255, 0, 100);
      rect(tile.x - 5, tile.y - 5, tileSize.width + 10, tileSize.height + 10);
    } else if (isErrorTile && frameCount - errorTimer < 45) {
      //red
      fill(255, 0, 0, 100);
      rect(tile.x - 5, tile.y - 5, tileSize.width + 10, tileSize.height + 10);
    }
    
    image(tile.img, tile.x + shakeOffsetX, tile.y + shakeOffsetY, tileSize.width, tileSize.height);
  }

  // Clear error tiles after the animation duration
  if (errorTiles.length > 0 && frameCount - errorTimer >= 45) {
    errorTiles = [];
  }
  
  // Clear shaking tile after the animation duration
  if (shakingTile && frameCount - shakeTimer >= 30) {
    shakingTile = null;
  }

  // Animate the GIFs if they're being used
  if (gif1Pos && gif2Pos) {
    let gif1X = gif1Pos.x;
    let gif1Y = gif1Pos.y;
    let gif2X = gif2Pos.x;
    let gif2Y = gif2Pos.y;
    
    let gifSize = { width: 58, height: 78 };

    // Display GIFs at the matching positions
    if (frameCount - gifTimer < 43) { // Show the GIFs for a short time (43 frames)
      image(gif1, gif1X, gif1Y, gifSize.width, gifSize.height);
      image(gif2, gif2X, gif2Y, gifSize.width, gifSize.height);
    }

    // Remove GIFs after the animation duration
    if (frameCount - gifTimer >= 43) {
      gif1Pos = null;
      gif2Pos = null;
    }
  }
}

function isTileFree(tile) {
  let leftBlocked = false;
  let rightBlocked = false;
  let isOverlapped = false;
  
  for (let otherTile of tiles) {
    if (otherTile === tile) continue;
    
    if (otherTile.z > tile.z) {
      if (
        otherTile.x < tile.x + tileSize.width &&
        otherTile.x + tileSize.width > tile.x &&
        Math.abs(otherTile.y - tile.y) < tileSize.height
      ) {
        isOverlapped = true;
        break;
      }
    }
    
    if (
      otherTile.z === tile.z &&
      otherTile.x + tileSize.width > tile.x - 5 &&
      otherTile.x + tileSize.width <= tile.x + 5 &&
      Math.abs(otherTile.y - tile.y) < tileSize.height
    ) {
      leftBlocked = true;
    }
    
    if (
      otherTile.z === tile.z &&
      otherTile.x < tile.x + tileSize.width + 5 &&
      otherTile.x >= tile.x + tileSize.width - 5 &&
      Math.abs(otherTile.y - tile.y) < tileSize.height
    ) {
      rightBlocked = true;
    }
  }
  
  return !isOverlapped && !(leftBlocked && rightBlocked);
}

function mousePressed() {
  for (let i = tiles.length - 1; i >= 0; i--) {
    let tile = tiles[i];
    if (
      mouseX >= tile.x && 
      mouseX <= tile.x + tileSize.width &&
      mouseY >= tile.y && 
      mouseY <= tile.y + tileSize.height
    ) {
      if (isTileFree(tile)) {
        if (selectedTiles.includes(tile)) {
          selectedTiles = selectedTiles.filter(t => t !== tile);
        } else {
          selectedTiles.push(tile);
        }
        
        if (selectedTiles.length === 2) {
          if (selectedTiles[0].img === selectedTiles[1].img) {
            // Store positions for GIFs
            gif1Pos = { x: selectedTiles[0].x, y: selectedTiles[0].y };
            gif2Pos = { x: selectedTiles[1].x, y: selectedTiles[1].y };
            
            // Set GIFs' positions at the matching tiles 
            gifTimer = frameCount;  // Start the GIF animation timer

            // Remove the matching tiles after the animation
            tiles = tiles.filter(t => !selectedTiles.includes(t));
          } else {
            // Tiles don't match, show error highlight
            errorTiles = [...selectedTiles];
            errorTimer = frameCount;  // Start the error animation timer
          }
          selectedTiles = [];
        }
      } else {
        // Tile is not free, start shake animation
        shakingTile = tile;
        shakeTimer = frameCount;
      }
      break;
    }
  }
}

function placeTiles() {
  //1st row
  tiles.push({ x: 380, y: 10, z: 1, img: tileImages[4] });
  //2nd row
  tiles.push({ x: 320, y: 90, z: 1, img: tileImages[18] });
  tiles.push({ x: 380, y: 90, z: 1, img: tileImages[0] });
  tiles.push({ x: 350, y: 90, z: 2, img: tileImages[5] });
  //3rd row
  tiles.push({ x: 40, y: 170, z: 1, img: tileImages[8] });
  tiles.push({ x: 100, y: 170, z: 1, img: tileImages[2] });
  tiles.push({ x: 160, y: 170, z: 1, img: tileImages[16] });
  tiles.push({ x: 220, y: 170, z: 1, img: tileImages[12] });
  tiles.push({ x: 280, y: 170, z: 1, img: tileImages[1] });
  tiles.push({ x: 340, y: 170, z: 1, img: tileImages[3] });
  tiles.push({ x: 70, y: 170, z: 2, img: tileImages[6] });
  tiles.push({ x: 130, y: 170, z: 2, img: tileImages[13] });
  tiles.push({ x: 190, y: 170, z: 2, img: tileImages[9] });
  tiles.push({ x: 410, y: 150, z: 3, img: tileImages[17] });
  //4th row
  tiles.push({ x: 220, y: 250, z: 1, img: tileImages[14] });
  tiles.push({ x: 280, y: 250, z: 1, img: tileImages[17] });
  tiles.push({ x: 340, y: 250, z: 1, img: tileImages[10] });
  tiles.push({ x: 370, y: 200, z: 2, img: tileImages[1] });
  //5th row
  tiles.push({ x: 220, y: 330, z: 1, img: tileImages[7] });
  tiles.push({ x: 280, y: 330, z: 1, img: tileImages[3] });
  tiles.push({ x: 340, y: 330, z: 1, img: tileImages[7] });
  tiles.push({ x: 400, y: 330, z: 1, img: tileImages[19] });
  tiles.push({ x: 460, y: 330, z: 1, img: tileImages[10] });
  tiles.push({ x: 520, y: 330, z: 1, img: tileImages[14] });
  tiles.push({ x: 250, y: 330, z: 2, img: tileImages[19] });
  tiles.push({ x: 430, y: 330, z: 2, img: tileImages[12] });
  tiles.push({ x: 550, y: 330, z: 2, img: tileImages[18] });
  //6th row
  tiles.push({ x: 160, y: 410, z: 1, img: tileImages[15] });
  tiles.push({ x: 220, y: 410, z: 1, img: tileImages[13] });
  tiles.push({ x: 280, y: 410, z: 1, img: tileImages[15] });
  tiles.push({ x: 400, y: 410, z: 1, img: tileImages[16] });
  tiles.push({ x: 190, y: 410, z: 2, img: tileImages[0] });
  tiles.push({ x: 250, y: 410, z: 2, img: tileImages[6] });
  tiles.push({ x: 310, y: 410, z: 2, img: tileImages[4] });
  tiles.push({ x: 430, y: 410, z: 2, img: tileImages[9] });
  tiles.push({ x: 460, y: 370, z: 3, img: tileImages[2] });
  //7th row
  tiles.push({ x: 340, y: 490, z: 1, img: tileImages[11] });
  tiles.push({ x: 400, y: 490, z: 1, img: tileImages[5] });
  tiles.push({ x: 460, y: 490, z: 1, img: tileImages[11] });
  tiles.push({ x: 370, y: 490, z: 2, img: tileImages[8] });
}



/* function toggleGifVisibility() {
  const gif = document.getElementById('shooting-star');

  // Show the GIF
  gif.style.display = 'block';

  // Hide the GIF after 10 seconds
  setTimeout(() => {
    gif.style.display = 'none';
  }, 1000); // 10000ms = 10 seconds
}

// Repeat the process every 10 seconds
setInterval(toggleGifVisibility, 10000); // 10000ms = 10 seconds

// Initially call to show the GIF once when the page loads
toggleGifVisibility(); */