const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const numbersGrid = document.getElementById("numbers-grid");

let balance = 1000;
let isSpinning = false;
let currentRotation = 0;
let activeBets = []; // Tableau pour stocker plusieurs mises
let history = JSON.parse(localStorage.getItem('rouletteHistory')) || [];

const numbers = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const redNums = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

// 1. Générer la grille 1-36
for(let i=1; i<=36; i++) {
    let div = document.createElement("div");
    let colorClass = redNums.includes(i) ? "red" : "black";
    div.className = `num-item ${colorClass}`;
    div.innerText = i;
    div.onclick = () => addBet(`num-${i}`, 36);
    numbersGrid.appendChild(div);
}

function addBet(type, multiplier) {
    if (isSpinning) return;
    const amount = parseInt(document.getElementById("bet-amount").value);
    if (amount > balance) return alert("Pas assez de jetons !");
    
    balance -= amount;
    activeBets.push({ type, amount, multiplier });
    updateUI();
}

function clearBets() {
    if (isSpinning) return;
    activeBets.forEach(b => balance += b.amount);
    activeBets = [];
    updateUI();
}

function startSpin() {
    if (isSpinning || activeBets.length === 0) return;
    isSpinning = true;
    const spinAngle = 1800 + Math.random() * 360;
    currentRotation += spinAngle;
    canvas.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(() => {
        isSpinning = false;
        const normalized = currentRotation % 360;
        const winningIndex = Math.floor((360 - normalized + (360/37)/2) % 360 / (360/37));
        const resNum = numbers[winningIndex];
        const resColor = resNum === 0 ? "green" : (redNums.includes(resNum) ? "red" : "black");

        processResults(resNum, resColor);
    }, 4000);
}

function processResults(num, color) {
    let totalWin = 0;
    activeBets.forEach(bet => {
        let won = false;
        if(bet.type === `num-${num}`) won = true;
        else if(bet.type === 'red' && color === 'red') won = true;
        else if(bet.type === 'black' && color === 'black') won = true;
        else if(bet.type === 'p12' && num >= 1 && num <= 12) won = true;
        else if(bet.type === 'm12' && num >= 13 && num <= 24) won = true;
        else if(bet.type === 'd12' && num >= 25 && num <= 36) won = true;
        else if(bet.type === 'pair' && num !== 0 && num % 2 === 0) won = true;
        else if(bet.type === 'impair' && num !== 0 && num % 2 !== 0) won = true;
        else if(bet.type === 'manque' && num >= 1 && num <= 18) won = true;
        else if(bet.type === 'passe' && num >= 19 && num <= 36) won = true;

        if(won) totalWin += bet.amount * bet.multiplier;
    });

    balance += totalWin;
    history.unshift({ num, color });
    if(history.length > 50) history.pop();
    localStorage.setItem('rouletteHistory', JSON.stringify(history));
    
    activeBets = [];
    updateUI();
    updateStats();
}

function updateStats() {
    if (history.length === 0) return;
    const reds = history.filter(h => h.color === 'red').length;
    const blacks = history.filter(h => h.color === 'black').length;
    document.getElementById("stat-red").innerText = Math.round((reds/history.length)*100);
    document.getElementById("stat-black").innerText = Math.round((blacks/history.length)*100);

    const counts = {};
    history.forEach(h => counts[h.num] = (counts[h.num] || 0) + 1);
    const sorted = Object.keys(counts).sort((a,b) => counts[b] - counts[a]);
    document.getElementById("hot-numbers").innerText = sorted.slice(0, 3).join(', ') || '-';
    document.getElementById("cold-numbers").innerText = sorted.slice(-3).reverse().join(', ') || '-';
}

function updateUI() {
    document.getElementById("balance").innerText = balance;
    const totalMise = activeBets.reduce((sum, b) => sum + b.amount, 0);
    document.getElementById("active-bets-display").innerText = `Mises: ${totalMise} jetons (${activeBets.length} paris)`;
    
    const histDiv = document.getElementById("history");
    histDiv.innerHTML = history.slice(0, 12).map(h => 
        `<span class="history-item" style="background:${h.color === 'red' ? '#ef4444' : (h.color === 'black' ? '#1e293b' : '#10b981')}">${h.num}</span>`
    ).join('');
}

// (Ajoute ici ta fonction drawWheel() habituelle...)
updateUI();
updateStats();
function drawWheel() {
    const slice = (Math.PI * 2) / numbers.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    numbers.forEach((num, i) => {
        const angle = i * slice;
        
        // Dessin du segment
        ctx.beginPath();
        ctx.fillStyle = (num === 0) ? "#10b981" : (redNums.includes(num) ? "#ef4444" : "#1e293b");
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, 170, angle, angle + slice);
        ctx.fill();
        
        // Bordure dorée pour le style "Barrière"
        ctx.strokeStyle = "rgba(251, 191, 36, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Ajout des numéros
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle + slice / 2);
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Orbitron"; // Style gaming
        ctx.textAlign = "right";
        ctx.fillText(num, 155, 5);
        ctx.restore();
    });

    // Cercle central (Le moyeu de la roue)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
    ctx.fillStyle = "#111827";
    ctx.fill();
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Appelle la fonction pour l'affichage initial
drawWheel();