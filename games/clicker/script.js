// --- CONFIGURATION ET ÉTAT INITIAL DU JEU ---
const DEFAULT_STATE = {
    score: 0,
    baseObjective: 1000,
    difficultyMultiplier: 1.5,
    
    // Niveaux de la boutique de prestige
    prestigeLevel: 0,
    gems: 0,
    clickUpgradeLevel: 0,
    discountUpgradeLevel: 0,
    hasEventsUnlocked: false,
    hasRiftsUnlocked: false,

    miners: [
        { id: 1, baseCost: 15, bps: 1, count: 0, cost: 15 },
        { id: 2, baseCost: 100, bps: 8, count: 0, cost: 100 },
        { id: 3, baseCost: 1100, bps: 50, count: 0, cost: 1100 },
        { id: 4, baseCost: 12000, bps: 400, count: 0, cost: 12000 }
    ]
};

// Chargement initial
let state = loadGame();
let eventActiveMultiplier = 1;

// --- MACHINE À SAUVEGARDE (LOCALSTORAGE) ---
function saveGame() {
    localStorage.setItem('clicker_pro_save', JSON.stringify(state));
}

function loadGame() {
    const saved = localStorage.getItem('clicker_pro_save');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Sécurité anti-crash si des clés manquent
            return { ...DEFAULT_STATE, ...parsed, miners: parsed.miners || DEFAULT_STATE.miners };
        } catch (e) {
            console.error("Erreur de lecture de la sauvegarde", e);
            return JSON.parse(JSON.stringify(DEFAULT_STATE));
        }
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

// Sauvegarde automatique en arrière-plan (Toutes les 10 secondes)
setInterval(saveGame, 10000);


// --- FORMULES MATHÉMATIQUES DU JEU ---
function getObjectiveNeeded() {
    return Math.floor(state.baseObjective * Math.pow(state.difficultyMultiplier, state.prestigeLevel));
}
function getClickPower() {
    return (1 + state.clickUpgradeLevel) * (1 + state.prestigeLevel * 0.15);
}
function getGlobalMultiplier() {
    return (1 + state.prestigeLevel * 0.15); // +15% passif par niveau de prestige
}
function getDiscount() {
    return Math.pow(0.90, state.discountUpgradeLevel); // -10% cumulable
}
function calculateTotalBPS() {
    let totalBase = state.miners.reduce((sum, m) => sum + (m.count * m.bps), 0);
    return totalBase * getGlobalMultiplier() * eventActiveMultiplier;
}


// --- GESTION DES 3 ÉVÉNEMENTS ANTI-AFK ---
function spawnRandomEvent() {
    if (!state.hasEventsUnlocked) return;

    let pool = ['anomaly', 'comet'];
    if (state.hasRiftsUnlocked) pool.push('rift');

    let chosenType = pool[Math.floor(Math.random() * pool.length)];
    const container = document.getElementById('event-container');
    if (!container) return;
    
    const eventEl = document.createElement('div');
    eventEl.className = `random-anomaly event-${chosenType}`;
    
    // Position aléatoire sur les zones cliquables
    const x = Math.random() * (window.innerWidth - 180);
    const y = Math.random() * (window.innerHeight - 100);
    eventEl.style.left = `${x}px`;
    eventEl.style.top = `${y}px`;

    if (chosenType === 'anomaly') eventEl.innerText = "⚡ ANOMALIE (x3)";
    if (chosenType === 'comet') eventEl.innerText = "☄️ COMÈTE (+$$$)";
    if (chosenType === 'rift') eventEl.innerText = "🔮 FAILLE TEMPORELLE";

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
        eventActiveMultiplier = 3;
        alertBox.innerText = "⚡ EXPANSION ACTIVE : PRODUCTION GLOBAL x3 !";
        alertBox.className = "event-alert-anomaly";
        
        setTimeout(() => {
            eventActiveMultiplier = 1;
            alertBox.className = "hidden";
            updateUI();
        }, 12000);
    } 
    else if (type === 'comet') {
        let currentBps = calculateTotalBPS();
        let reward = Math.max(200, currentBps * 60); // Donne 60s de production d'un coup
        state.score += reward;
        createFloatingText(clickX, clickY, `+${Math.floor(reward).toLocaleString()} ☄️`, '#f59e0b');
    } 
    else if (type === 'rift') {
        state.gems += 1;
        createFloatingText(clickX, clickY, `+1 💎`, '#a855f7');
        saveGame();
    }
    updateUI();
}

// Lancement de la boucle des popups (Toutes les 20 secondes)
setInterval(() => {
    if (Math.random() < 0.5) spawnRandomEvent();
}, 20000);


// --- SYNCHRONISATION INTERFACE (UI) ---
function updateUI() {
    const objective = getObjectiveNeeded();
    
    document.getElementById('score-display').innerText = Math.floor(state.score).toLocaleString();
    document.getElementById('bps-display').innerText = calculateTotalBPS().toFixed(1);
    document.getElementById('global-mult').innerText = Math.floor(getGlobalMultiplier() * 100);
    document.getElementById('prestige-level').innerText = state.prestigeLevel;
    document.getElementById('prestige-gems').innerText = state.gems;
    document.getElementById('req-score').innerText = objective.toLocaleString();

    // Actualisation des Auto-Mineurs
    state.miners.forEach(m => {
        m.cost = Math.floor(m.baseCost * Math.pow(1.15, m.count) * getDiscount());
        document.getElementById(`cost-${m.id}`).innerText = m.cost.toLocaleString();
        document.getElementById(`count-${m.id}`).innerText = m.count;
        document.getElementById(`buy-${m.id}`).disabled = state.score < m.cost;
    });

    // Gestion de l'allumage du bouton Reload
    const prestigeBtn = document.getElementById('prestige-btn');
    if (state.score >= objective) {
        prestigeBtn.disabled = false;
        prestigeBtn.classList.add('ready');
    } else {
        prestigeBtn.disabled = true;
        prestigeBtn.classList.remove('ready');
    }

    // Actualisation dynamique de la boutique de Prestige
    const clickUpgradeCost = Math.floor(1 * Math.pow(2, state.clickUpgradeLevel));
    const discountUpgradeCost = Math.floor(2 * Math.pow(2.5, state.discountUpgradeLevel));
    
    const clickBtn = document.getElementById('upgrade-click');
    clickBtn.innerText = `Surcharge Clic (Prix: ${clickUpgradeCost} 💎)`;
    clickBtn.disabled = state.gems < clickUpgradeCost;

    const discBtn = document.getElementById('upgrade-discount');
    discBtn.innerText = `Optimisation (Prix: ${discountUpgradeCost} 💎)`;
    discBtn.disabled = state.gems < discountUpgradeCost;

    const eventBtn = document.getElementById('upgrade-events');
    if(state.hasEventsUnlocked) {
        eventBtn.innerText = "Détecteur Activé ✔";
        eventBtn.disabled = true;
    } else {
        eventBtn.innerText = "Détecteur d'Anomalies (Prix: 2 💎)";
        eventBtn.disabled = state.gems < 2;
    }

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


// --- GESTION DES SECTIONS INTERACTIVES ---

// Clic Central
document.getElementById('click-me').addEventListener('click', (e) => {
    let earned = getClickPower() * eventActiveMultiplier;
    state.score += earned;
    createFloatingText(e.clientX, e.clientY, `+${Math.floor(earned)}`, '#fff');
    updateUI();
});

// Chiffres Volants
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

// Achat d'unités
state.miners.forEach(m => {
    document.getElementById(`buy-${m.id}`).addEventListener('click', () => {
        if (state.score >= m.cost) {
            state.score -= m.cost;
            m.count++;
            updateUI();
            saveGame();
        }
    });
});

// Interactions Boutique de Prestige
document.getElementById('upgrade-click').addEventListener('click', () => {
    const cost = Math.floor(1 * Math.pow(2, state.clickUpgradeLevel));
    if(state.gems >= cost) { state.gems -= cost; state.clickUpgradeLevel++; updateUI(); saveGame(); }
});

document.getElementById('upgrade-discount').addEventListener('click', () => {
    const cost = Math.floor(2 * Math.pow(2.5, state.discountUpgradeLevel));
    if(state.gems >= cost) { state.gems -= cost; state.discountUpgradeLevel++; updateUI(); saveGame(); }
});

document.getElementById('upgrade-events').addEventListener('click', () => {
    if(state.gems >= 2 && !state.hasEventsUnlocked) { state.gems -= 2; state.hasEventsUnlocked = true; updateUI(); saveGame(); }
});

document.getElementById('upgrade-rift').addEventListener('click', () => {
    if(state.gems >= 4 && state.hasEventsUnlocked && !state.hasRiftsUnlocked) { state.gems -= 4; state.hasRiftsUnlocked = true; updateUI(); saveGame(); }
});

// --- SYSTEM DE RELOAD AVEC PALIER BONUS TOUS LES 5 PRESTIGES ---
document.getElementById('prestige-btn').addEventListener('click', () => {
    const costOfPrestige = getObjectiveNeeded();
    if (state.score >= costOfPrestige) {
        const nextPrestigeLevel = state.prestigeLevel + 1;
        const isBonusLevel = (nextPrestigeLevel % 5 === 0);
        const gemsToEarn = isBonusLevel ? 2 : 1;

        let message = `Activer le Reload ? Votre score et vos unités reviendront à 0 en échange de ${gemsToEarn} Gemme(s).`;
        if (isBonusLevel) {
            message = `🎉 PALIER DE PRESTIGE MALIN ! Niveau ${nextPrestigeLevel} détecté. Confirmer le Reload pour encaisser DEUX GEMMES au lieu d'une ?`;
        }

        if (confirm(message)) {
            // Remise à zéro totale du score courant
            state.score = 0;
            
            // Crédit des gemmes
            state.gems += gemsToEarn;
            state.prestigeLevel++;
            
            // Perte des bâtiments
            state.miners.forEach(m => m.count = 0);
            
            saveGame();
            updateUI();
        }
    }
});


// --- ENGIN TEMPOREL DE PRODUCTION INTERNE (10 ticks / sec) ---
setInterval(() => {
    let bps = calculateTotalBPS();
    if(bps > 0) { 
        state.score += (bps / 10); 
        updateUI(); 
    }
}, 100);

// Premier démarrage
updateUI();
