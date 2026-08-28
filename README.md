# Dimensi Fotografi Studio - Booking & Katalog Layanan

Aplikasi web modern untuk studio fotografi profesional: pemesanan jadwal sesi foto, katalog paket foto dinamis, kalkulator add-on, galeri portofolio interaktif, portal konsumen, serta dashboard admin lengkap dengan integrasi Google Cloud Firestore dan Google Drive.

---

## 🚀 Panduan Menghubungkan & Deploy ke GitHub & Vercel.app

### 1. Sinkronisasi dengan GitHub
1. Di Google AI Studio, klik menu **Settings (ikon gear / titik tiga di kanan atas)**.
2. Pilih **Export to GitHub** (atau unduh ZIP lalu push ke repository GitHub Anda, contoh: `github.com/yogappf/Dimensi-Id`).
3. Pastikan branch `main` menerima perubahan commit terbaru.

---

### 2. Konfigurasi Deployment di Vercel (vercel.app)
1. Buka [Dashboard Vercel](https://vercel.com) dan pilih project Anda (`Dimensi-Id`).
2. Masuk ke tab **Settings** ➔ **General** ➔ bagian **Build & Development Settings**:
   - **Framework Preset**: Pilih **Vite**
   - **Build Command**: `vite build` (atau switch Override OFF)
   - **Output Directory**: `dist` (atau switch Override OFF)
   - **Install Command**: `npm install` (atau switch Override OFF)
   - **Node.js Version**: Pilih **20.x** atau **22.x**
3. Masuk ke **Settings** ➔ **Environment Variables** (Opsional jika ingin override Firebase):
   - `VITE_FIREBASE_PROJECT_ID` = `gen-lang-client-0855041857`
   - `VITE_FIREBASE_APP_ID` = `1:375726309445:web:d9f1297773d4094601e32c`
   - `VITE_FIREBASE_API_KEY` = `AIzaSyDMgMWW0KpHmkFE05Z0zMl4PcFLKv5PMVk`
   - `VITE_FIREBASE_AUTH_DOMAIN` = `gen-lang-client-0855041857.firebaseapp.com`
   - `VITE_FIREBASE_DATABASE_ID` = `ai-studio-dimensifotografi-20dced2c-3c35-4fd2-9b29-fd8ec361cfd1`
   - `VITE_FIREBASE_STORAGE_BUCKET` = `gen-lang-client-0855041857.firebasestorage.app`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` = `375726309445`
   - `VITE_FIREBASE_OAUTH_CLIENT_ID` = `375726309445-p48nvrl3l795nckgqld75soi2oeuu9vp.apps.googleusercontent.com`
4. Di tab **Deployments**, klik **⋮ (tiga titik)** pada deployment terbaru ➔ pilih **Redeploy** (centang uncheck *Use existing Build Cache* jika melakukan redeploy manual).

---

### 3. Konfigurasi Firebase (Firestore & Authentication)
1. **Database Firestore ID**: `ai-studio-dimensifotografi-20dced2c-3c35-4fd2-9b29-fd8ec361cfd1`
2. **Authorized Domains di Firebase Console**:
   - Buka **Firebase Console** ➔ **Authentication** ➔ **Settings** ➔ **Authorized domains**.
   - Tambahkan domain Vercel Anda (misal: `dimensi-id.vercel.app` dan `*.vercel.app`).
   - Ini memastikan Google Sign-In pop-up berfungsi lancar di domain Vercel.
3. **Akun Admin Studio**: `dimensi.idphoto@gmail.com`
   - Login dengan Google menggunakan email ini untuk membuka hak akses penuh sebagai Admin Studio.

---

## 💻 Menjalankan Secara Lokal

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev

# 3. Build untuk produksi
npm run build
```
