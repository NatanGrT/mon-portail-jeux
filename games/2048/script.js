const gridDisplay = document.getElementById('grid');
const scoreDisplay = document.getElementById('score-val'); // Pense à mettre id="score-val" dans ton HTML
const highDisplay = document.getElementById('high-score-val'); // Pense à mettre id="high-score-val" dans ton HTML

let board = Array(16).fill(0);
let score = 0;
let highScore = localStorage.getItem('2048HighScore') || 0;

// Affichage initial du record
if (highDisplay) highDisplay.innerText = highScore;

function init() {
    board = Array(16).fill(0);
    score = 0;
    updateScoreUI();
    addNumber();
    addNumber();
    render();
}

function addNumber() {
    let empty = board.map((v, i) => v === 0 ? i : null).filter(v => v !== null);
    if (empty.length) {
        board[empty[Math.floor(Math.random() * empty.length)]] = Math.random() > 0.1 ? 2 : 4;
    }
}

function render() {
    gridDisplay.innerHTML = '';
    board.forEach(val => {
        let tile = document.createElement('div');
        tile.classList.add('tile');
        tile.innerText = val === 0 ? "" : val;
        tile.setAttribute('data-val', val);
        gridDisplay.appendChild(tile);
    });
}

// Logique de glissement et fusion avec calcul du score
function slide(row) {
    let arr = row.filter(val => val); 
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            score += arr[i]; // On ajoute la valeur de la fusion au score
            arr[i + 1] = 0;
        }
    }
    arr = arr.filter(val => val);
    while (arr.length < 4) arr.push(0);
    return arr;
}

function updateScoreUI() {
    if (scoreDisplay) scoreDisplay.innerText = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('2048HighScore', highScore);
        if (highDisplay) highDisplay.innerText = highScore;
    }
}

function handleInput(e) {
    let oldBoard = [...board];
    
    for (let i = 0; i < 4; i++) {
        let row = [];
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            row = [board[i*4], board[i*4+1], board[i*4+2], board[i*4+3]];
            if (e.key === 'ArrowRight') row.reverse();
            let newRow = slide(row);
            if (e.key === 'ArrowRight') newRow.reverse();
            for (let j = 0; j < 4; j++) board[i*4+j] = newRow[j];
        } 
        else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            row = [board[i], board[i+4], board[i+8], board[i+12]];
            if (e.key === 'ArrowDown') row.reverse();
            let newRow = slide(row);
            if (e.key === 'ArrowDown') newRow.reverse();
            for (let j = 0; j < 4; j++) board[i+j*4] = newRow[j];
        }
    }

    if (JSON.stringify(oldBoard) !== JSON.stringify(board)) {
        addNumber();
        updateScoreUI(); // Mise à jour des scores après le mouvement
        render();
    }
}

window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        handleInput(e);
    }
});

init();
