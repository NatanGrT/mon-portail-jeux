const boardElement = document.getElementById('board');
const diffSelect = document.getElementById('difficulty');
const restartBtn = document.getElementById('restart');
let board = [], ROWS, COLS, MINES, gameOver = false;

function initGame() {
    const size = parseInt(diffSelect.value);
    ROWS = COLS = size;
    MINES = Math.floor(size * size * 0.15);
    boardElement.style.gridTemplateColumns = `repeat(${COLS}, 25px)`;
    boardElement.innerHTML = '';
    board = []; gameOver = false;

    for (let r = 0; r < ROWS; r++) {
        let row = [];
        for (let c = 0; c < COLS; c++) {
            let cell = document.createElement('div');
            cell.classList.add('cell');
            cell.addEventListener('click', () => clickCell(r, c));
            cell.addEventListener('contextmenu', (e) => { e.preventDefault(); flagCell(r, c); });
            boardElement.appendChild(cell);
            row.push({ mine: false, revealed: false, flag: false, element: cell, count: 0 });
        }
        board.push(row);
    }
    for(let m=0; m<MINES; m++){
        let r = Math.floor(Math.random()*ROWS), c = Math.floor(Math.random()*COLS);
        board[r][c].mine ? m-- : board[r][c].mine = true;
    }
    for(let r=0; r<ROWS; r++) for(let c=0; c<COLS; c++) if(!board[r][c].mine) board[r][c].count = countAround(r,c);
}

function countAround(r, c) {
    let count = 0;
    for(let i=-1; i<=1; i++) for(let j=-1; j<=1; j++) if(board[r+i]?.[c+j]?.mine) count++;
    return count;
}

function clickCell(r, c) {
    if (gameOver || board[r][c].revealed || board[r][c].flag) return;
    board[r][c].revealed = true;
    board[r][c].element.classList.add('revealed');
    if (board[r][c].mine) {
        board[r][c].element.innerText = "💣"; board[r][c].element.classList.add('mine');
        gameOver = true; alert("Game Over!");
    } else {
        if (board[r][c].count > 0) board[r][c].element.innerText = board[r][c].count;
        else for(let i=-1; i<=1; i++) for(let j=-1; j<=1; j++) if(board[r+i]?.[c+j]) clickCell(r+i, c+j);
    }
}

function flagCell(r, c) {
    if (gameOver || board[r][c].revealed) return;
    board[r][c].flag = !board[r][c].flag;
    board[r][c].element.innerText = board[r][c].flag ? "🚩" : "";
    board[r][c].element.classList.toggle('flag');
}

restartBtn.addEventListener('click', initGame);
initGame();