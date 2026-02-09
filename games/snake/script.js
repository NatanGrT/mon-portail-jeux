const canvas = document.getElementById("snakeGame");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score-val");
// On récupère l'élément du record (pense à ajouter id="high-score-val" dans ton HTML)
const highScoreElement = document.getElementById("high-score-val");

const box = 20; // Taille d'une case
let score = 0;
// On charge le record depuis la mémoire du navigateur dès le début
let highScore = localStorage.getItem("snakeHighScore") || 0;
if (highScoreElement) highScoreElement.innerText = highScore;

let game;
let snake = [{ x: 10 * box, y: 10 * box }];
let food = {
    x: Math.floor(Math.random() * 19 + 1) * box,
    y: Math.floor(Math.random() * 19 + 1) * box
};
let d; 

document.addEventListener("keydown", direction);

function direction(event) {
    if(event.keyCode == 37 && d != "RIGHT") d = "LEFT";
    else if(event.keyCode == 38 && d != "DOWN") d = "UP";
    else if(event.keyCode == 39 && d != "LEFT") d = "RIGHT";
    else if(event.keyCode == 40 && d != "UP") d = "DOWN";
}

function collision(head, array) {
    for(let i = 0; i < array.length; i++) {
        if(head.x == array[i].x && head.y == array[i].y) return true;
    }
    return false;
}

function draw() {
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for(let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i == 0) ? "#38bdf8" : "#94a3b8"; 
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "#020617";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "#f87171"; 
    ctx.fillRect(food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if( d == "LEFT") snakeX -= box;
    if( d == "UP") snakeY -= box;
    if( d == "RIGHT") snakeX += box;
    if( d == "DOWN") snakeY += box;

    if(snakeX == food.x && snakeY == food.y) {
        score++;
        scoreElement.innerText = score;
        food = {
            x: Math.floor(Math.random() * 19 + 1) * box,
            y: Math.floor(Math.random() * 19 + 1) * box
        };
    } else {
        snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };

    if(snakeX < 0 || snakeX >= canvas.width || snakeY < 0 || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        
        // --- LOGIQUE DU HIGH SCORE ---
        if (score > highScore) {
            highScore = score;
            localStorage.setItem("snakeHighScore", highScore); // On enregistre
            if (highScoreElement) highScoreElement.innerText = highScore;
            alert("NOUVEAU RECORD ! Score final : " + score);
        } else {
            alert("Game Over ! Score final : " + score);
        }
    }

    snake.unshift(newHead);
}

function startGame() {
    clearInterval(game);
    score = 0;
    scoreElement.innerText = score;
    d = undefined;
    snake = [{ x: 10 * box, y: 10 * box }];
    game = setInterval(draw, 100);
}

document.getElementById("restart").addEventListener("click", startGame);
startGame();