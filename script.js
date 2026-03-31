// --- LOG POP-UP LOGIC ---
function toggleLog(show) {
    const overlay = document.getElementById('log-overlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}

if (!sessionStorage.getItem('logSeen')) {
    toggleLog(true);
    sessionStorage.setItem('logSeen', 'true');
}

// --- CORE GAME DATA ---
const SAVE_KEY = "lincoln_ultimate_save"; 
let energy = 0, clickPower = 1, cps = 0, goldenTortas = 50;
let mysteryEggCost = 500;
let equippedHat = "none"; 
let usedCodes = []; 

// --- WARDROBE DATA ---
const hats = [
    { id: 'none', name: 'No Hat', cost: 0, owned: true, buff: 1, type: 'none', desc: 'Just regular Lincoln.' },
    { id: 'tophat', name: 'Top Hat', cost: 5, owned: false, buff: 0.90, type: 'discount', desc: 'Classy! Shop items cost 10% less.' },
    { id: 'propeller', name: 'Propeller', cost: 10, owned: false, buff: 2.0, type: 'gold', desc: 'Lucky! 2x Golden Egg spawns.' },
    { id: 'bunnyears', name: 'Bunny Ears', cost: 25, owned: false, buff: 1.5, type: 'click', desc: 'Easter Spirit! +50% Click Power.' }
];

// --- 7-DAY PROGRESS LOGIC ---
const START_DATE = new Date(2026, 3, 5); 

function getHuntProgress() {
    const now = new Date();
    if (now < START_DATE) return -1; 
    const diffTime = now - START_DATE;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    let percent = (diffDays / 7) * 100;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    return Math.floor(percent);
}

// --- REBALANCED UPGRADES ---
const initialUpgrades = [
    { id: 0, name: "Marshmallow Chick", cost: 15, power: 0.5, type: "click", desc: "Sweet and squishy. +0.5 Click" },
    { id: 1, name: "Plastic Egg", cost: 80, power: 1.2, type: "cps", desc: "What's inside? +1.2/sec" },
    { id: 2, name: "Wicker Basket", cost: 400, power: 3.5, type: "cps", desc: "Room for more candy. +3.5/sec" },
    { id: 3, name: "Jelly Bean Trail", cost: 1000, power: 2.5, type: "click", desc: "Follow the sugar. +2.5 Click" },
    { id: 4, name: "Floppy Ears", cost: 2500, power: 12.0, type: "cps", desc: "Hear the candy coming. +12/sec" },
    { id: 5, name: "Polka Dot Ribbon", cost: 7500, power: 35.0, type: "cps", desc: "Dressed for the hunt. +35/sec" },
    { id: 6, name: "Chocolate Bunny", cost: 18000, power: 85.0, type: "cps", desc: "Solid or hollow? +85/sec" },
    { id: 7, name: "Magic Carrot", cost: 50000, power: 250.0, type: "cps", desc: "Grown in sunlight. +250/sec" },
    { id: 8, name: "Egg Decorating Kit", cost: 120000, power: 65, type: "click", desc: "Master of the dye. +65 Click" },
    { id: 9, name: "Garden Parade", cost: 350000, power: 850, type: "cps", desc: "Marching for sweets. +850/sec" },
    { id: 10, name: "Chocolate Fountain", cost: 1200000, power: 2500, type: "cps", desc: "Infinite dipping. +2500/sec" },
    { id: 11, name: "The Big Bunny Hut", cost: 4500000, power: 8000, type: "cps", desc: "Bunny HQ. +8000/sec" },
    { id: 12, name: "Diamond Egg", cost: 15000000, power: 5000, type: "click", desc: "The ultimate prize. +5k Click" },
    { id: 13, name: "Candy Kingdom", cost: 40000000, power: 65000, type: "cps", desc: "Sugar overload! +65k/sec" },
    { id: 14, name: "Easter Morning Sun", cost: 85000000, power: 500000, type: "cps", desc: "The perfect hunt day. +500k/sec" }
];

let upgrades = JSON.parse(JSON.stringify(initialUpgrades));

// --- SECRET CODE LOGIC ---
function checkCode() {
    const input = document.getElementById('code-input');
    const feedback = document.getElementById('code-feedback');
    if (!input || !feedback) return;
    const code = input.value.toUpperCase().trim();
    if (code === "") return;
    if (usedCodes.includes(code)) {
        feedback.innerText = "ALREADY REDEEMED!";
        feedback.style.color = "orange";
        input.value = "";
        return;
    }
    let success = false;
    if (code === "BUNNY") { energy += 5000; feedback.innerText = "CODDLE! +5,000 Eggs!"; success = true; }
    else if (code === "LINCOLN") { goldenTortas += 2; feedback.innerText = "CHAMPION! +2 Golden Carrots!"; success = true; }
    else if (code === "HIDDEN") { clickPower *= 2; feedback.innerText = "POWER UP! Click power doubled!"; success = true; } 
    if (success) {
        usedCodes.push(code);
        feedback.style.color = "green";
        saveGame();
    } else {
        feedback.innerText = "Invalid code... keep hunting!";
        feedback.style.color = "var(--deep-purple)";
    }
    input.value = ""; 
    updateUI();
}

// --- CLICK LOGIC ---
document.getElementById('lincoln-main').addEventListener('click', (e) => {
    let hatBonus = (equippedHat === "bunnyears") ? 1.5 : 1.0;
    let val = clickPower * (1 + (goldenTortas * 0.1)) * hatBonus; 
    energy += val;
    showParticle(e.clientX, e.clientY, `🥚`);
    updateUI();
});

// --- CPS INTERVAL ---
setInterval(() => { 
    let boostedCPS = cps * (1 + (goldenTortas * 0.1)); 
    energy += (boostedCPS / 10); 
    updateUI(); 
}, 100);

// --- GOLDEN EGG LOGIC ---
function spawnGoldenEgg() {
    const egg = document.createElement('div');
    egg.className = 'golden-egg';
    egg.style.top = Math.random() * 60 + 20 + "%";
    egg.style.left = Math.random() * 80 + 10 + "%";
    egg.onclick = function() {
        let bonus = Math.max(100, energy * 0.15);
        energy += bonus;
        showParticle(window.innerWidth/2, window.innerHeight/2, `GOLDEN SURPRISE: +${Math.floor(bonus)}`);
        egg.remove();
    };
    document.body.appendChild(egg);
    setTimeout(() => { if(egg.parentNode) egg.remove(); }, 10000);
}

setInterval(() => { 
    let spawnChance = (equippedHat === "propeller") ? 0.6 : 0.3;
    if(Math.random() < spawnChance) spawnGoldenEgg(); 
}, 30000);

// --- MYSTERY EGG LOGIC ---
function crackMysteryEgg() {
    if (energy < mysteryEggCost) {
        alert("Not enough eggs to crack this one!");
        return;
    }
    energy -= mysteryEggCost;
    updateUI();
    const btn = document.getElementById('mystery-egg-btn');
    const container = document.getElementById('egg-animation-container');
    const egg = document.getElementById('shaking-egg');
    const prizeDisplay = document.getElementById('egg-prize');
    btn.style.display = 'none';
    container.style.display = 'flex';
    egg.classList.remove('shake-it', 'cracked');
    void egg.offsetWidth; 
    egg.classList.add('shake-it');
    prizeDisplay.innerText = "❓";
    setTimeout(() => {
        egg.classList.remove('shake-it');
        egg.classList.add('cracked');
        const roll = Math.random();
        let resultText = "";
        let reward = 0;
        if (roll < 0.1) { reward = mysteryEggCost * 5; prizeDisplay.innerText = "🐥"; resultText = "JACKPOT! You found a Golden Chick!"; }
        else if (roll < 0.5) { reward = mysteryEggCost * 1.5; prizeDisplay.innerText = "🍬"; resultText = "Sweet! You found some Jelly Beans!"; }
        else { prizeDisplay.innerText = "💨"; resultText = "Oh no! It was a hollow egg."; }
        setTimeout(() => {
            if (reward > 0) { energy += reward; showParticle(window.innerWidth/2, window.innerHeight/2, `+${Math.floor(reward)}`); }
            alert(resultText);
            container.style.display = 'none';
            btn.style.display = 'inline-block'; 
            mysteryEggCost = Math.ceil(mysteryEggCost * 1.2);
            btn.innerText = `CRACK MYSTERY EGG (Cost: ${mysteryEggCost})`;
            updateUI();
            saveGame();
        }, 1000);
    }, 1500);
}

// --- UI AND SHOP LOGIC ---
function updateUI() {
    const scoreElement = document.getElementById('score-text');
    if(scoreElement) scoreElement.innerText = Math.floor(energy).toLocaleString();
    let hatClickMult = (equippedHat === "bunnyears") ? 1.5 : 1.0;
    const clickStat = document.getElementById('stat-click');
    if(clickStat) clickStat.innerText = (clickPower * (1 + (goldenTortas * 0.1)) * hatClickMult).toFixed(1);
    const cpsStat = document.getElementById('stat-cps');
    if(cpsStat) cpsStat.innerText = (cps * (1 + (goldenTortas * 0.1))).toFixed(1);
    const prestigeStat = document.getElementById('stat-prestige');
    if(prestigeStat) prestigeStat.innerText = goldenTortas;
    
    // Prestige button unlocks at 100 Million
    const pBtn = document.getElementById('prestige-btn');
    if(pBtn) pBtn.style.display = energy >= 100000000 ? 'block' : 'none';
    
    const huntPercent = getHuntProgress();
    const fill = document.getElementById('global-bar-fill');
    const text = document.getElementById('global-text');
    if (fill && text) {
        if (huntPercent === -1) { fill.style.width = "0%"; text.innerText = `GLOBAL HUNT STARTS ON APRIL 5TH`; }
        else { fill.style.width = huntPercent + "%"; text.innerText = `GLOBAL HUNT PROGRESS: ${huntPercent}% TO SPRING REVELRY`; }
    }

    upgrades.forEach(u => {
        const btn = document.getElementById(`up-${u.id}`);
        if (btn) {
            let discountMult = (equippedHat === "tophat") ? 0.90 : 1.0;
            let currentCost = Math.ceil(u.cost * discountMult);
            btn.disabled = energy < currentCost;
            energy >= currentCost ? btn.classList.add('can-afford') : btn.classList.remove('can-afford');
            const costLabel = document.getElementById(`cost-${u.id}`);
            const countLabel = document.getElementById(`count-${u.id}`);
            if(costLabel) costLabel.innerText = currentCost.toLocaleString() + " Eggs";
            if(countLabel) countLabel.innerText = u.count || 0;
        }
    });

    const body = document.body; 
    const label = document.getElementById('env-label');
    if (label) {
        if (energy < 100000) { body.className = 'bg-kitchen'; label.innerText = "LOCATION: THE GARDEN GATE"; }
        else if (energy < 10000000) { body.className = 'bg-buffet'; label.innerText = "LOCATION: BLOOMING FLOWERBEDS"; }
        else if (energy < 50000000) { body.className = 'bg-factory'; label.innerText = "LOCATION: CANDY WORKSHOP"; }
        else { body.className = 'bg-space'; label.innerText = "LOCATION: THE GREAT EGG NEBULA"; }
    }
    refreshWardrobeUI();
}

function initShop() {
    const shop = document.getElementById('shop'); 
    if(!shop) return;
    shop.innerHTML = '';
    upgrades.forEach(u => {
        const btn = document.createElement('button');
        btn.className = 'upgrade'; btn.id = `up-${u.id}`;
        btn.onclick = () => buyUpgrade(u.id);
        btn.innerHTML = `<div class="u-info"><span class="u-name">${u.name}</span><span class="u-desc">${u.desc}</span><span class="u-cost" id="cost-${u.id}">${u.cost.toLocaleString()} Eggs</span></div><div class="u-count" id="count-${u.id}">${u.count || 0}</div>`;
        shop.appendChild(btn);
    });
}

function initWardrobe() {
    const list = document.getElementById('wardrobe-list');
    if (!list) return;
    list.innerHTML = '';
    hats.forEach(h => {
        const btn = document.createElement('button');
        btn.id = `hat-btn-${h.id}`;
        btn.style.cssText = "min-width: 100px; padding: 12px; border-radius: 12px; border: 2px solid var(--lavender); cursor: pointer; font-size: 0.75rem; font-weight: bold; transition: 0.2s; display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center;";
        btn.onclick = () => handleHatAction(h);
        list.appendChild(btn);
    });
    refreshWardrobeUI();
}

function refreshWardrobeUI() {
    hats.forEach(h => {
        const btn = document.getElementById(`hat-btn-${h.id}`);
        if (!btn) return;
        let statusText = "";
        if (equippedHat === h.id) { btn.style.borderColor = "var(--grass)"; btn.style.background = "var(--sunshine)"; statusText = `[EQUIPPED]`; }
        else if (h.owned) { btn.style.background = "white"; statusText = `EQUIP`; btn.style.opacity = "1"; }
        else { btn.style.background = "#f0f0f0"; statusText = h.cost > 0 ? `BUY (${h.cost}🥕)` : "FREE"; btn.style.opacity = (goldenTortas >= h.cost) ? "1" : "0.5"; }
        btn.innerHTML = `<span style="font-size: 0.85rem; color: var(--deep-purple);">${h.name}</span><span style="font-size: 0.65rem; color: #666;">${h.desc}</span><span style="margin-top: 4px;">${statusText}</span>`;
    });
}

function handleHatAction(hat) {
    if (hat.owned) { equippedHat = hat.id; } 
    else {
        if (goldenTortas >= hat.cost) {
            if (confirm(`Spend ${hat.cost} Golden Carrots to permanently unlock the ${hat.name}?`)) {
                goldenTortas -= hat.cost; hat.owned = true; equippedHat = hat.id;
            }
        } else { alert(`You need ${hat.cost} Golden Carrots!`); return; }
    }
    applyHatVisuals(); updateUI(); saveGame();
}

function applyHatVisuals() {
    const container = document.querySelector('.img-container');
    if (!container) return;
    hats.forEach(h => container.classList.remove(`hat-${h.id}`));
    if (equippedHat !== "none") container.classList.add(`hat-${equippedHat}`);
}

function buyUpgrade(id) {
    const u = upgrades.find(up => up.id === id);
    let discountMult = (equippedHat === "tophat") ? 0.90 : 1.0;
    let currentCost = Math.ceil(u.cost * discountMult);
    if (energy >= currentCost) {
        energy -= currentCost;
        u.count = (u.count || 0) + 1;
        if (u.type === "click") clickPower += u.power; else cps += u.power;
        u.cost = Math.ceil(u.cost * 1.15);
        updateUI();
        saveGame();
    }
}

function prestige() {
    if (energy < 100000000) return;
    const bonus = Math.floor(Math.pow(energy / 100000000, 0.5)) + 1;
    if (confirm(`Find ${bonus} Golden Carrots?`)) {
        goldenTortas += bonus; 
        energy = 0; 
        clickPower = 1; 
        cps = 0;
        
        // --- THE FIX: Reset mystery egg cost ---
        mysteryEggCost = 500; 
        const mysteryBtn = document.getElementById('mystery-egg-btn');
        if (mysteryBtn) {
            mysteryBtn.innerText = `CRACK MYSTERY EGG (Cost: 500)`;
        }

        upgrades = JSON.parse(JSON.stringify(initialUpgrades));
        initShop(); 
        saveGame(); 
        updateUI();
    }
}

function showParticle(x, y, text) {
    const p = document.createElement('div'); p.className = 'particle'; p.innerText = text;
    p.style.left = x + 'px'; p.style.top = y + 'px';
    document.body.appendChild(p); setTimeout(() => p.remove(), 800);
}

function saveGame() {
    const ownedHats = hats.filter(h => h.owned).map(h => h.id);
    const gameData = { energy, clickPower, cps, goldenTortas, upgrades, mysteryEggCost, equippedHat, ownedHats, usedCodes, lastSaveTime: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameData));
}

function loadGame() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        const d = JSON.parse(saved);
        energy = d.energy || 0; 
        clickPower = d.clickPower || 1; 
        cps = d.cps || 0;
        goldenTortas = d.goldenTortas || 0; 
        mysteryEggCost = d.mysteryEggCost || 500; 
        equippedHat = d.equippedHat || "none"; 
        usedCodes = d.usedCodes || [];

        const mysteryBtn = document.getElementById('mystery-egg-btn');
        if (mysteryBtn) {
            mysteryBtn.innerText = `CRACK MYSTERY EGG (Cost: ${mysteryEggCost})`;
        }

        if (d.lastSaveTime && cps > 0) {
            const now = Date.now();
            const diffSeconds = (now - d.lastSaveTime) / 1000;
            const boostedCPS = cps * (1 + (goldenTortas * 0.1));
            const offlineGains = Math.floor(boostedCPS * 0.5 * diffSeconds); 
            if (offlineGains > 0) {
                energy += offlineGains;
                setTimeout(() => {
                    alert(`Welcome back! Lincoln found ${offlineGains.toLocaleString()} eggs while you were away!`);
                }, 500);
            }
        }

        if (d.ownedHats) d.ownedHats.forEach(id => { 
            const hat = hats.find(h => h.id === id); 
            if (hat) hat.owned = true; 
        });
        
        if (d.upgrades) d.upgrades.forEach(savedU => { 
            const currentU = upgrades.find(u => u.id === savedU.id); 
            if (currentU) { 
                currentU.count = savedU.count; 
                currentU.cost = savedU.cost; 
            } 
        });
    }
    initShop(); 
    initWardrobe(); 
    applyHatVisuals(); 
    updateUI();
}

function resetGame() { 
    if (confirm("Wipe all progress?")) { 
        localStorage.removeItem(SAVE_KEY); 
        // Force the internal cost back to default before refresh
        mysteryEggCost = 500; 
        location.reload(); 
    } 
}

loadGame();
setInterval(saveGame, 10000);
