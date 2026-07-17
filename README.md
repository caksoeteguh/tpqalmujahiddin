# Ngajiku App - Vercel Deployment Guide

Aplikasi ini siap untuk di-deploy ke Vercel melalui GitHub. Berikut adalah langkah-langkah infrastruktur yang perlu Anda siapkan:

## 1. Persiapan GitHub
- Pastikan semua file proyek sudah di-push ke repository GitHub Anda.
- File `vercel.json` sudah disertakan untuk menangani routing Single Page Application (SPA).

## 2. Persiapan Vercel
1. Login ke [Vercel](https://vercel.com).
2. Klik **Add New** > **Project**.
3. Import repository GitHub Anda.
4. Pada bagian **Environment Variables**, tambahkan variabel berikut (sesuaikan nilainya jika Anda menggunakan project Firebase yang berbeda):

| Variable Name | Value |
|---------------|-------|
| `VITE_FIREBASE_PROJECT_ID` | `rational-symbol-sbndl` |
| `VITE_FIREBASE_APP_ID` | `1:266662401322:web:e53ed6b9b301e518ddba53` |
| `VITE_FIREBASE_API_KEY` | `AIzaSyD6XYOBmdEounoXrIYkGJgGIeGgA276ZwE` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `rational-symbol-sbndl.firebaseapp.com` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `rational-symbol-sbndl.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `266662401322` |
| `VITE_FIREBASE_DATABASE_ID` | `ai-studio-ngajiku-b9ae2248-341d-403a-bdf6-91ea7aac88b5` |

## 3. Deployment
- Klik **Deploy**.
- Vercel akan otomatis mendeteksi bahwa ini adalah proyek Vite dan akan menjalankan `npm run build` serta menyajikan folder `dist`.

## 4. Keamanan Firebase (Opsional tapi Disarankan)
- Pastikan Anda telah men-deploy `firestore.rules` ke Firebase Console Anda.
- Tambahkan domain Vercel Anda (misal: `app-anda.vercel.app`) ke daftar **Authorized Domains** di Firebase Authentication Settings agar fitur sinkronisasi berjalan lancar.

---
*Catatan: Aplikasi ini dikonfigurasi untuk langsung menggunakan Firebase Firestore (Mode Real) secara default.*
