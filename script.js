// Variabel Data
let totalRolls = 0;
let count1 = 0; 
let frequencies = [0, 0, 0, 0, 0, 0];

let convergenceLabels = [];
let observedProportions = [];
let trueProportions = [];
const TRUE_PROBABILITY = 1 / 6;

// Konfigurasi Chart
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
};

// --- GRAFIK OUTCOMES ---
const ctxOutcomes = document.getElementById('outcomesChart').getContext('2d');
const outcomesChart = new Chart(ctxOutcomes, {
    type: 'bar',
    data: {
        labels: ['1', '2', '3', '4', '5', '6'],
        datasets: [{
            label: 'Frequency',
            data: frequencies,
            backgroundColor: ['#d93838', 'gray', 'gray', 'gray', 'gray', 'gray'],
            borderColor: 'black',
            borderWidth: 1
        }]
    },
    options: {
        ...chartOptions,
        scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Frequency' } },
            x: { title: { display: true, text: 'Mata Dadu' } }
        }
    }
});

// --- GRAFIK CONVERGENCE ---
const ctxConvergence = document.getElementById('convergenceChart').getContext('2d');
const convergenceChart = new Chart(ctxConvergence, {
    type: 'line',
    data: {
        labels: convergenceLabels,
        datasets: [
            {
                label: 'Observed Proportion (1)',
                data: observedProportions,
                borderColor: 'black', borderWidth: 1, pointRadius: 0, fill: false, tension: 0.1
            },
            {
                label: 'True Probability (1/6)',
                data: trueProportions,
                borderColor: 'green', borderWidth: 1.5, pointRadius: 0, fill: false
            }
        ]
    },
    options: {
        ...chartOptions,
        animation: false,
        scales: {
            y: { min: 0, max: 1 },
            x: { title: { display: true, text: 'Roll #' } }
        }
    }
});

// --- FUNGSI VISUAL DADU ---
function getDieHTML(value) {
    const p = '<div class="pip"></div>';
    const pRed = '<div class="pip red"></div>';
    const e = '<div></div>';

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

// --- LOGIKA UTAMA ---
function rollDice() {
    let times = parseInt(document.getElementById('numRolls').value);
    if (isNaN(times) || times < 1 || times > 5000) {
        alert("Silakan masukkan angka antara 1 hingga 5000."); return;
    }

    let currentRolls = [];
    for (let i = 0; i < times; i++) {
        let roll = Math.floor(Math.random() * 6) + 1;
        currentRolls.push(roll);
        
        totalRolls++;
        frequencies[roll - 1]++;
        if (roll === 1) count1++;

        convergenceLabels.push(totalRolls);
        observedProportions.push(count1 / totalRolls);
        trueProportions.push(TRUE_PROBABILITY);
    }

    renderAnimatedDice(currentRolls);
}

// --- PERBAIKAN PERFORMA ANIMASI (BATCH RENDERING) ---
function renderAnimatedDice(rolls) {
    const diceContainer = document.getElementById('diceContainer');
    let startingRollNumber = totalRolls - rolls.length + 1;

    // 1. Kumpulkan semua HTML dadu ke dalam satu string besar terlebih dahulu
    let batchHTML = "";
    rolls.forEach((roll, index) => {
        batchHTML += `
            <div class="die-wrapper rolling new-roll">
                <div class="die">${getDieHTML(roll)}</div>
                <div class="roll-num">#${startingRollNumber + index}</div>
            </div>
        `;
    });

    // 2. Suntikkan ke layar sekaligus (Sangat cepat dan tidak membuat browser freeze)
    diceContainer.insertAdjacentHTML('beforeend', batchHTML);

    // 3. Ambil dadu yang baru saja dimasukkan untuk menghentikan animasinya nanti
    let newlyAddedDice = diceContainer.querySelectorAll('.new-roll');

    // 4. Biarkan animasi berjalan selama 500ms, lalu hentikan serentak
    setTimeout(() => {
        newlyAddedDice.forEach(wrapper => {
            wrapper.classList.remove('rolling', 'new-roll');
        });
        
        // Auto-scroll dan update grafik setelah animasi selesai
        diceContainer.scrollTop = diceContainer.scrollHeight;
        updateUI(); 
    }, 500);
}

function updateUI() {
    document.getElementById('count1').innerText = count1;
    document.getElementById('totalRolls').innerText = totalRolls;
    let proportion = totalRolls === 0 ? 0 : (count1 / totalRolls);
    document.getElementById('prop1').innerText = proportion.toFixed(4);
    
    outcomesChart.update();
    convergenceChart.update();
}

// --- TOMBOL & NAVIGASI ---
document.getElementById('btnRoll').addEventListener('click', rollDice);

document.getElementById('btnReset').addEventListener('click', () => {
    totalRolls = 0; count1 = 0;
    frequencies.fill(0);
    convergenceLabels.length = 0; 
    observedProportions.length = 0; 
    trueProportions.length = 0;
    
    document.getElementById('diceContainer').innerHTML = '';
    updateUI();
});

const tabOutcomes = document.getElementById('tabOutcomes');
const tabConvergence = document.getElementById('tabConvergence');
const sectionOutcomes = document.getElementById('outcomesSection');
const sectionConvergence = document.getElementById('convergenceSection');

tabOutcomes.addEventListener('click', () => {
    tabOutcomes.classList.add('active'); tabConvergence.classList.remove('active');
    sectionOutcomes.style.display = 'block'; sectionConvergence.style.display = 'none';
});

tabConvergence.addEventListener('click', () => {
    tabConvergence.classList.add('active'); tabOutcomes.classList.remove('active');
    sectionConvergence.style.display = 'block'; sectionOutcomes.style.display = 'none';
});
