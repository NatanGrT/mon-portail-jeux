let deck = [];
let playersHands = { human: [], bot1: [], bot2: [], bot3: [], bot4: [] };
let chien = [];
let selectedDiscards = [];
let currentDifficulty = 'intermediaire';
let totalPlayers = 4;
let gamePhase = 'setup';

let currentRound = 1;
let maxRounds = 5;
let currentContract = 'Aucun';
let contractor = ''; 

const playerOrder = ['human', 'bot1', 'bot2', 'bot3']; 
let currentDealerIndex = 0; 
let currentTurnPlayer = ''; 
let requestedColor = ''; 

let contractorBoutsCount = 0;
let liveScores = { human: 0, bot1: 0, bot2: 0, bot3: 0, bot4: 0 };
let cumulativeScores = { human: 0, bot1: 0, bot2: 0, bot3: 0, bot4: 0 };
let trickCards = []; 

const setupScreen = document.getElementById('setup-screen');
const gameBoard = document.getElementById('game-board');
const startBtn = document.getElementById('start-game-btn');
const humanHandDiv = document.getElementById('human-hand');
const gameStatus = document.getElementById('game-status');
const playedCardsZone = document.getElementById('played-cards-zone');
const biddingPanel = document.getElementById('bidding-panel');
const chienDiscardPanel = document.getElementById('chien-discard-panel');
const chienCardsZone = document.getElementById('chien-cards-zone');
const roundEndPanel = document.getElementById('round-end-panel');
const gameOverPanel = document.getElementById('game-over-panel');
const restartGameBtn = document.getElementById('restart-game-btn');

if (startBtn) startBtn.addEventListener('click', startNewGame);
if (restartGameBtn) restartGameBtn.addEventListener('click', resetAllAndRestart);

function startNewGame() {
    totalPlayers = parseInt(document.getElementById('player-count').value);
    maxRounds = parseInt(document.getElementById('round-count').value);
    currentDifficulty = document.getElementById('bot-difficulty').value;
    
    playerOrder.length = 0;
    playerOrder.push('human', 'bot1', 'bot2', 'bot3');
    if(totalPlayers === 5) {
        playerOrder.push('bot4');
        document.querySelectorAll('.id-bot4').forEach(el => el.classList.remove('hidden'));
        document.getElementById('slot-bot4').classList.remove('hidden');
    } else {
        document.querySelectorAll('.id-bot4').forEach(el => el.classList.add('hidden'));
        document.getElementById('slot-bot4').classList.add('hidden');
    }

    setupScreen.classList.add('hidden');
    gameBoard.classList.remove('hidden');
    
    cumulativeScores = { human: 0, bot1: 0, bot2: 0, bot3: 0, bot4: 0 };
    currentRound = 1;
    currentDealerIndex = 0; 
    updateCumulativeScoreboard();
    
    launchRound();
}

function launchRound() {
    liveScores = { human: 0, bot1: 0, bot2: 0, bot3: 0, bot4: 0 };
    contractorBoutsCount = 0;
    updateLiveScoreboard();
    trickCards = [];
    selectedDiscards = [];
    currentContract = 'Aucun';
    contractor = '';
    
    document.getElementById('current-round').innerText = `${currentRound} / ${maxRounds}`;
    document.getElementById('current-contract-badge').innerText = 'Aucune';
    
    const dealerLabel = playerOrder[currentDealerIndex] === 'human' ? 'Vous' : playerOrder[currentDealerIndex].toUpperCase();
    document.getElementById('current-dealer').innerText = dealerLabel;

    roundEndPanel.classList.add('hidden-panel');
    playedCardsZone.innerHTML = '';
    
    buildDeck();
    shuffleDeck();
    distributeCards();
    renderChienHidden();
    renderHumanHandWithDelay();
}

function buildDeck() {
    deck = [];
    const couleurs = ['coeur', 'carreau', 'trefle', 'pique'];
    const valeurs = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'V', 'C', 'D', 'R'];
    couleurs.forEach(c => valeurs.forEach(v => deck.push({ type: 'couleur', valeur: v, couleur: c })));
    for (let i = 1; i <= 21; i++) deck.push({ type: 'atout', valeur: i, couleur: 'atout' });
    deck.push({ type: 'excuse', valeur: 'EX', couleur: 'excuse' });
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function distributeCards() {
    const cardsPerPlayer = totalPlayers === 4 ? 18 : 15;
    const chienSize = totalPlayers === 4 ? 6 : 3;

    playersHands.human = deck.splice(0, cardsPerPlayer);
    playersHands.bot1 = deck.splice(0, cardsPerPlayer);
    playersHands.bot2 = deck.splice(0, cardsPerPlayer);
    playersHands.bot3 = deck.splice(0, cardsPerPlayer);
    if (totalPlayers === 5) playersHands.bot4 = deck.splice(0, cardsPerPlayer);
    
    chien = deck.splice(0, chienSize);
    sortHand(playersHands.human);
}

function sortHand(hand) {
    hand.sort((a, b) => {
        if (a.couleur !== b.couleur) return a.couleur.localeCompare(b.couleur);
        const valA = isNaN(a.valeur) ? 15 : parseInt(a.valeur);
        const valB = isNaN(b.valeur) ? 15 : parseInt(b.valeur);
        return valB - valA;
    });
}

function renderChienHidden() {
    chienCardsZone.innerHTML = '';
    chien.forEach(() => {
        const cEl = document.createElement('div');
        cEl.className = 'card back';
        chienCardsZone.appendChild(cEl);
    });
}

function renderHumanHandWithDelay() {
    humanHandDiv.innerHTML = '';
    gameStatus.innerText = "Distribution des cartes...";
    playersHands.human.forEach((card, index) => {
        setTimeout(() => {
            const cardEl = createCardElement(card, index);
            cardEl.classList.add('animated-deal');
            humanHandDiv.appendChild(cardEl);

            if (index === playersHands.human.length - 1) {
                startBiddingPhase();
            }
        }, index * 20);
    });
}

function createCardElement(card, index) {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.couleur}`;
    cardEl.setAttribute('data-index', index);
    cardEl.innerHTML = `<div class="top-left">${card.valeur}</div><div class="symbol-center">${getSymbol(card.couleur)}</div><div class="bottom-right">${card.valeur}</div>`;
    
    cardEl.addEventListener('click', () => handleCardClick(index, cardEl));
    return cardEl;
}

function getSymbol(couleur) {
    switch(couleur) {
        case 'coeur': return '♥'; case 'carreau': return '♦'; case 'trefle': return '♣'; case 'pique': return '♠'; case 'atout': return '★'; default: return '🃏';
    }
}

function startBiddingPhase() {
    gamePhase = 'bidding';
    gameStatus.innerText = "Faites votre annonce (Petite, Pouce, Garde...).";
    biddingPanel.classList.remove('hidden-panel');

    document.querySelectorAll('.btn-bid').forEach(btn => {
        btn.onclick = (e) => {
            const chosenBid = e.target.getAttribute('data-bid');
            processHumanBid(chosenBid);
        };
    });
}

function processHumanBid(bid) {
    biddingPanel.classList.add('hidden-panel');
    if (bid !== 'passe') {
        currentContract = bid.toUpperCase();
        contractor = 'human';
        document.getElementById('current-contract-badge').innerText = currentContract;
    }

    gameStatus.innerText = "Les robots parlent...";
    setTimeout(() => {
        if (contractor === 'human') {
            gameStatus.innerText = `Vous êtes Preneur (Contrat : ${currentContract}).`;
            if (currentContract === 'PETITE' || currentContract === 'POUCE' || currentContract === 'GARDE') {
                triggerChienIntegration();
            } else {
                startPlayingPhase();
            }
        } else {
            currentContract = 'POUCE';
            contractor = 'bot1';
            document.getElementById('current-contract-badge').innerText = "POUCE (Bot 1)";
            gameStatus.innerText = "Bot 1 prend un POUCE. Début du jeu.";
            setTimeout(startPlayingPhase, 1500);
        }
    }, 1000);
}

function triggerChienIntegration() {
    gamePhase = 'discard';
    gameStatus.innerText = "Faites votre écart du Chien.";
    
    chienCardsZone.innerHTML = '';
    chien.forEach(card => {
        const cEl = document.createElement('div');
        cEl.className = `card ${card.couleur}`;
        cEl.innerHTML = `<div class="top-left">${card.valeur}</div><div class="symbol-center">${getSymbol(card.couleur)}</div><div class="bottom-right">${card.valeur}</div>`;
        chienCardsZone.appendChild(cEl);
    });

    playersHands.human.push(...chien);
    sortHand(playersHands.human);
    renderHumanHand();

    chienDiscardPanel.classList.remove('hidden-panel');
    selectedDiscards = [];
    updateDiscardCounter();
}

function updateDiscardCounter() {
    const required = totalPlayers === 4 ? 6 : 3;
    document.getElementById('discard-count').innerText = selectedDiscards.length;
    const validateBtn = document.getElementById('validate-chien-btn');
    
    if (selectedDiscards.length === required) {
        validateBtn.disabled = false;
        validateBtn.onclick = validateChienDiscard;
    } else {
        validateBtn.disabled = true;
    }
}

function validateChienDiscard() {
    selectedDiscards.sort((a,b) => b - a);
    selectedDiscards.forEach(idx => {
        const removedCard = playersHands.human.splice(idx, 1)[0];
        if (isBout(removedCard)) contractorBoutsCount++;
    });

    chienDiscardPanel.classList.add('hidden-panel');
    renderChienHidden();
    renderHumanHand();
    startPlayingPhase();
}

function handleCardClick(index, cardEl) {
    if (gamePhase === 'discard') {
        const position = selectedDiscards.indexOf(index);
        const required = totalPlayers === 4 ? 6 : 3;
        if (position > -1) {
            selectedDiscards.splice(position, 1);
            cardEl.classList.remove('selected-discard');
        } else {
            if (selectedDiscards.length < required) {
                const card = playersHands.human[index];
                if (card.valeur === 'R' || card.couleur === 'excuse' || (card.couleur === 'atout' && (card.valeur === 1 || card.valeur === 21))) {
                    alert("Interdit d'écarter un Roi ou un Bout !");
                    return;
                }
                selectedDiscards.push(index);
                cardEl.classList.add('selected-discard');
            }
        }
        updateDiscardCounter();
    } else if (gamePhase === 'playing' && currentTurnPlayer === 'human') {
        playHumanTurn(index, cardEl);
    }
}

function startPlayingPhase() {
    gamePhase = 'playing';
    trickCards = [];
    playedCardsZone.innerHTML = '';
    
    const initialPlayerIndex = (currentDealerIndex + 1) % playerOrder.length;
    currentTurnPlayer = playerOrder[initialPlayerIndex];
    
    processGameCycle();
}

function processGameCycle() {
    if (trickCards.length === totalPlayers) {
        setTimeout(evaluateTrick, 1000);
        return;
    }

    if (currentTurnPlayer === 'human') {
        gameStatus.innerText = trickCards.length === 0 ? "À vous de commencer le pli !" : "À vous de fournir.";
    } else {
        gameStatus.innerText = `Le ${currentTurnPlayer.toUpperCase()} réfléchit...`;
        setTimeout(executeBotTurn, 500);
    }
}

function playHumanTurn(cardIndex, cardEl) {
    cardEl.classList.add('played-anim');
    setTimeout(() => {
        const cardPlayed = playersHands.human.splice(cardIndex, 1)[0];
        renderHumanHand();
        
        if (trickCards.length === 0) requestedColor = cardPlayed.couleur;
        trickCards.push({ player: 'human', card: cardPlayed });
        appendCardToTable(cardPlayed, "Vous");
        
        setNextPlayerTurn();
        processGameCycle();
    }, 1500);
}

function executeBotTurn() {
    const botHand = playersHands[currentTurnPlayer];
    const cardPlayed = getBotMove(botHand, trickCards.length === 0 ? '' : requestedColor);
    
    if (trickCards.length === 0) requestedColor = cardPlayed.couleur;
    trickCards.push({ player: 'currentTurnPlayer', playerKey: currentTurnPlayer, card: cardPlayed });
    
    appendCardToTable(cardPlayed, currentTurnPlayer.toUpperCase());
    setNextPlayerTurn();
    processGameCycle();
}

function setNextPlayerTurn() {
    const currentIndex = playerOrder.indexOf(currentTurnPlayer);
    const nextIndex = (currentIndex + 1) % playerOrder.length;
    currentTurnPlayer = playerOrder[nextIndex];
}

function getBotMove(botHand, colorReq) {
    if (!colorReq) return botHand.splice(0, 1)[0];
    const matches = botHand.filter(c => c.couleur === colorReq);
    if (matches.length > 0) return botHand.splice(botHand.indexOf(matches[0]), 1)[0];
    const atouts = botHand.filter(c => c.couleur === 'atout');
    if (atouts.length > 0) return botHand.splice(botHand.indexOf(atouts[0]), 1)[0];
    return botHand.splice(0, 1)[0];
}

function appendCardToTable(card, playerLabel) {
    const tableCard = document.createElement('div');
    tableCard.className = `card ${card.couleur}`;
    tableCard.style.transform = `scale(0.78) rotate(${Math.floor(Math.random() * 10) - 5}deg)`;
    tableCard.innerHTML = `
        <div class="top-left">${card.valeur}</div><div class="symbol-center">${getSymbol(card.couleur)}</div><div class="bottom-right">${card.valeur}</div>
        <div style="position:absolute; bottom:2px; left:0; width:100%; text-align:center; font-size:9px; font-weight:bold; color:#e1b12c;">${playerLabel}</div>
    `;
    playedCardsZone.appendChild(tableCard);
}

function isBout(card) {
    if (card.couleur === 'excuse') return true;
    if (card.couleur === 'atout' && (card.valeur === 1 || card.valeur === 21)) return true;
    return false;
}

function evaluateTrick() {
    let winningPlay = trickCards[0];
    
    for (let i = 1; i < trickCards.length; i++) {
        const current = trickCards[i];
        const currentCard = current.card;
        const bestCard = winningPlay.card;
        
        if (currentCard.couleur === 'atout' && bestCard.couleur !== 'atout') {
            winningPlay = current;
        } else if (currentCard.couleur === 'atout' && bestCard.couleur === 'atout') {
            if (currentCard.valeur > bestCard.valeur) winningPlay = current;
        } else if (currentCard.couleur === requestedColor && bestCard.couleur === requestedColor) {
            if (getCardPower(currentCard.valeur) > getCardPower(bestCard.valeur)) winningPlay = current;
        }
    }

    let pointsInTrick = 0;
    trickCards.forEach(tc => { 
        pointsInTrick += getCardPoints(tc.card); 
        if (tc.player === contractor || tc.playerKey === contractor) {
            if (isBout(tc.card)) contractorBoutsCount++;
        }
    });

    const winnerKey = winningPlay.player === 'human' ? 'human' : winningPlay.playerKey;
    liveScores[winnerKey] += Math.round(pointsInTrick);
    currentTurnPlayer = winnerKey; 

    updateLiveScoreboard();

    const displayWinnerName = winnerKey === 'human' ? 'Vous' : winnerKey.toUpperCase();
    gameStatus.innerText = `${displayWinnerName} remporte le pli (+${Math.round(pointsInTrick)} pts)`;

    setTimeout(() => {
        playedCardsZone.innerHTML = '';
        trickCards = [];
        
        if (playersHands.human.length > 0) {
            processGameCycle();
        } else {
            endRound();
        }
    }, 1300);
}

function getCardPower(val) {
    if (val === 'R') return 14; if (val === 'D') return 13; if (val === 'C') return 12; if (val === 'V') return 11;
    return parseInt(val);
}

function getCardPoints(card) {
    if (card.couleur === 'excuse') return 4.5;
    if (card.couleur === 'atout') {
        if (card.valeur === 1 || card.valeur === 21) return 4.5;
        return 0.5;
    }
    if (card.valeur === 'R') return 4.5; if (card.valeur === 'D') return 3.5; if (card.valeur === 'C') return 2.5; if (card.valeur === 'V') return 1.5;
    return 0.5;
}

function updateLiveScoreboard() {
    let attackTotal = 0;
    let defenseTotal = 0;

    for (let p in liveScores) {
        if (p === contractor) attackTotal += liveScores[p];
        else defenseTotal += liveScores[p];
    }

    document.getElementById('live-pt-attack').innerText = `${attackTotal} pt`;
    document.getElementById('live-pt-defense').innerText = `${defenseTotal} pt`;

    document.getElementById('live-pt-human').innerText = `${liveScores.human} pt`;
    document.getElementById('live-pt-bot1').innerText = `${liveScores.bot1} pt`;
    document.getElementById('live-pt-bot2').innerText = `${liveScores.bot2} pt`;
    document.getElementById('live-pt-bot3').innerText = `${liveScores.bot3} pt`;
    if(totalPlayers === 5 && document.getElementById('live-pt-bot4')) {
        document.getElementById('live-pt-bot4').innerText = `${liveScores.bot4} pt`;
    }
}

function updateCumulativeScoreboard() {
    const formatScore = (num) => num > 0 ? `+${num}` : num;
    document.getElementById('cum-pt-human').innerText = formatScore(cumulativeScores.human);
    document.getElementById('cum-pt-bot1').innerText = formatScore(cumulativeScores.bot1);
    document.getElementById('cum-pt-bot2').innerText = formatScore(cumulativeScores.bot2);
    document.getElementById('cum-pt-bot3').innerText = formatScore(cumulativeScores.bot3);
    if(totalPlayers === 5) {
        const b4Cum = document.getElementById('cum-pt-bot4');
        if(b4Cum) b4Cum.innerText = formatScore(cumulativeScores.bot4);
    }
}

function renderHumanHand() {
    humanHandDiv.innerHTML = '';
    playersHands.human.forEach((card, index) => {
        const cardEl = createCardElement(card, index);
        if (gamePhase === 'discard' && selectedDiscards.includes(index)) {
            cardEl.classList.add('selected-discard');
        }
        humanHandDiv.appendChild(cardEl);
    });
}

// --- LOGIQUE FIN DE MANCHE : MARQUE POPULAIRE / DE COMPTOIR ---
function endRound() {
    gamePhase = 'round-end';

    let pointsRequis = 56; 
    if (contractorBoutsCount === 1) pointsRequis = 51;
    else if (contractorBoutsCount === 2) pointsRequis = 41;
    else if (contractorBoutsCount >= 3) pointsRequis = 36;

    let pointsFaitsAttaque = liveScores[contractor];
    
    // Ajout automatique des points cachés du chien pour les contrats avec écart
    if (currentContract === 'PETITE' || currentContract === 'POUCE' || currentContract === 'GARDE') {
        chien.forEach(c => { pointsFaitsAttaque += getCardPoints(c); });
    }

    let difference = Math.abs(pointsFaitsAttaque - pointsRequis);
    let contratReussi = pointsFaitsAttaque >= pointsRequis;

    // ATTRIBUTION DES POINTS APPLIQUÉE SELON TON BARÈME PERSO (Points de contrat fixes) :
    let valeurContrat = 20; // Pouce par défaut
    if (currentContract === 'PETITE') valeurContrat = 10;
    else if (currentContract === 'POUCE') valeurContrat = 20;
    else if (currentContract === 'GARDE') valeurContrat = 40;
    else if (currentContract === 'SANS') valeurContrat = 80;
    else if (currentContract === 'CONTRE') valeurContrat = 160;

    // Score total de la donne = Valeur du Contrat fixe + La différence
    let scoreDonneFinal = valeurContrat + Math.round(difference);
    let nbDefenseurs = totalPlayers - 1; 

    if (contratReussi) {
        for (let player in cumulativeScores) {
            if (player === contractor) {
                cumulativeScores[player] += (scoreDonneFinal * nbDefenseurs);
            } else if (playerOrder.includes(player)) {
                cumulativeScores[player] -= scoreDonneFinal;
            }
        }
    } else {
        for (let player in cumulativeScores) {
            if (player === contractor) {
                cumulativeScores[player] -= (scoreDonneFinal * nbDefenseurs);
            } else if (playerOrder.includes(player)) {
                cumulativeScores[player] += scoreDonneFinal;
            }
        }
    }

    updateCumulativeScoreboard();

    const attackerName = contractor === 'human' ? 'Vous' : contractor.toUpperCase();
    const resultatTexte = contratReussi ? "CONTRAT REMPLI" : "CONTRAT CHUTÉ";
    
    document.getElementById('round-winner-title').innerText = `Manche ${currentRound} terminée — ${resultatTexte}`;
    document.getElementById('round-summary-text').innerHTML = `
        L'attaquant (<strong>${attackerName}</strong>) avait besoin de <strong>${pointsRequis} pts</strong>.<br>
        Il en réalise <strong>${Math.round(pointsFaitsAttaque)} pts</strong> (Différence : ${Math.round(difference)} pts).<br>
        Marque appliquée (Contrat ${currentContract}) : <strong>${contratReussi ? '+' : '-'}${scoreDonneFinal} pts</strong> par défenseur.
    `;
    
    roundEndPanel.classList.remove('hidden-panel');

    document.getElementById('next-round-btn').onclick = () => {
        if (currentRound < maxRounds) {
            currentRound++;
            currentDealerIndex = (currentDealerIndex + 1) % playerOrder.length;
            launchRound();
        } else {
            triggerGameOver();
        }
    };
}

function triggerGameOver() {
    roundEndPanel.classList.add('hidden-panel');
    gameOverPanel.classList.remove('hidden-panel');

    let grandWinner = 'human';
    let maxCum = cumulativeScores.human;
    for (let p in cumulativeScores) {
        if (cumulativeScores[p] > maxCum) { maxCum = cumulativeScores[p]; grandWinner = p; }
    }

    const finalWinner = grandWinner === 'human' ? 'Félicitations, vous gagnez la table !' : `Le vainqueur final est le ${grandWinner.toUpperCase()} !`;
    document.getElementById('game-winner-title').innerText = `${finalWinner}`;
}

function resetAllAndRestart() {
    gameOverPanel.classList.add('hidden-panel');
    gameBoard.classList.add('hidden');
    setupScreen.classList.remove('hidden');
}
