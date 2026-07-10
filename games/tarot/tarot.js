let deck = [];
let playersHands = { human: [], bot1: [], bot2: [], bot3: [], bot4: [] };
let wonTricks = { human: [], bot1: [], bot2: [], bot3: [], bot4: [] }; 
let chien = [];
let selectedDiscards = [];
let currentDifficulty = 'intermediaire';
let totalPlayers = 4;
let gamePhase = 'setup';

let currentRound = 1;
let maxRounds = 5;
let currentContract = 'Aucun';
let contractor = ''; 

// --- VARIABLES POUR LE MODE 5 JOUEURS ---
let calledKingSuit = ''; 
let partnerKey = '';     
let partnerRevealed = false; 

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
const gameOverPanel = document.getElementById('gameOverPanel') || document.getElementById('game-over-panel');
const restartGameBtn = document.getElementById('restart-game-btn');

if (startBtn) startBtn.addEventListener('click', startNewGame);
if (restartGameBtn) restartGameBtn.addEventListener('click', resetAllAndRestart);

function startNewGame() {
    totalPlayers = parseInt(document.getElementById('player-count')?.value || 4);
    maxRounds = parseInt(document.getElementById('round-count')?.value || 5);
    currentDifficulty = document.getElementById('bot-difficulty')?.value || 'intermediaire';
    
    playerOrder.length = 0;
    playerOrder.push('human', 'bot1', 'bot2', 'bot3');
    if(totalPlayers === 5) {
        playerOrder.push('bot4');
        if(document.getElementById('slot-bot4')) document.getElementById('slot-bot4').classList.remove('hidden');
        document.querySelectorAll('.id-bot4').forEach(el => el.classList.remove('hidden'));
    } else {
        if(document.getElementById('slot-bot4')) document.getElementById('slot-bot4').classList.add('hidden');
        document.querySelectorAll('.id-bot4').forEach(el => el.classList.add('hidden'));
    }

    if (setupScreen) setupScreen.classList.add('hidden');
    if (gameBoard) gameBoard.classList.remove('hidden');
    
    cumulativeScores = { human: 0, bot1: 0, bot2: 0, bot3: 0, bot4: 0 };
    currentRound = 1;
    currentDealerIndex = 0; 
    updateCumulativeScoreboard();
    
    launchRound();
}

function launchRound() {
    liveScores = { human: 0, bot1: 0, bot2: 0, bot3: 0, bot4: 0 };
    wonTricks = { human: [], bot1: [], bot2: [], bot3: [], bot4: [] };
    contractorBoutsCount = 0;
    
    calledKingSuit = '';
    partnerKey = '';
    partnerRevealed = false;

    updateLiveScoreboard();
    trickCards = [];
    selectedDiscards = [];
    currentContract = 'Aucun';
    contractor = '';
    
    if (document.getElementById('current-round')) document.getElementById('current-round').innerText = `${currentRound} / ${maxRounds}`;
    if (document.getElementById('current-contract-badge')) document.getElementById('current-contract-badge').innerText = 'Aucune';
    
    const dealerLabel = playerOrder[currentDealerIndex] === 'human' ? 'Vous' : playerOrder[currentDealerIndex].toUpperCase();
    if (document.getElementById('current-dealer')) document.getElementById('current-dealer').innerText = dealerLabel;

    if (roundEndPanel) roundEndPanel.classList.add('hidden-panel');
    if (playedCardsZone) playedCardsZone.innerHTML = '';
    
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
    if (!chienCardsZone) return;
    chienCardsZone.innerHTML = '';
    chien.forEach(() => {
        const cEl = document.createElement('div');
        cEl.className = 'card back';
        chienCardsZone.appendChild(cEl);
    });
}

function renderHumanHandWithDelay() {
    if (!humanHandDiv) return;
    humanHandDiv.innerHTML = '';
    humanHandDiv.style.visibility = 'visible';
    humanHandDiv.style.overflow = 'visible'; 
    
    if (gameStatus) gameStatus.innerText = "Distribution des cartes...";
    playersHands.human.forEach((card, index) => {
        setTimeout(() => {
            const cardEl = createCardElement(card, index);
            cardEl.classList.add('animated-deal');
            humanHandDiv.appendChild(cardEl);

            if (index === playersHands.human.length - 1) {
                startBiddingPhase();
            }
        }, index * 25);
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
    if (gameStatus) gameStatus.innerText = "Faites votre annonce (Petite, Pousse, Garde...).";
    if (biddingPanel) biddingPanel.classList.remove('hidden-panel');

    document.querySelectorAll('.btn-bid').forEach(btn => {
        btn.onclick = (e) => {
            const chosenBid = e.target.getAttribute('data-bid');
            processHumanBid(chosenBid);
        };
    });
}

function processHumanBid(bid) {
    if (biddingPanel) biddingPanel.classList.add('hidden-panel');
    if (bid !== 'passe') {
        currentContract = bid.toUpperCase();
        contractor = 'human';
        if (document.getElementById('current-contract-badge')) document.getElementById('current-contract-badge').innerText = currentContract;
    }

    if (gameStatus) gameStatus.innerText = "Les robots parlent...";
    setTimeout(() => {
        if (contractor === 'human') {
            if (totalPlayers === 5) {
                askForKing();
            } else {
                continueAfterBid();
            }
        } else {
            currentContract = 'POUCE';
            contractor = 'bot1';
            
            if (totalPlayers === 5) {
                const suits = ['coeur', 'carreau', 'trefle', 'pique'];
                calledKingSuit = suits[Math.floor(Math.random() * 4)];
                findPartner();
                const symbol = getSymbol(calledKingSuit);
                
                if(document.getElementById('current-contract-badge')) {
                    document.getElementById('current-contract-badge').innerText = `POUCE (Bot 1) + R de ${symbol}`;
                }
                if (gameStatus) gameStatus.innerText = `Bot 1 prend une POUCE et appelle le Roi de ${symbol}.`;
            } else {
                if (document.getElementById('current-contract-badge')) document.getElementById('current-contract-badge').innerText = "POUCE (Bot 1)";
                if (gameStatus) gameStatus.innerText = "Bot 1 prend une POUCE.";
            }
            continueAfterBid();
        }
    }, 1000);
}

function askForKing() {
    let choix = prompt("Choisissez la couleur du Roi à appeler :\n1: Cœur\n2: Carreau\n3: Trèfle\n4: Pique", "1");
    
    if (choix === "2") calledKingSuit = 'carreau';
    else if (choix === "3") calledKingSuit = 'trefle';
    else if (choix === "4") calledKingSuit = 'pique';
    else calledKingSuit = 'coeur';

    findPartner();
    const symbol = getSymbol(calledKingSuit);
    
    if (document.getElementById('current-contract-badge')) {
        document.getElementById('current-contract-badge').innerText = `${currentContract} + R de ${symbol}`;
    }
    if (gameStatus) gameStatus.innerText = `Vous appelez le Roi de ${symbol}.`;
    
    continueAfterBid();
}

function findPartner() {
    for (let p in playersHands) {
        let hasKing = playersHands[p].some(card => card.valeur === 'R' && card.couleur === calledKingSuit);
        if (hasKing) {
            partnerKey = p;
            break;
        }
    }
}

function continueAfterBid() {
    gamePhase = 'reveal-chien';
    if (gameStatus) gameStatus.innerText = "Révélation du Chien...";
    
    if (chienCardsZone) {
        chienCardsZone.innerHTML = '';
        chien.forEach((card, index) => {
            const cEl = document.createElement('div');
            cEl.className = `card ${card.couleur} animated-deal`;
            cEl.style.animationDelay = `${index * 150}ms`;
            cEl.innerHTML = `<div class="top-left">${card.valeur}</div><div class="symbol-center">${getSymbol(card.couleur)}</div><div class="bottom-right">${card.valeur}</div>`;
            chienCardsZone.appendChild(cEl);
        });
    }

    setTimeout(() => {
        if (currentContract === 'PETITE' || currentContract === 'POUCE' || currentContract === 'GARDE') {
            if (contractor === 'human') {
                triggerChienIntegration();
            } else {
                playersHands[contractor].push(...chien);
                sortHand(playersHands[contractor]);
                renderChienHidden();
                startPlayingPhase();
            }
        } else {
            renderChienHidden();
            startPlayingPhase();
        }
    }, 2500);
}

function triggerChienIntegration() {
    gamePhase = 'discard';
    const required = totalPlayers === 4 ? 6 : 3;
    if (gameStatus) gameStatus.innerText = `Faites votre écart du Chien (${required} cartes).`;
    
    if (chienCardsZone) {
        chienCardsZone.innerHTML = '';
        chien.forEach(card => {
            const cEl = document.createElement('div');
            cEl.className = `card ${card.couleur}`;
            cEl.innerHTML = `<div class="top-left">${card.valeur}</div><div class="symbol-center">${getSymbol(card.couleur)}</div><div class="bottom-right">${card.valeur}</div>`;
            chienCardsZone.appendChild(cEl);
        });
    }

    playersHands.human.push(...chien);
    sortHand(playersHands.human);
    renderHumanHand();

    if (chienDiscardPanel) {
        chienDiscardPanel.classList.remove('hidden-panel');
        const counterContainer = chienDiscardPanel.querySelector('p');
        if (counterContainer) {
            counterContainer.innerHTML = `Cartes écartées : <span id="discard-count">0</span> / ${required}`;
        }
    }
    selectedDiscards = [];
    updateDiscardCounter();
}

function updateDiscardCounter() {
    const required = totalPlayers === 4 ? 6 : 3;
    if (document.getElementById('discard-count')) document.getElementById('discard-count').innerText = selectedDiscards.length;
    const validateBtn = document.getElementById('validate-chien-btn');
    
    if (validateBtn) {
        if (selectedDiscards.length === required) {
            validateBtn.disabled = false;
            validateBtn.onclick = validateChienDiscard;
        } else {
            validateBtn.disabled = true;
        }
    }
}

function validateChienDiscard() {
    selectedDiscards.sort((a,b) => b - a);
    selectedDiscards.forEach(idx => {
        const removedCard = playersHands.human.splice(idx, 1)[0];
        wonTricks.human.push(removedCard); 
    });

    if (chienDiscardPanel) chienDiscardPanel.classList.add('hidden-panel');
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
        if (!isCardPlayable(playersHands.human[index], playersHands.human)) {
            alert("Coup illégal ! Vous devez fournir à la couleur, couper ou surcouper si possible.");
            return;
        }
        gamePhase = 'waiting'; 
        playHumanTurn(index, cardEl);
    }
}

function isCardPlayable(card, hand) {
    if (card.couleur === 'excuse') return true; 
    if (!requestedColor) return true; 

    if (requestedColor !== 'atout') {
        const hasColor = hand.some(c => c.couleur === requestedColor);
        if (hasColor) return card.couleur === requestedColor;

        const hasAtout = hand.some(c => c.couleur === 'atout');
        if (hasAtout) {
            if (card.couleur !== 'atout') return false;
            return checkSurcoupe(card, hand);
        }
        return true; 
    } else {
        const hasAtout = hand.some(c => c.couleur === 'atout');
        if (hasAtout) {
            if (card.couleur !== 'atout') return false;
            return checkSurcoupe(card, hand);
        }
        return true; 
    }
}

function checkSurcoupe(card, hand) {
    let maxAtoutOnTable = 0;
    trickCards.forEach(tc => {
        if (tc.card.couleur === 'atout' && tc.card.valeur !== 'EX') {
            if (tc.card.valeur > maxAtoutOnTable) maxAtoutOnTable = tc.card.valeur;
        }
    });

    if (maxAtoutOnTable === 0) return true; 

    const canSurcouper = hand.some(c => c.couleur === 'atout' && c.valeur > maxAtoutOnTable);
    if (canSurcouper) {
        return card.valeur > maxAtoutOnTable;
    }
    return true; 
}

function startPlayingPhase() {
    gamePhase = 'playing';
    trickCards = [];
    if (playedCardsZone) playedCardsZone.innerHTML = '';
    
    const initialPlayerIndex = (currentDealerIndex + 1) % playerOrder.length;
    currentTurnPlayer = playerOrder[initialPlayerIndex];
    
    processGameCycle();
}

function processGameCycle() {
    if (trickCards.length === totalPlayers) {
        setTimeout(evaluateTrick, 1000);
        return;
    }

    gamePhase = 'playing'; 
    if (currentTurnPlayer === 'human') {
        if (gameStatus) gameStatus.innerText = trickCards.length === 0 ? "À vous de commencer le pli !" : "À vous de fournir.";
        renderHumanHand(); 
    } else {
        if (gameStatus) gameStatus.innerText = `Le ${currentTurnPlayer.toUpperCase()} réfléchit...`;
        setTimeout(executeBotTurn, 500);
    }
}

function playHumanTurn(cardIndex, cardEl) {
    cardEl.classList.add('played-anim');
    setTimeout(() => {
        const cardPlayed = playersHands.human.splice(cardIndex, 1)[0];
        
        checkPartnerReveal(cardPlayed, 'human');

        if (trickCards.length === 0) {
            requestedColor = cardPlayed.couleur === 'excuse' ? '' : cardPlayed.couleur;
        }
        
        trickCards.push({ player: 'human', card: cardPlayed });
        appendCardToTable(cardPlayed, "Vous");
        
        renderHumanHand();
        setNextPlayerTurn();
        processGameCycle();
    }, 400); 
}

function executeBotTurn() {
    const botHand = playersHands[currentTurnPlayer];
    const cardPlayed = getBotMove(botHand, trickCards.length === 0 ? '' : requestedColor);
    
    checkPartnerReveal(cardPlayed, currentTurnPlayer);

    if (trickCards.length === 0 && cardPlayed.couleur !== 'excuse') {
        requestedColor = cardPlayed.couleur;
    }
    trickCards.push({ player: currentTurnPlayer, card: cardPlayed });
    
    appendCardToTable(cardPlayed, currentTurnPlayer.toUpperCase());
    setNextPlayerTurn();
    processGameCycle();
}

function checkPartnerReveal(card, playerKey) {
    if (totalPlayers === 5 && !partnerRevealed && card.valeur === 'R' && card.couleur === calledKingSuit) {
        partnerRevealed = true;
        const name = playerKey === 'human' ? 'Vous' : playerKey.toUpperCase();
        const contractorName = contractor === 'human' ? 'Vous' : contractor.toUpperCase();
        
        alert(`📢 Le Roi de ${getSymbol(calledKingSuit)} est sorti ! ${name} est le partenaire de l'Attaque !`);
        
        const symbol = getSymbol(calledKingSuit);
        const partnerLabel = playerKey === 'human' ? 'Vous' : playerKey.toUpperCase();
        if (document.getElementById('current-contract-badge')) {
            document.getElementById('current-contract-badge').innerText = `${currentContract} + R de ${symbol} (${contractorName} + ${partnerLabel})`;
        }
        updateLiveScoreboard();
    }
}

function setNextPlayerTurn() {
    const currentIndex = playerOrder.indexOf(currentTurnPlayer);
    const nextIndex = (currentIndex + 1) % playerOrder.length;
    currentTurnPlayer = playerOrder[nextIndex];
}

function getBotMove(botHand, colorReq) {
    let legalCards = botHand.filter(c => isCardPlayable(c, botHand));
    if (legalCards.length === 0) legalCards = botHand; 

    const chosenCard = legalCards[0];
    return botHand.splice(botHand.indexOf(chosenCard), 1)[0];
}

function appendCardToTable(card, playerLabel) {
    if (!playedCardsZone) return;
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
    let winningPlay = null;
    
    let validPlays = trickCards.filter(tc => tc.card.couleur !== 'excuse');
    if (validPlays.length === 0) validPlays = [trickCards[0]]; 

    winningPlay = validPlays[0];
    
    let realRequestedColor = requestedColor;
    if (!realRequestedColor && trickCards.length > 0) {
        const firstNonExcuse = trickCards.find(tc => tc.card.couleur !== 'excuse');
        if (firstNonExcuse) realRequestedColor = firstNonExcuse.card.couleur;
    }

    for (let i = 1; i < validPlays.length; i++) {
        const current = validPlays[i];
        const currentCard = current.card;
        const bestCard = winningPlay.card;
        
        if (currentCard.couleur === 'atout' && bestCard.couleur !== 'atout') {
            winningPlay = current;
        } else if (currentCard.couleur === 'atout' && bestCard.couleur === 'atout') {
            if (currentCard.valeur > bestCard.valeur) winningPlay = current;
        } else if (currentCard.couleur === realRequestedColor && bestCard.couleur === realRequestedColor) {
            if (getCardPower(currentCard.valeur) > getCardPower(bestCard.valeur)) winningPlay = current;
        }
    }

    let pointsInTrick = 0;
    const winnerKey = winningPlay.player;

    trickCards.forEach(tc => { 
        pointsInTrick += getCardPoints(tc.card); 
        if (tc.card.couleur === 'excuse') {
            wonTricks[tc.player].push(tc.card);
        } else {
            wonTricks[winnerKey].push(tc.card); 
        }
    });

    liveScores[winnerKey] += Math.round(pointsInTrick);
    currentTurnPlayer = winnerKey; 
    requestedColor = ''; 

    updateLiveScoreboard();

    const displayWinnerName = winnerKey === 'human' ? 'Vous' : winnerKey.toUpperCase();
    if (gameStatus) gameStatus.innerText = `${displayWinnerName} remporte le pli (+${Math.round(pointsInTrick)} pts)`;

    setTimeout(() => {
        if (playedCardsZone) playedCardsZone.innerHTML = '';
        trickCards = [];
        
        if (playersHands.human && playersHands.human.length > 0) {
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
        if (totalPlayers === 5) {
            // RÈGLE DE L'ANONYMAT TANT QUE LE ROI N'EST PAS REVELE :
            // Si le partenaire n'est pas encore connu, seule l'équipe du preneur est à l'Attaque, tous les autres en Défense.
            if (p === contractor || (partnerRevealed && p === partnerKey)) {
                attackTotal += liveScores[p];
            } else {
                defenseTotal += liveScores[p];
            }
        } else {
            // Mode classique 4 joueurs
            if (p === contractor) {
                attackTotal += liveScores[p];
            } else {
                defenseTotal += liveScores[p];
            }
        }
    }

    if (document.getElementById('live-pt-attack')) document.getElementById('live-pt-attack').innerText = `${attackTotal} pt`;
    if (document.getElementById('live-pt-defense')) document.getElementById('live-pt-defense').innerText = `${defenseTotal} pt`;

    if (document.getElementById('live-pt-human')) document.getElementById('live-pt-human').innerText = `${liveScores.human} pt`;
    if (document.getElementById('live-pt-bot1')) document.getElementById('live-pt-bot1').innerText = `${liveScores.bot1} pt`;
    if (document.getElementById('live-pt-bot2')) document.getElementById('live-pt-bot2').innerText = `${liveScores.bot2} pt`;
    if (document.getElementById('live-pt-bot3')) document.getElementById('live-pt-bot3').innerText = `${liveScores.bot3} pt`;
    if (totalPlayers === 5 && document.getElementById('live-pt-bot4')) {
        document.getElementById('live-pt-bot4').innerText = `${liveScores.bot4} pt`;
    }
}

function updateCumulativeScoreboard() {
    const formatScore = (num) => num > 0 ? `+${num}` : num;
    if (document.getElementById('cum-pt-human')) document.getElementById('cum-pt-human').innerText = formatScore(cumulativeScores.human);
    if (document.getElementById('cum-pt-bot1')) document.getElementById('cum-pt-bot1').innerText = formatScore(cumulativeScores.bot1);
    if (document.getElementById('cum-pt-bot2')) document.getElementById('cum-pt-bot2').innerText = formatScore(cumulativeScores.bot2);
    if (document.getElementById('cum-pt-bot3')) document.getElementById('cum-pt-bot3').innerText = formatScore(cumulativeScores.bot3);
    if (totalPlayers === 5) {
        const b4Cum = document.getElementById('cum-pt-bot4');
        if(b4Cum) b4Cum.innerText = formatScore(cumulativeScores.bot4);
    }
}

function renderHumanHand() {
    if (!humanHandDiv) return;
    humanHandDiv.innerHTML = '';
    humanHandDiv.style.overflow = 'visible';
    
    playersHands.human.forEach((card, index) => {
        const cardEl = createCardElement(card, index);
        
        if (gamePhase === 'discard' && selectedDiscards.includes(index)) {
            cardEl.classList.add('selected-discard');
        }
        
        if (gamePhase === 'playing' && currentTurnPlayer === 'human') {
            if (!isCardPlayable(card, playersHands.human)) {
                cardEl.style.opacity = "0.4";
                cardEl.style.filter = "grayscale(60%)";
                cardEl.style.cursor = "not-allowed";
            } else {
                cardEl.style.boxShadow = "0 0 10px rgba(225, 177, 44, 0.4)";
            }
        }
        
        humanHandDiv.appendChild(cardEl);
    });
}

function endRound() {
    gamePhase = 'round-end';

    if (currentContract === 'PETITE' || currentContract === 'POUCE' || currentContract === 'GARDE') {
        if (wonTricks[contractor]) wonTricks[contractor].push(...chien);
    }

    let totalAttackCards = wonTricks[contractor] ? [...wonTricks[contractor]] : [];
    if (totalPlayers === 5 && partnerKey !== contractor && wonTricks[partnerKey]) {
        totalAttackCards.push(...wonTricks[partnerKey]);
    }
    contractorBoutsCount = totalAttackCards.filter(card => isBout(card)).length;

    let pointsRequis = 56; 
    if (contractorBoutsCount === 1) pointsRequis = 51;
    else if (contractorBoutsCount === 2) pointsRequis = 41;
    else if (contractorBoutsCount >= 3) pointsRequis = 36;

    let pointsFaitsAttaque = 0;
    totalAttackCards.forEach(c => { pointsFaitsAttaque += getCardPoints(c); });

    let difference = Math.abs(pointsFaitsAttaque - pointsRequis);
    let contratReussi = pointsFaitsAttaque >= pointsRequis;

    let baseContrat = 20; 
    if (currentContract === 'PETITE') baseContrat = 10;
    else if (currentContract === 'POUCE') baseContrat = 20;
    else if (currentContract === 'GARDE') baseContrat = 40;
    else if (currentContract === 'SANS') baseContrat = 80;
    else if (currentContract === 'CONTRE') baseContrat = 160;

    let scoreDonneFinal = baseContrat + Math.round(difference);
    scoreDonneFinal = Math.round(scoreDonneFinal / 10) * 10; 

    if (totalPlayers === 5 && partnerKey !== contractor) {
        let gainPreneur = scoreDonneFinal * 2;
        let gainPartenaire = scoreDonneFinal * 1;
        
        for (let player in cumulativeScores) {
            if (!playerOrder.includes(player)) continue;
            if (contratReussi) {
                if (player === contractor) cumulativeScores[player] += gainPreneur;
                else if (player === partnerKey) cumulativeScores[player] += gainPartenaire;
                else cumulativeScores[player] -= scoreDonneFinal;
            } else {
                if (player === contractor) cumulativeScores[player] -= gainPreneur;
                else if (player === partnerKey) cumulativeScores[player] -= gainPartenaire;
                else cumulativeScores[player] += scoreDonneFinal;
            }
        }
    } else {
        let nbDefenseurs = totalPlayers - 1; 
        for (let player in cumulativeScores) {
            if (!playerOrder.includes(player)) continue;
            if (contratReussi) {
                if (player === contractor) cumulativeScores[player] += (scoreDonneFinal * nbDefenseurs);
                else cumulativeScores[player] -= scoreDonneFinal;
            } else {
                if (player === contractor) cumulativeScores[player] -= (scoreDonneFinal * nbDefenseurs);
                else cumulativeScores[player] += scoreDonneFinal;
            }
        }
    }

    updateCumulativeScoreboard();

    const attackerName = contractor === 'human' ? 'Vous' : contractor.toUpperCase();
    let partnerNameText = "";
    if (totalPlayers === 5) {
        const partnerName = partnerKey === 'human' ? 'Vous' : partnerKey.toUpperCase();
        partnerNameText = partnerKey === contractor ? " (Tout seul !)" : ` (avec l'aide de <strong>${partnerName}</strong>)`;
    }

    const resultatTexte = contratReussi ? "CONTRAT REMPLI" : "CONTRAT CHUTÉ";
    
    if (document.getElementById('round-winner-title')) {
        document.getElementById('round-winner-title').innerText = `Manche ${currentRound} terminée — ${resultatTexte}`;
    }
    if (document.getElementById('round-summary-text')) {
        document.getElementById('round-summary-text').innerHTML = `
            L'attaquant (<strong>${attackerName}</strong>)${partnerNameText} avait besoin de <strong>${pointsRequis} pts</strong>.<br>
            L'équipe réalise <strong>${Math.round(pointsFaitsAttaque)} pts</strong>.<br>
            Valeur nette appliquée (avec arrondi rond) pour ce contrat (${currentContract}) : <strong>${scoreDonneFinal} pts</strong>.
        `;
    }
    
    if (roundEndPanel) roundEndPanel.classList.remove('hidden-panel');

    const nextBtn = document.getElementById('next-round-btn');
    if (nextBtn) {
        nextBtn.onclick = () => {
            if (currentRound < maxRounds) {
                currentRound++;
                currentDealerIndex = (currentDealerIndex + 1) % playerOrder.length;
                launchRound();
            } else {
                triggerGameOver();
            }
        };
    }
}

function triggerGameOver() {
    if (roundEndPanel) roundEndPanel.classList.add('hidden-panel');
    if (gameOverPanel) gameOverPanel.classList.remove('hidden-panel');

    let grandWinner = 'human';
    let maxCum = cumulativeScores.human;
    for (let p in cumulativeScores) {
        if (cumulativeScores[p] > maxCum) { maxCum = cumulativeScores[p]; grandWinner = p; }
    }

    const finalWinner = grandWinner === 'human' ? 'Félicitations, vous gagnez la table !' : `Le vainqueur final est le ${grandWinner.toUpperCase()} !`;
    if (document.getElementById('game-winner-title')) {
        document.getElementById('game-winner-title').innerText = `${finalWinner}`;
    }
}

function resetAllAndRestart() {
    if (gameOverPanel) gameOverPanel.classList.add('hidden-panel');
    if (gameBoard) gameBoard.classList.add('hidden');
    if (setupScreen) setupScreen.classList.remove('hidden');
}
