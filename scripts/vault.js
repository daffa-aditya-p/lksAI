/**
 * SIGAP AI — Secure Environment Vault
 * Utilitas enkripsi dan dekripsi file environment (.env <-> .env.enc)
 * Menggunakan algoritma terstandar industri: AES-256-GCM + Scrypt KDF
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT_DIR, '.env');
const ENC_PATH = path.join(ROOT_DIR, '.env.enc');
const EXAMPLE_PATH = path.join(ROOT_DIR, '.env.example');

// Master key standar untuk evaluasi otomatis ITECHNO CUP 2026
// Pengguna dapat meng-override dengan environment variable SIGAP_VAULT_KEY
const DEFAULT_KEY = 'SIGAP-AI-ITECHNO-CUP-2026-VAL-KEY#PMI-TRIAGE-OFFLINE';

function getMasterKey() {
  const customKey = process.env.SIGAP_VAULT_KEY;
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }
  return DEFAULT_KEY;
}

/**
 * Enkripsi .env menjadi .env.enc
 */
function encryptEnv(options = {}) {
  const silent = options.silent || false;
  const force = options.force || false;

  if (!fs.existsSync(ENV_PATH)) {
    if (!silent) console.error('[!] Error: File .env tidak ditemukan untuk dienkripsi.');
    process.exitCode = 1;
    return false;
  }

  const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
  if (!envContent.trim()) {
    if (!silent) console.error('[!] Error: File .env kosong.');
    process.exitCode = 1;
    return false;
  }

  const passphrase = getMasterKey();
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(passphrase, salt, 32);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(envContent, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  const payload = {
    app: 'SIGAP AI',
    version: '1.0',
    algorithm: 'aes-256-gcm',
    kdf: 'scrypt',
    timestamp: new Date().toISOString(),
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    data: encrypted,
  };

  fs.writeFileSync(ENC_PATH, JSON.stringify(payload, null, 2), 'utf-8');
  if (!silent) {
    console.log('[✓] File .env berhasil dienkripsi ke .env.enc secara aman (AES-256-GCM).');
  }
  return true;
}

/**
 * Dekripsi .env.enc menjadi .env
 */
function decryptEnv(options = {}) {
  const silent = options.silent || false;
  const force = options.force || false;

  if (!fs.existsSync(ENC_PATH)) {
    if (!silent) console.error('[!] Error: File .env.enc tidak ditemukan.');
    process.exitCode = 1;
    return false;
  }

  if (fs.existsSync(ENV_PATH) && !force) {
    // Jika .env sudah ada dan berisi konfigurasi valid, tidak perlu menimpa kecuali force
    const existing = fs.readFileSync(ENV_PATH, 'utf-8').trim();
    if (existing.length > 50 && existing.includes('DATABASE_URL')) {
      if (!silent) {
        console.log('[✓] File .env sudah ada dan siap digunakan.');
      }
      return true;
    }
  }

  try {
    const rawPayload = fs.readFileSync(ENC_PATH, 'utf-8');
    const payload = JSON.parse(rawPayload);

    if (!payload.salt || !payload.iv || !payload.authTag || !payload.data) {
      throw new Error('Format .env.enc tidak valid atau rusak.');
    }

    const passphrase = getMasterKey();
    const salt = Buffer.from(payload.salt, 'hex');
    const iv = Buffer.from(payload.iv, 'hex');
    const authTag = Buffer.from(payload.authTag, 'hex');
    const key = crypto.scryptSync(passphrase, salt, 32);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(payload.data, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    fs.writeFileSync(ENV_PATH, decrypted, 'utf-8');
    if (!silent) {
      console.log('[✓] File .env berhasil didekripsi dari .env.enc (AES-256-GCM terverifikasi).');
    }
    return true;
  } catch (err) {
    if (!silent) {
      console.error('[!] Gagal mendekripsi .env.enc:', err.message);
    }
    process.exitCode = 1;
    return false;
  }
}

/**
 * Cek status environment
 */
function statusEnv() {
  console.log('--- SIGAP AI Environment Vault Status ---');
  console.log(`- File .env     : ${fs.existsSync(ENV_PATH) ? 'Ada (Plaintext lokal)' : 'Tidak Ada'}`);
  console.log(`- File .env.enc : ${fs.existsSync(ENC_PATH) ? 'Ada (Terenkripsi aman)' : 'Tidak Ada'}`);
  console.log(`- File .env.ex  : ${fs.existsSync(EXAMPLE_PATH) ? 'Ada' : 'Tidak Ada'}`);
}

// CLI dispatcher
const args = process.argv.slice(2);
const command = args[0] || 'status';
const silent = args.includes('--silent') || args.includes('-s');
const force = args.includes('--force') || args.includes('-f');

switch (command) {
  case 'encrypt':
    encryptEnv({ silent, force });
    break;
  case 'decrypt':
    decryptEnv({ silent, force });
    break;
  case 'status':
    statusEnv();
    break;
  default:
    console.log('Penggunaan: node scripts/vault.js [encrypt|decrypt|status] [--force] [--silent]');
    break;
}
