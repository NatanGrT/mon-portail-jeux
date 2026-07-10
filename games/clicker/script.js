// --- ÉTAT DU JEU ---
let score = 0;
let totalScoreEarned = 0; // Sert à savoir si on a atteint l'objectif pour le Reload

// Améliorations
let farmers = 0;
let farmerCost = 15;
let tractors = 0;
let tractorCost = 100;

// Système de Reload (Prestige)
let renaissances = 0;
let prestigeMultiplier = 1; // 1 = 100% des gains de base

// --- ÉLÉMENTS DU DOM ---
const scoreDisplay = document.getElementById('score');
const bpsDisplay = document.getElementById('bps');
const prestigeDisplay = document.getElementById('prestige-bonus');
const button = document.getElementById('click-me');

const buyFarmerBtn = document.getElementById('buy-farmer');
const farmerCostDisplay = document.getElementById('farmer-cost');
const farmerCountDisplay = document.getElementById('farmer-count');

const buyTractorBtn = document.getElementById('buy-tractor');
const tractorCostDisplay = document.getElementById('tractor-cost');
const tractorCountDisplay = document.getElementById('tractor-count');

const prestigeBtn = document.getElementById('prestige-btn');

// --- FONCTIONS DE MISE À JOUR ---

function calculateBPS() {
    // Les fermiers donnent 1/s, les tracteurs donnent 8/s, le tout boosté par le prestige
    let baseProduction = (farmers * 1) + (tractors * 8);
    return baseProduction * prestigeMultiplier;
}

function updateUI() {
    // Affichage des scores (Math.floor évite les nombres à virgule bizarres)
    scoreDisplay.innerText = Math.floor(score);
    bpsDisplay.innerText = calculateBPS().toFixed(1);
    prestigeDisplay.innerText = Math.floor((prestigeMultiplier - 1) * 100);

    // Boutique Fermier
    farmerCostDisplay.innerText = Math.floor(farmerCost);
    farmerCountDisplay.innerText = farmers;
    buyFarmerBtn.disabled = score < farmerCost;

    // Boutique Tracteur
    tractorCostDisplay.innerText = Math.floor(tractorCost);
    tractorCountDisplay.innerText = tractors;
    buyTractorBtn.disabled = score < tractorCost;

    // Bouton de Reload (débloqué à partir de 1000 clics au total)
    if (totalScoreEarned >= 1000) {
        prestigeBtn.disabled = false;
    } else {
        prestigeBtn.disabled = true;
    }
}

// --- ÉVÉNEMENTS (CLICS) ---

// Clic sur le gros bouton
button.addEventListener('click', () => {
    let gained = 1 * prestigeMultiplier;
    score += gained;
    totalScoreEarned += gained;
    updateUI();
    
    // Petit clin d'œil à ton code d'origine !
    if(Math.floor(score) === 10) {
        alert("Pas mal ! Continue !");
    }
});

// Achat Fermier
buyFarmerBtn.addEventListener('click', () => {
    if (score >= farmerCost) {
        score -= farmerCost;
        farmers++;
        farmerCost *= 1.15; // Augmente le prix de 15%
        updateUI();
    }
});

// Achat Tracteur
buyTractorBtn.addEventListener('click', () => {
    if (score >= tractorCost) {
        score -= tractorCost;
        tractors++;
        tractorCost *= 1.15; // Augmente le prix de 15%
        updateUI();
    }
});

// Système de RELOAD
prestigeBtn.addEventListener('click', () => {
    if (totalScoreEarned >= 1000) {
        if (confirm("Voulez-vous sacrifier votre ferme actuelle pour faire un Reload et obtenir +10% de bonus permanent ?")) {
            renaissances++;
            prestigeMultiplier = 1 + (renaissances * 0.10); // +10% par reload

            // Remise à zéro de la boucle actuelle
            score = 0;
            totalScoreEarned = 0;
            farmers = 0;
            farmerCost = 15;
            tractors = 0;
            tractorCost = 100;

            updateUI();
        }
    }
});

// --- BOUCLE DE JEU (S'exécute toutes les 100ms) ---
setInterval(() => {
    let bps = calculateBPS();
    if (bps > 0) {
        let gained = bps / 10; // On divise par 10 car la boucle tourne 10 fois par seconde
        score += gained;
        totalScoreEarned += gained;
        updateUI();
    }
}, 100);

// Lancement initial
updateUI();
