const ROWS = 6;
const COLS = 7;
let board = [];
let scores = { p1: 0, p2: 0 };
let turn = "red";
let vsAI = true;
let gameActive = true;

function toggleMode() {
    vsAI = !vsAI;
    document.getElementById('p2-name').innerText = vsAI ? "IA" : "J2";
    document.getElementById('mode-btn').innerText = vsAI ? "Mode: VS Ordinateur" : "Mode: 2 Joueurs";
    initGame();
}

function initGame() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(null));
    gameActive = true;
    turn = "red";
    drawBoard();
}

function drawBoard() {
    const grid = document.getElementById('board');
    grid.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('p4-cell');
            if (board[r][c]) cell.classList.add(board[r][c]);
            cell.onclick = () => handleMove(c);
            grid.appendChild(cell);
        }
    }
}

function handleMove(c) {
    if (!gameActive || (vsAI && turn === "yellow")) return;
    if (makeMove(c, "red")) {
        if (checkWin("red")) return endGame("red");
        if (isFull()) return endGame("draw");
        turn = "yellow";
        if (vsAI) setTimeout(aiTurn, 600);
    }
}

function makeMove(c, color) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!board[r][c]) {
            board[r][c] = color;
            drawBoard();
            return true;
        }
    }
    return false;
}

function aiTurn() {
    let choices = [];
    for (let c = 0; c < COLS; c++) { if (!board[0][c]) choices.push(c); }
    
    // IA Basique : cherche à bloquer ou gagner au hasard
    let move = choices[Math.floor(Math.random() * choices.length)];
    
    makeMove(move, "yellow");
    if (checkWin("yellow")) return endGame("yellow");
    turn = "red";
}

function checkWin(color) {
    // Horizontal, Vertical, Diagonale... (Logique simplifiée pour le copier-coller)
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            if (board[r][c] === color && board[r][c+1] === color && board[r][c+2] === color && board[r][c+3] === color) return true;
        }
    }
    for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] === color && board[r+1][c] === color && board[r+2][c] === color && board[r+3][c] === color) return true;
        }
    }
    // (Ajouter diagonales pour version complète)
    return false;
}

function endGame(winner) {
    gameActive = false;
    if (winner === "red") scores.p1++;
    else if (winner === "yellow") scores.p2++;
    document.getElementById('s1').innerText = scores.p1;
    document.getElementById('s2').innerText = scores.p2;
    setTimeout(() => alert(winner === "draw" ? "Match nul !" : "Victoire !"), 200);
}

initGame();