// --- LOG POP-UP LOGIC ---
function toggleLog(show) {
    document.getElementById('log-overlay').style.display = show ? 'flex' : 'none';
}

if (!sessionStorage.getItem('logSeen')) {
    toggleLog(true);
    sessionStorage.setItem('logSeen', 'true');
}

// --- CORE GAME DATA ---
const SAVE_KEY = "lincoln_ultimate_save"; 
let energy = 10000000000, clickPower = 1, cps = 0, goldenTortas = 0;
let mysteryEggCost = 500;

// --- 7-DAY PROGRESS LOGIC ---
const START_DATE = new Date(2026, 3, 5); // April 5th, 2026

function getHuntProgress() {
    const now = new Date();
    
    if (now < START_DATE) {
        return -1; 
    }

    const diffTime = now - START_DATE;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    let percent = (diffDays / 7) * 100;
    
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    
    return Math.floor(percent);
}

const initialUpgrades = [
    { id: 0, name: "Marshmallow Chick", cost: 15, power: 0.1, type: "click", desc: "Sweet and squishy. +0.1 Click" },
    { id: 1, name: "Plastic Egg", cost: 100, power: 0.3, type: "cps", desc: "What's inside? +0.3/sec" },
    { id: 2, name: "Wicker Basket", cost: 500, power: 0.8, type: "cps", desc: "Room for more candy. +0.8/sec" },
    { id: 3, name: "Jelly Bean Trail", cost: 1200, power: 0.6, type: "click", desc: "Follow the sugar. +0.6 Click" },
    { id: 4, name: "Floppy Ears", cost: 3000, power: 2.5, type: "cps", desc: "Hear the candy coming. +2.5/sec" },
    { id: 5, name: "Polka Dot Ribbon", cost: 10000, power: 7.0, type: "cps", desc: "Dressed for the hunt. +7.0/sec" },
    { id: 6, name: "Chocolate Bunny", cost: 25000, power: 15.0, type: "cps", desc: "Solid or hollow? +15/sec" },
    { id: 7, name: "Magic Carrot", cost: 85000, power: 50.0, type: "cps", desc: "Grown in sunlight. +50/sec" },
    { id: 8, name: "Egg Decorating Kit", cost: 200000, power: 12, type: "click", desc: "Master of the dye. +12 Click" },
    { id: 9, name: "Garden Parade", cost: 500000, power: 150, type: "cps", desc: "Marching for sweets. +150/sec" },
    { id: 10, name: "Chocolate Fountain", cost: 2000000, power: 500, type: "cps", desc: "Infinite dipping. +500/sec" },
    { id: 11, name: "The Big Bunny Hut", cost: 8000000, power: 1500, type: "cps", desc: "Bunny HQ. +1500/sec" },
    { id: 12, name: "Diamond Egg", cost: 40000000, power: 1200, type: "click", desc: "The ultimate prize. +1200 Click" },
    { id: 13, name: "Candy Kingdom", cost: 150000000, power: 18000, type: "cps", desc: "Sugar overload! +18k/sec" },
    { id: 14, name: "Easter Morning Sun", cost: 2500000000, power: 120000, type: "cps", desc: "The perfect hunt day. +120k/sec" }
];

let upgrades = JSON.parse(JSON.stringify(initialUpgrades));

document.getElementById('lincoln-main').addEventListener('click', (e) => {
    let val = clickPower * (1 + (goldenTortas * 0.1));
    energy += val;
    showParticle(e.clientX, e.clientY, `🥚`);
    updateUI();
});

setInterval(() => { 
    let boostedCPS = cps * (1 + (goldenTortas * 0.1));
    energy += (boostedCPS / 10); 
    updateUI(); 
}, 100);

function spawnGoldenEgg() {
    const egg = document.createElement('div');
    egg.className = 'golden-egg';
    egg.style.top = Math.random() * 60 + 20 + "%";
    egg.onclick = function() {
        let bonus = Math.max(100, energy * 0.15);
        energy += bonus;
        showParticle(window.innerWidth/2, window.innerHeight/2, `GOLDEN SURPRISE: +${Math.floor(bonus)}`);
        egg.remove();
    };
    document.body.appendChild(egg);
    setTimeout(() => { if(egg.parentNode) egg.remove(); }, 10000);
}
setInterval(() => { if(Math.random() < 0.3) spawnGoldenEgg(); }, 30000);

// --- UPDATED MYSTERY EGG WITH ANIMATION SAFETY FIXES ---
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
    
    // Hide button fully and show egg container
    btn.style.display = 'none';
    container.style.display = 'flex';
    
    // Reset classes and trigger reflow to ensure animation plays
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

        if (roll < 0.1) {
            reward = mysteryEggCost * 5;
            prizeDisplay.innerText = "🐥";
            resultText = "JACKPOT! You found a Golden Chick!";
        } else if (roll < 0.5) {
            reward = mysteryEggCost * 1.5;
            prizeDisplay.innerText = "🍬";
            resultText = "Sweet! You found some Jelly Beans!";
        } else {
            prizeDisplay.innerText = "💨";
            resultText = "Oh no! It was a hollow egg.";
        }

        setTimeout(() => {
            if (reward > 0) {
                energy += reward;
                showParticle(window.innerWidth/2, window.innerHeight/2, `+${Math.floor(reward)}`);
            }
            alert(resultText);
            
            // Reset UI state
            container.style.display = 'none';
            btn.style.display = 'inline-block'; 
            
            mysteryEggCost = Math.ceil(mysteryEggCost * 1.2);
            btn.innerText = `CRACK MYSTERY EGG (Cost: ${mysteryEggCost})`;
            updateUI();
            saveGame();
        }, 1000);

    }, 1500);
}

function updateUI() {
    document.getElementById('score-text').innerText = Math.floor(energy).toLocaleString();
    document.getElementById('stat-click').innerText = (clickPower * (1 + (goldenTortas * 0.1))).toFixed(1);
    document.getElementById('stat-cps').innerText = (cps * (1 + (goldenTortas * 0.1))).toFixed(1);
    document.getElementById('stat-prestige').innerText = goldenTortas;
    document.getElementById('prestige-btn').style.display = energy >= 1000000000 ? 'block' : 'none';
    
    const huntPercent = getHuntProgress();
    if (huntPercent === -1) {
        document.getElementById('global-bar-fill').style.width = "0%";
        document.getElementById('global-text').innerText = `GLOBAL HUNT STARTS ON APRIL 5TH`;
    } else {
        document.getElementById('global-bar-fill').style.width = huntPercent + "%";
        document.getElementById('global-text').innerText = `GLOBAL HUNT PROGRESS: ${huntPercent}% TO SPRING REVELRY`;
    }

    upgrades.forEach(u => {
        const btn = document.getElementById(`up-${u.id}`);
        if (btn) {
            btn.disabled = energy < u.cost;
            energy >= u.cost ? btn.classList.add('can-afford') : btn.classList.remove('can-afford');
            document.getElementById(`cost-${u.id}`).innerText = u.cost.toLocaleString() + " Eggs";
            document.getElementById(`count-${u.id}`).innerText = u.count || 0;
        }
    });

    const body = document.body; const label = document.getElementById('env-label');
    if (energy < 100000) { body.className = 'bg-kitchen'; label.innerText = "LOCATION: THE GARDEN GATE"; }
    else if (energy < 10000000) { body.className = 'bg-buffet'; label.innerText = "LOCATION: BLOOMING FLOWERBEDS"; }
    else if (energy < 1000000000) { body.className = 'bg-factory'; label.innerText = "LOCATION: CANDY WORKSHOP"; }
    else { body.className = 'bg-space'; label.innerText = "LOCATION: THE GREAT EGG NEBULA"; }
}

function initShop() {
    const shop = document.getElementById('shop'); shop.innerHTML = '';
    upgrades.forEach(u => {
        const btn = document.createElement('button');
        btn.className = 'upgrade'; btn.id = `up-${u.id}`;
        btn.onclick = () => buyUpgrade(u.id);
        btn.innerHTML = `<div class="u-info"><span class="u-name">${u.name}</span><span class="u-desc">${u.desc}</span><span class="u-cost" id="cost-${u.id}">${u.cost.toLocaleString()} Eggs</span></div><div class="u-count" id="count-${u.id}">${u.count || 0}</div>`;
        shop.appendChild(btn);
    });
}

function buyUpgrade(id) {
    const u = upgrades[id];
    if (energy >= u.cost) {
        energy -= u.cost;
        u.count = (u.count || 0) + 1;
        if (u.type === "click") clickPower += u.power; else cps += u.power;
        u.cost = Math.ceil(u.cost * 1.35);
        updateUI();
        saveGame();
    }
}

function prestige() {
    if (energy < 1000000000) return;
    const bonus = Math.floor(Math.log10(energy / 1000000000)) + 1;
    if (confirm(`Find ${bonus} Golden Carrots? (Resets progress for eternal power!)`)) {
        goldenTortas += bonus;
        energy = 0; clickPower = 1; cps = 0;
        upgrades = JSON.parse(JSON.stringify(initialUpgrades));
        initShop(); saveGame(); updateUI();
    }
}

function showParticle(x, y, text) {
    const p = document.createElement('div'); p.className = 'particle'; p.innerText = text;
    p.style.left = x + 'px'; p.style.top = y + 'px';
    document.body.appendChild(p); setTimeout(() => p.remove(), 800);
}

function saveGame() {
    const gameData = { energy, clickPower, cps, goldenTortas, upgrades, mysteryEggCost };
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameData));
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    document.getElementById('save-status').innerText = `Saved at ${timeString}`;
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
        if (d.upgrades) {
            d.upgrades.forEach(savedU => {
                const currentU = upgrades.find(u => u.id === savedU.id);
                if (currentU) { currentU.count = savedU.count; currentU.cost = savedU.cost; }
            });
        }
    }
    document.getElementById('mystery-egg-btn').innerText = `CRACK MYSTERY EGG (Cost: ${mysteryEggCost})`;
    initShop(); updateUI();
}

function resetGame() { if (confirm("Wipe all progress?")) { localStorage.removeItem(SAVE_KEY); location.reload(); } }

loadGame();
setInterval(saveGame, 10000);
