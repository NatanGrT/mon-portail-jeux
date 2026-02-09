let board = ["", "", "", "", "", "", "", "", ""];
let scores = { p1: 0, p2: 0 };
let currentPlayer = "X";
let gameActive = true;
let vsAI = true;

const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Lignes
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonnes
    [0, 4, 8], [2, 4, 6]             // Diagonales
];

function toggleMode() {
    vsAI = !vsAI;
    document.getElementById('p2-name').innerText = vsAI ? "IA" : "JOUEUR 2";
    document.getElementById('mode-btn').innerText = vsAI ? "Mode: VS Ordinateur" : "Mode: 2 Joueurs";
    resetGame();
}

function handleMove(i) {
    if (board[i] !== "" || !gameActive) return;

    board[i] = currentPlayer;
    render();

    if (checkWin(currentPlayer)) return endGame(currentPlayer);
    if (!board.includes("")) return endGame("draw");

    if (vsAI && currentPlayer === "X") {
        currentPlayer = "O";
        gameActive = false;
        setTimeout(aiTurn, 600);
    } else {
        currentPlayer = (currentPlayer === "X") ? "O" : "X";
    }
}

function aiTurn() {
    let choice = getBestMove();
    
    board[choice] = "O";
    render();

    if (checkWin("O")) return endGame("O");
    if (!board.includes("")) return endGame("draw");
    
    currentPlayer = "X";
    gameActive = true;
}

// L'intelligence de l'ordinateur
function getBestMove() {
    // 1. CHERCHER À GAGNER
    for (let combo of winPatterns) {
        let line = combo.map(i => board[i]);
        if (line.filter(v => v === "O").length === 2 && line.filter(v => v === "").length === 1) {
            return combo[line.indexOf("")];
        }
    }

    // 2. BLOQUER LE JOUEUR
    for (let combo of winPatterns) {
        let line = combo.map(i => board[i]);
        if (line.filter(v => v === "X").length === 2 && line.filter(v => v === "").length === 1) {
            return combo[line.indexOf("")];
        }
    }

    // 3. PRENDRE LE CENTRE SI DISPONIBLE
    if (board[4] === "") return 4;

    // 4. PRENDRE UN COIN AU HASARD
    let corners = [0, 2, 6, 8].filter(i => board[i] === "");
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

    // 5. PRENDRE CE QUI RESTE
    let emptyCells = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function checkWin(p) {
    return winPatterns.some(c => c.every(i => board[i] === p));
}

function render() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((c, i) => {
        c.innerText = board[i];
        c.className = `cell ${board[i]}`;
    });
}

function endGame(winner) {
    gameActive = false;
    if (winner === "X") scores.p1++;
    else if (winner === "O") scores.p2++;
    
    document.getElementById('s1').innerText = scores.p1;
    document.getElementById('s2').innerText = scores.p2;
    
    let msg = (winner === "draw") ? "Match nul !" : (winner === "X" ? "Bravo, tu as gagné !" : (vsAI ? "L'ordinateur a gagné !" : "Le Joueur 2 gagne !"));
    setTimeout(() => alert(msg), 200);
}

function resetGame() {
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;
    render();
}