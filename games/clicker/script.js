// --- CONFIGURATION ET ÉTAT DU JEU ---
let state = {
    score: 0,
    totalScoreThisLoop: 0,
    baseObjective: 1000,
    difficultyMultiplier: 1.5, // Augmente la difficulté de 50% par prestige
    
    // Prestige
    prestigeLevel: 0,
    gems: 0,
    clickUpgradeLevel: 0,
    discountUpgradeLevel: 0,

    // Auto-Mineurs (Id, BaseCost, BaseBps, Count, CurrentCost)
    miners: [
        { id: 1, baseCost: 15, bps: 1, count: 0, cost: 15 },
        { id: 2, baseCost: 100, bps: 8, count: 0, cost: 100 },
        { id: 3, baseCost: 1100, bps: 50, count: 0, cost: 1100 },
        { id: 4, baseCost: 12000, bps: 400, count: 0, cost: 12000 }
    ]
};

let eventActiveMultiplier = 1;

// --- DÉDUCTION DES VARIABLES CALCULÉES ---
function getObjectiveNeeded() {
    return Math.floor(state.baseObjective * Math.pow(state.difficultyMultiplier, state.prestigeLevel));
}

function getClickPower() {
    return (1 + state.clickUpgradeLevel) * (1 + state.prestigeLevel * 0.15);
}

function getGlobalMultiplier() {
    return (1 + state.prestigeLevel * 0.15); // +15% de bonus passif par niveau de prestige
}

function getDiscount() {
    return Math.pow(0.90, state.discountUpgradeLevel); // -10% composé par niveau d'achat
}

function calculateTotalBPS() {
    let totalBase = state.miners.reduce((sum, m) => sum + (m.count * m.bps), 0);
    return totalBase * getGlobalMultiplier() * eventActiveMultiplier;
}

// --- SYSTÈME D'ÉVÉNEMENTS POP-UP (ANTI-AFK) ---
function spawnRandomEvent() {
    // N'apparaît que si le joueur a déjà fait au moins un reload ou a atteint 300 points
    if(state.prestigeLevel === 0 && state.totalScoreThisLoop < 300) return;

    const container = document.getElementById('event-container');
    const eventEl = document.createElement('div');
    eventEl.className = 'random-anomaly';
    
    // Position aléatoire sur l'écran
    const x = Math.random() * (window.innerWidth - 100);
    const y = Math.random() * (window.innerHeight - 100);
    eventEl.style.left = `${x}px`;
    eventEl.style.top = `${y}px`;
    eventEl.innerText = "⚡ ANOMALIE ⚡";

    // Durée de vie du pop-up : 6 secondes pour cliquer dessus
    let timeout = setTimeout(() => { eventEl.remove(); }, 6000);

    eventEl.addEventListener('click', () => {
        clearTimeout(timeout);
        eventEl.remove();
        triggerBonusPeriod();
    });

    container.appendChild(eventEl);
}

function triggerBonusPeriod() {
    eventActiveMultiplier = 3; // Production x3 !
    document.getElementById('active-event-alert').classList.remove('hidden');
    
    setTimeout(() => {
        eventActiveMultiplier = 1;
        document.getElementById('active-event-alert').classList.add('hidden');
        updateUI();
    }, 10000); // Dure 10 secondes
}

// Déclenche une chance d'événement toutes les 25 secondes
setInterval(() => {
    if(Math.random() < 0.4) spawnRandomEvent(); // 40% de chance d'apparition
}, 25000);


// --- MISE À JOUR DE L'INTERFACE UI ---
function updateUI() {
    const objective = getObjectiveNeeded();
    
    document.getElementById('score-display').innerText = Math.floor(state.score).toLocaleString();
    document.getElementById('bps-display').innerText = calculateTotalBPS().toFixed(1);
    document.getElementById('global-mult').innerText = Math.floor(getGlobalMultiplier() * 100);
    document.getElementById('prestige-level').innerText = state.prestigeLevel;
    document.getElementById('prestige-gems').innerText = state.gems;
    document.getElementById('req-score').innerText = objective.toLocaleString();

    // Boutons des Auto-Mineurs
    state.miners.forEach(m => {
        m.cost = Math.floor(m.baseCost * Math.pow(1.15, m.count) * getDiscount());
        document.getElementById(`cost-${m.id}`).innerText = m.cost.toLocaleString();
        document.getElementById(`count-${m.id}`).innerText = m.count;
        
        const btn = document.getElementById(`buy-${m.id}`);
        btn.disabled = state.score < m.cost;
    });

    // Bouton de Prestige principal
    const prestigeBtn = document.getElementById('prestige-btn');
    if (state.totalScoreThisLoop >= objective) {
        prestigeBtn.disabled = false;
        prestigeBtn.classList.add('ready');
    } else {
        prestigeBtn.disabled = true;
        prestigeBtn.classList.remove('ready');
    }

    // Boutons de la boutique Prestige
    const clickUpgradeCost = Math.floor(1 * Math.pow(2, state.clickUpgradeLevel));
    const discountUpgradeCost = Math.floor(2 * Math.pow(2.5, state.discountUpgradeLevel));

    const clickBtn = document.getElementById('upgrade-click');
    clickBtn.innerText = `Surcharge Clic (Prix: ${clickUpgradeCost} 💎)`;
    clickBtn.disabled = state.gems < clickUpgradeCost;

    const discBtn = document.getElementById('upgrade-discount');
    discBtn.innerText = `Optimisation (Prix: ${discountUpgradeCost} 💎)`;
    discBtn.disabled = state.gems < discountUpgradeCost;
}

// --- BOUTONS INTERACTIONS ---

// Le Clic principal
document.getElementById('click-me').addEventListener('click', (e) => {
    let earned = getClickPower() * eventActiveMultiplier;
    state.score += earned;
    state.totalScoreThisLoop += earned;
    
    // Création d'un petit chiffre volant au clic
    createFloatingText(e.clientX, e.clientY, `+${Math.floor(earned)}`);
    updateUI();
});

function createFloatingText(x, y, text) {
    const txt = document.createElement('div');
    txt.className = 'floating-text';
    txt.style.left = `${x}px`;
    txt.style.top = `${y}px`;
    txt.innerText = text;
    document.body.appendChild(txt);
    setTimeout(() => txt.remove(), 800);
}

// Achats d'auto-mineurs
state.miners.forEach(m => {
    document.getElementById(`buy-${m.id}`).addEventListener('click', () => {
        if (state.score >= m.cost) {
            state.score -= m.cost;
            m.count++;
            updateUI();
        }
    });
});

// Achat d'Upgrades Prestige
document.getElementById('upgrade-click').addEventListener('click', () => {
    const cost = Math.floor(1 * Math.pow(2, state.clickUpgradeLevel));
    if(state.gems >= cost) {
        state.gems -= cost;
        state.clickUpgradeLevel++;
        updateUI();
    }
});

document.getElementById('upgrade-discount').addEventListener('click', () => {
    const cost = Math.floor(2 * Math.pow(2.5, state.discountUpgradeLevel));
    if(state.gems >= cost) {
        state.gems -= cost;
        state.discountUpgradeLevel++;
        updateUI();
    }
});

// Action du RELOAD (Prestige)
document.getElementById('prestige-btn').addEventListener('click', () => {
    const objective = getObjectiveNeeded();
    if (state.totalScoreThisLoop >= objective) {
        // Formule de gain de gemmes basée sur le surplus produit
        let earnedGems = 1 + Math.floor((state.totalScoreThisLoop - objective) / (objective * 0.5));
        
        state.gems += earnedGems;
        state.prestigeLevel++;
        
        // Reset de la boucle
        state.score = 0;
        state.totalScoreThisLoop = 0;
        state.miners.forEach(m => m.count = 0);
        
        updateUI();
    }
});

// --- ENGIN DE TEMPS (Tick toutes les 100ms) ---
setInterval(() => {
    let bps = calculateTotalBPS();
    if(bps > 0) {
        let chunk = bps / 10;
        state.score += chunk;
        state.totalScoreThisLoop += chunk;
        updateUI();
    }
}, 100);

// Lancement initial
updateUI();
