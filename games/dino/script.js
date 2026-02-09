const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let score = 0;
let gameSpeed = 5;
let isJumping = false;
let gravity = 0.6;

let dino = { x: 50, y: 150, width: 40, height: 40, dy: 0, jumpForce: 12 };
let obstacles = [];

function spawnObstacle() {
    let size = Math.random() * (50 - 20) + 20;
    obstacles.push({ x: canvas.width, y: canvas.height - size, width: 20, height: size });
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dino Physics
    if (isJumping) {
        dino.dy += gravity;
        dino.y += dino.dy;
    }
    if (dino.y > 150) {
        dino.y = 150;
        isJumping = false;
    }

    // Dessiner Dino
    ctx.fillStyle = '#38bdf8';
    ctx.shadowBlur = 15; ctx.shadowColor = '#38bdf8';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Obstacles
    if (Math.random() < 0.015) spawnObstacle();
    
    obstacles.forEach((obs, index) => {
        obs.x -= gameSpeed;
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Collision
        if (dino.x < obs.x + obs.width && dino.x + dino.width > obs.x &&
            dino.y < obs.y + obs.height && dino.y + dino.height > obs.y) {
            alert("Game Over! Score: " + Math.floor(score));
            obstacles = []; score = 0; gameSpeed = 5;
        }
        if (obs.x + obs.width < 0) obstacles.splice(index, 1);
    });

    score += 0.1;
    gameSpeed += 0.001;
    document.getElementById('score').innerText = "Score : " + Math.floor(score);
    requestAnimationFrame(update);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isJumping) {
        isJumping = true;
        dino.dy = -dino.jumpForce;
    }
});
update();