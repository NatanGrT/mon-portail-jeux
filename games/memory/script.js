const allEmojis = ['🎮','🕹️','👾','🚀','💎','🎯','🔥','⚡','🛸','👻','⭐','🌈','🍀','🍎','🍄','🐱','🐶','🦊','🐯','🐸','🦄','🐝','🎨','🎬','🎸','🎹','🏀','⚽','🍕','🍦','🌍','🌋'];
let cards = [];
let flippedCards = [];
let scores = { p1: 0, p2: 0 };
let turn = "p1";
let vsAI = true;
let lockBoard = false;
let memoryBank = [];

function toggleMode() {
    vsAI = !vsAI;
    document.getElementById('p2-name-display')?.remove(); // Nettoyage si besoin
    document.querySelector('.p2').firstChild.textContent = vsAI ? "IA: " : "J2: ";
    document.getElementById('mode-btn').innerText = vsAI ? "Mode: VS Ordinateur" : "Mode: 2 Joueurs";
    initGame();
}

function initGame() {
    const size = parseInt(document.getElementById('difficulty').value);
    const totalCards = size * size;
    const selectedEmojis = allEmojis.slice(0, totalCards / 2);
    cards = [...selectedEmojis, ...selectedEmojis];
    cards.sort(() => Math.random() - 0.5);

    scores = { p1: 0, p2: 0 };
    turn = "p1";
    flippedCards = [];
    lockBoard = false;
    memoryBank = [];

    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        if(size > 4) card.classList.add('small');
        card.dataset.value = emoji;
        card.dataset.index = index;
        card.innerHTML = `<div class="front">${emoji}</div><div class="back">?</div>`;
        card.addEventListener('click', () => handleFlip(card));
        grid.appendChild(card);
    });
    updateUI();
}

function handleFlip(card) {
    if (lockBoard || card.classList.contains('flipped') || (vsAI && turn === "p2")) return;
    executeFlip(card);
    if (flippedCards.length === 2) checkMatch();
}

function executeFlip(card) {
    card.classList.add('flipped');
    flippedCards.push(card);
    if (!memoryBank.find(m => m.index == card.dataset.index)) {
        memoryBank.push({ index: card.dataset.index, value: card.dataset.value });
    }
}

function checkMatch() {
    lockBoard = true;
    const [c1, c2] = flippedCards;
    const match = c1.dataset.value === c2.dataset.value;

    if (match) {
        scores[turn]++;
        flippedCards = [];
        lockBoard = false;
        updateUI();
        if (!checkGameOver() && vsAI && turn === "p2") setTimeout(aiTurn, 800);
    } else {
        setTimeout(() => {
            c1.classList.remove('flipped');
            c2.classList.remove('flipped');
            flippedCards = [];
            turn = turn === "p1" ? "p2" : "p1";
            lockBoard = false;
            updateUI();
            if (vsAI && turn === "p2") setTimeout(aiTurn, 800);
        }, 1000);
    }
}

function aiTurn() {
    if (turn !== "p2") return;
    let choice1, choice2;
    
    // 1. Chercher une paire connue
    let pair = findPairInMem();
    if (pair) {
        choice1 = document.querySelector(`[data-index="${pair[0].index}"]`);
        choice2 = document.querySelector(`[data-index="${pair[1].index}"]`);
    } else {
        // 2. Sinon, piocher au hasard
        const available = Array.from(document.querySelectorAll('.card:not(.flipped)'));
        choice1 = available[Math.floor(Math.random() * available.length)];
        executeFlip(choice1);
        
        // Après avoir vu la 1ère, l'IA vérifie si elle connaît le double
        let match = memoryBank.find(m => m.value === choice1.dataset.value && m.index != choice1.dataset.index);
        if (match && !document.querySelector(`[data-index="${match.index}"]`).classList.contains('flipped')) {
            choice2 = document.querySelector(`[data-index="${match.index}"]`);
        } else {
            const others = Array.from(document.querySelectorAll('.card:not(.flipped)'));
            choice2 = others[Math.floor(Math.random() * others.length)];
        }
    }

    if (flippedCards.length < 1) executeFlip(choice1);
    setTimeout(() => {
        executeFlip(choice2);
        checkMatch();
    }, 600);
}

function findPairInMem() {
    for (let i = 0; i < memoryBank.length; i++) {
        for (let j = i + 1; j < memoryBank.length; j++) {
            if (memoryBank[i].value === memoryBank[j].value) {
                const c1 = document.querySelector(`[data-index="${memoryBank[i].index}"]`);
                const c2 = document.querySelector(`[data-index="${memoryBank[j].index}"]`);
                if (!c1.classList.contains('flipped') && !c2.classList.contains('flipped')) return [memoryBank[i], memoryBank[j]];
            }
        }
    }
    return null;
}

function updateUI() {
    document.getElementById('s1').innerText = scores.p1;
    document.getElementById('s2').innerText = scores.p2;
    document.getElementById('box-p1').className = `score-box p1 ${turn === "p1" ? 'active' : ''}`;
    document.getElementById('box-p2').className = `score-box p2 ${turn === "p2" ? 'active' : ''}`;
}

function checkGameOver() {
    if (document.querySelectorAll('.card:not(.flipped)').length === 0) {
        let msg = scores.p1 > scores.p2 ? "Le Joueur 1 gagne !" : (scores.p1 < scores.p2 ? "L'IA gagne !" : "Égalité !");
        setTimeout(() => alert(msg), 500);
        return true;
    }
    return false;
}

initGame();