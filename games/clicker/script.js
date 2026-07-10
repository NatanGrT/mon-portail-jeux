// --- CONFIGURATION ET ÉTAT DU JEU ---
let state = {
    score: 0,
    baseObjective: 1000,
    difficultyMultiplier: 1.5,
    
    // Prestige Upgrades
    prestigeLevel: 0,
    gems: 0,
    clickUpgradeLevel: 0,
    discountUpgradeLevel: 0,
    hasEventsUnlocked: false,  // Débloque Anomalies et Comètes
    hasRiftsUnlocked: false,   // Débloque les Failles à Gemmes

    miners: [
        { id: 1, baseCost: 15, bps: 1, count: 0, cost: 15 },
        { id: 2, baseCost: 100, bps: 8, count: 0, cost: 100 },
        { id: 3, baseCost: 1100, bps: 50, count: 0, cost: 1100 },
        { id: 4, baseCost: 12000, bps: 400, count: 0, cost: 12000 }
    ]
};

let eventActiveMultiplier = 1;

// --- FONCTIONS DE CALCUL ---
function getObjectiveNeeded() {
    return Math.floor(state.baseObjective * Math.pow(state.difficultyMultiplier, state.prestigeLevel));
}
function getClickPower() {
    return (1 + state.clickUpgradeLevel) * (1 + state.prestigeLevel * 0.15);
}
function getGlobalMultiplier() {
    return (1 + state.prestigeLevel * 0.15);
}
function getDiscount() {
    return Math.pow(0.90, state.discountUpgradeLevel);
}
function calculateTotalBPS() {
    let totalBase = state.miners.reduce((sum, m) => sum + (m.count * m.bps), 0);
    return totalBase * getGlobalMultiplier() * eventActiveMultiplier;
}

// --- GESTION DES 3 TYPES D'ÉVÉNEMENTS (ANTI-AFK COOPÉRATEUR) ---
function spawnRandomEvent() {
    // Si aucun événement n'est acheté, on arrête tout de suite
    if (!state.hasEventsUnlocked) return;

    // Choix du type d'événement disponible
    let pool = ['anomaly', 'comet'];
    if (state.hasRiftsUnlocked) {
        pool.push('rift'); // Ajoute la faille de gemme si achetée
    }

    let chosenType = pool[Math.floor(Math.random() * pool.length)];

    const container = document.getElementById('event-container');
    const eventEl = document.createElement('div');
    eventEl.className = `random-anomaly event-${chosenType}`;
    
    // Position sur l'écran
    const x = Math.random() * (window.innerWidth - 180);
    const y = Math.random() * (window.innerHeight - 100);
    eventEl.style.left = `${x}px`;
    eventEl.style.top = `${y}px`;

    // Personnalisation visuelle et textuelle selon le type
    if (chosenType === 'anomaly') eventEl.innerText = "⚡ ANOMALIE (x3)";
    if (chosenType === 'comet') eventEl.innerText = "☄️ COMÈTE (+$$$)";
    if (chosenType === 'rift') eventEl.innerText = "🔮 FAILLE TEMPORELLE";

    // Disparition automatique au bout de 5 secondes si pas cliqué
    let timeout = setTimeout(() => { eventEl.remove(); }, 5000);

    eventEl.addEventListener('click', (e) => {
        clearTimeout(timeout);
        eventEl.remove();
        executeEventEffect(chosenType, e.clientX, e.clientY);
    });

    container.appendChild(eventEl);
}

function executeEventEffect(type, clickX, clickY) {
    const alertBox = document.getElementById('active-event-alert');

    if (type === 'anomaly') {
        // Boost temporel x3 pendant 12 secondes
        eventActiveMultiplier = 3;
        alertBox.innerText = "⚡ REVENUE BOOSTÉ (x3) PAR L'ANOMALIE !";
        alertBox.className = "event-alert-anomaly"; // change la couleur de l'alerte
        
        setTimeout(() => {
            eventActiveMultiplier = 1;
            alertBox.className = "hidden";
            updateUI();
        }, 12000);
    } 
    else if (type === 'comet') {
        // Gain immédiat massif basé sur le BPS actuel (équivalent à 60s de production, min 200 points)
        let currentBps = calculateTotalBPS();
        let reward = Math.max(200, currentBps * 60);
        state.score += reward;
        createFloatingText(clickX, clickY, `+${Math.floor(reward).toLocaleString()} ☄️`, '#f59e0b');
    } 
    else if (type === 'rift') {
        // Récompense : +1 Gemme instantanée directement !
        state.gems += 1;
        createFloatingText(clickX, clickY, `+1 💎`, '#a855f7');
    }
    updateUI();
}

// Lancement de la roulette d'événement toutes les 20 secondes
setInterval(() => {
    if (Math.random() < 0.5) spawnRandomEvent(); // 50% de chance d'apparaître
}, 20000);


// --- MISE À JOUR DE L'INTERFACE (UI) ---
function updateUI() {
    const objective = getObjectiveNeeded();
    
    document.getElementById('score-display').innerText = Math.floor(state.score).toLocaleString();
    document.getElementById('bps-display').innerText = calculateTotalBPS().toFixed(1);
    document.getElementById('global-mult').innerText = Math.floor(getGlobalMultiplier() * 100);
    document.getElementById('prestige-level').innerText = state.prestigeLevel;
    document.getElementById('prestige-gems').innerText = state.gems;
    document.getElementById('req-score').innerText = objective.toLocaleString();

    // Auto-Mineurs
    state.miners.forEach(m => {
        m.cost = Math.floor(m.baseCost * Math.pow(1.15, m.count) * getDiscount());
        document.getElementById(`cost-${m.id}`).innerText = m.cost.toLocaleString();
        document.getElementById(`count-${m.id}`).innerText = m.count;
        document.getElementById(`buy-${m.id}`).disabled = state.score < m.cost;
    });

    // Bouton Prestige principal (Dépense de points)
    const prestigeBtn = document.getElementById('prestige-btn');
    if (state.score >= objective) {
        prestigeBtn.disabled = false;
        prestigeBtn.classList.add('ready');
    } else {
        prestigeBtn.disabled = true;
        prestigeBtn.classList.remove('ready');
    }

    // Gestion des coûts fixes de la boutique Prestige
    const clickUpgradeCost = Math.floor(1 * Math.pow(2, state.clickUpgradeLevel));
    const discountUpgradeCost = Math.floor(2 * Math.pow(2.5, state.discountUpgradeLevel));
    
    // Bouton Clic
    const clickBtn = document.getElementById('upgrade-click');
    clickBtn.innerText = `Surcharge Clic (Prix: ${clickUpgradeCost} 💎)`;
    clickBtn.disabled = state.gems < clickUpgradeCost;

    // Bouton Réduction Coûts
    const discBtn = document.getElementById('upgrade-discount');
    discBtn.innerText = `Optimisation (Prix: ${discountUpgradeCost} 💎)`;
    discBtn.disabled = state.gems < discountUpgradeCost;

    // Bouton Débloquer Événements (Achat unique de 2 gemmes)
    const eventBtn = document.getElementById('upgrade-events');
    if(state.hasEventsUnlocked) {
        eventBtn.innerText = "Détecteur Activé ✔";
        eventBtn.disabled = true;
    } else {
        eventBtn.innerText = "Détecteur d'Anomalies (Prix: 2 💎)";
        eventBtn.disabled = state.gems < 2;
    }

    // Bouton Débloquer Faille de Gemmes (Achat unique de 5 gemmes - nécessite Détecteur)
    const riftBtn = document.getElementById('upgrade-rift');
    if(state.hasRiftsUnlocked) {
        riftBtn.innerText = "Radar de Failles Activé ✔";
        riftBtn.disabled = true;
    } else if (!state.hasEventsUnlocked) {
        riftBtn.innerText = "Radar bloqué (Requis: Détecteur)";
        riftBtn.disabled = true;
    } else {
        riftBtn.innerText = "Radar de Failles (Prix: 4 💎)";
        riftBtn.disabled = state.gems < 4;
    }
}

// --- INTERACTIONS EN JEU ---

document.getElementById('click-me').addEventListener('click', (e) => {
    let earned = getClickPower() * eventActiveMultiplier;
    state.score += earned;
    createFloatingText(e.clientX, e.clientY, `+${Math.floor(earned)}`, '#fff');
    updateUI();
});

function createFloatingText(x, y, text, color) {
    const txt = document.createElement('div');
    txt.className = 'floating-text';
    txt.style.left = `${x}px`;
    txt.style.top = `${y}px`;
    txt.style.color = color;
    txt.innerText = text;
    document.body.appendChild(txt);
    setTimeout(() => txt.remove(), 800);
}

// Achats Bâtiments
state.miners.forEach(m => {
    document.getElementById(`buy-${m.id}`).addEventListener('click', () => {
        if (state.score >= m.cost) {
            state.score -= m.cost;
            m.count++;
            updateUI();
        }
    });
});

// Achats Prestige
document.getElementById('upgrade-click').addEventListener('click', () => {
    const cost = Math.floor(1 * Math.pow(2, state.clickUpgradeLevel));
    if(state.gems >= cost) { state.gems -= cost; state.clickUpgradeLevel++; updateUI(); }
});

document.getElementById('upgrade-discount').addEventListener('click', () => {
    const cost = Math.floor(2 * Math.pow(2.5, state.discountUpgradeLevel));
    if(state.gems >= cost) { state.gems -= cost; state.discountUpgradeLevel++; updateUI(); }
});

document.getElementById('upgrade-events').addEventListener('click', () => {
    if(state.gems >= 2 && !state.hasEventsUnlocked) { state.gems -= 2; state.hasEventsUnlocked = true; updateUI(); }
});

document.getElementById('upgrade-rift').addEventListener('click', () => {
    if(state.gems >= 4 && state.hasEventsUnlocked && !state.hasRiftsUnlocked) { state.gems -= 4; state.hasRiftsUnlocked = true; updateUI(); }
});

// Action Reload
document.getElementById('prestige-btn').addEventListener('click', () => {
    const costOfPrestige = getObjectiveNeeded();
    if (state.score >= costOfPrestige) {
        if (confirm(`Dépenser ${costOfPrestige.toLocaleString()} points pour renaître et gagner 1 Gemme ?`)) {
            state.score -= costOfPrestige;
            state.gems += 1;
            state.prestigeLevel++;
            state.miners.forEach(m => m.count = 0);
            updateUI();
        }
    }
});

// Tick Engine
setInterval(() => {
    let bps = calculateTotalBPS();
    if(bps > 0) { state.score += (bps / 10); updateUI(); }
}, 100);

updateUI();
