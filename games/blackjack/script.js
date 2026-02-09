const suits = ['♠', '♣', '♥', '♦'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
let deck = [], playerHand = [], dealerHand = [], balance = 1000, currentBet = 0;

function initDeck() {
    deck = [];
    for (let s of suits) for (let v of values) deck.push({ v, s });
    deck = deck.sort(() => Math.random() - 0.5);
}

function getScore(hand) {
    let score = hand.reduce((total, card) => {
        if (['J', 'Q', 'K'].includes(card.v)) return total + 10;
        if (card.v === 'A') return total + 11;
        return total + parseInt(card.v);
    }, 0);
    let aces = hand.filter(c => c.v === 'A').length;
    while (score > 21 && aces > 0) { score -= 10; aces--; }
    return score;
}

function render() {
    document.getElementById('player-cards').innerHTML = playerHand.map(c => `<div class="card ${['♥','♦'].includes(c.s)?'red':''}">${c.v}${c.s}</div>`).join('');
    document.getElementById('dealer-cards').innerHTML = dealerHand.map((c, i) => `<div class="card ${['♥','♦'].includes(c.s)?'red':''}">${i===1 && dealerHand.length===2 && document.getElementById('btn-hit').disabled===false ? '?' : c.v+c.s}</div>`).join('');
    document.getElementById('player-score-badge').innerText = getScore(playerHand);
    document.getElementById('balance').innerText = balance;
}

function startNewGame() {
    currentBet = parseInt(document.getElementById('bet-input').value);
    if (currentBet > balance) return alert("Solde insuffisant");
    balance -= currentBet;
    initDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    document.getElementById('btn-deal').disabled = true;
    document.getElementById('btn-hit').disabled = false;
    document.getElementById('btn-stand').disabled = false;
    document.getElementById('status-label').innerText = "VOTRE TOUR";
    render();
}

function playerHit() {
    playerHand.push(deck.pop());
    render();
    if (getScore(playerHand) > 21) finish("BUST ! PERDU", 0);
}

async function playerStand() {
    document.getElementById('btn-hit').disabled = true;
    document.getElementById('btn-stand').disabled = true;
    while (getScore(dealerHand) < 17) {
        dealerHand.push(deck.pop());
        render();
        await new Promise(r => setTimeout(r, 600));
    }
    const ps = getScore(playerHand), ds = getScore(dealerHand);
    if (ds > 21 || ps > ds) finish("GAGNÉ !", currentBet * 2);
    else if (ps < ds) finish("PERDU", 0);
    else finish("ÉGALITÉ", currentBet);
}

function finish(msg, win) {
    balance += win;
    document.getElementById('status-label').innerText = msg;
    document.getElementById('last-win').innerText = win;
    document.getElementById('btn-deal').disabled = false;
    document.getElementById('btn-hit').disabled = true;
    document.getElementById('btn-stand').disabled = true;
    render();
}