// Variabel Data
let totalRolls = 0;
let count1 = 0; 
let frequencies = [0, 0, 0, 0, 0, 0];
let convergenceLabels = [];
let observedProportions = [];
let trueProportions = [];
let diceHistory = []; 
const TRUE_PROBABILITY = 1 / 6;

// Konfigurasi Chart
const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

// INISIALISASI GRAFIK
const ctxOutcomes = document.getElementById('outcomesChart').getContext('2d');
const outcomesChart = new Chart(ctxOutcomes, {
    type: 'bar',
    data: {
        labels: ['1', '2', '3', '4', '5', '6'],
        datasets: [{
            label: 'Frequency', data: frequencies,
            backgroundColor: ['#d93838', 'gray', 'gray', 'gray', 'gray', 'gray'],
            borderColor: 'black', borderWidth: 1
        }]
    },
    options: { ...chartOptions, scales: { y: { beginAtZero: true } } }
});

const ctxConvergence = document.getElementById('convergenceChart').getContext('2d');
const convergenceChart = new Chart(ctxConvergence, {
    type: 'line',
    data: {
        labels: convergenceLabels,
        datasets: [
            { label: 'Observed', data: observedProportions, borderColor: 'black', borderWidth: 1, pointRadius: 0, fill: false },
            { label: 'True', data: trueProportions, borderColor: 'green', borderWidth: 1.5, pointRadius: 0, fill: false }
        ]
    },
    options: { ...chartOptions, animation: false, scales: { y: { min: 0, max: 1 } } }
});

// FUNGSI LOCAL STORAGE (SIMPAN & MUAT DATA)
function saveData() {
    const dataToSave = { totalRolls, count1, frequencies, convergenceLabels, observedProportions, trueProportions, diceHistory };
    localStorage.setItem('diceSimData', JSON.stringify(dataToSave));
}

function loadData() {
    const savedData = localStorage.getItem('diceSimData');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        totalRolls = parsed.totalRolls; count1 = parsed.count1; frequencies = parsed.frequencies;
        convergenceLabels = parsed.convergenceLabels; observedProportions = parsed.observedProportions;
        trueProportions = parsed.trueProportions; diceHistory = parsed.diceHistory || [];

        outcomesChart.data.datasets[0].data = frequencies;
        convergenceChart.data.labels = convergenceLabels;
        convergenceChart.data.datasets[0].data = observedProportions;
        convergenceChart.data.datasets[1].data = trueProportions;
        
        outcomesChart.update(); convergenceChart.update(); updateUI(); renderSavedDice();
    }
}

// FUNGSI VISUAL DADU
function getDieHTML(value) {
    const p = '<div class="pip"></div>'; const pRed = '<div class="pip red"></div>'; const e = '<div></div>';
    switch(value) {
        case 1: return `${e}${e}${e} ${e}${pRed}${e} ${e}${e}${e}`;
        case 2: return `${p}${e}${e} ${e}${e}${e} ${e}${e}${p}`;
        case 3: return `${p}${e}${e} ${e}${p}${e} ${e}${e}${p}`;
        case 4: return `${p}${e}${p} ${e}${e}${e} ${p}${e}${p}`;
        case 5: return `${p}${e}${p} ${e}${p}${e} ${p}${e}${p}`;
        case 6: return `${p}${e}${p} ${p}${e}${p} ${p}${e}${p}`;
        default: return '';
    }
}

function renderSavedDice() {
    const diceContainer = document.getElementById('diceContainer');
    let batchHTML = "";
    diceHistory.forEach((roll, index) => {
        batchHTML += `<div class="die-wrapper"><div class="die">${getDieHTML(roll)}</div><div class="roll-num">#${index + 1}</div></div>`;
    });
    diceContainer.innerHTML = batchHTML;
    diceContainer.scrollTop = diceContainer.scrollHeight;
    diceContainer.scrollLeft = diceContainer.scrollWidth;
}

// LOGIKA UTAMA
function rollDice() {
    let times = parseInt(document.getElementById('numRolls').value);
    if (isNaN(times) || times < 1 || times > 5000) { alert("Masukkan angka 1 - 5000"); return; }

    let currentRolls = [];
    for (let i = 0; i < times; i++) {
        let roll = Math.floor(Math.random() * 6) + 1;
        currentRolls.push(roll); diceHistory.push(roll);
        
        totalRolls++; frequencies[roll - 1]++;
        if (roll === 1) count1++;

        convergenceLabels.push(totalRolls); observedProportions.push(count1 / totalRolls); trueProportions.push(TRUE_PROBABILITY);
    }
    renderAnimatedDice(currentRolls); saveData();
}

function renderAnimatedDice(rolls) {
    const diceContainer = document.getElementById('diceContainer');
    let startingRollNumber = totalRolls - rolls.length + 1;
    let batchHTML = "";
    rolls.forEach((roll, index) => {
        batchHTML += `<div class="die-wrapper rolling new-roll"><div class="die">${getDieHTML(roll)}</div><div class="roll-num">#${startingRollNumber + index}</div></div>`;
    });

    diceContainer.insertAdjacentHTML('beforeend', batchHTML);
    let newlyAddedDice = diceContainer.querySelectorAll('.new-roll');

    setTimeout(() => {
        newlyAddedDice.forEach(wrapper => wrapper.classList.remove('rolling', 'new-roll'));
        diceContainer.scrollTop = diceContainer.scrollHeight;
        diceContainer.scrollLeft = diceContainer.scrollWidth;
        updateUI(); 
    }, 500);
}

function updateUI() {
    document.getElementById('count1').innerText = count1;
    document.getElementById('totalRolls').innerText = totalRolls;
    let proportion = totalRolls === 0 ? 0 : (count1 / totalRolls);
    document.getElementById('prop1').innerText = proportion.toFixed(4);
    outcomesChart.update(); convergenceChart.update();
}

// TOMBOL & NAVIGASI
document.getElementById('btnRoll').addEventListener('click', rollDice);

document.getElementById('btnReset').addEventListener('click', () => {
    if(confirm("Hapus semua data simulasi?")) {
        localStorage.removeItem('diceSimData');
        location.reload(); 
    }
});

// Load data saat web dibuka
window.onload = loadData;

const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const isConv = tab.id === 'tabConvergence';
        document.getElementById('outcomesSection').style.display = isConv ? 'none' : 'block';
        document.getElementById('convergenceSection').style.display = isConv ? 'block' : 'none';
    });
});
