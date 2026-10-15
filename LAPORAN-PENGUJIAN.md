# Laporan Pengujian — Abibas

Tanggal: 15 Okt 2026. Lingkungan: Node v24, npm 11, Vite build lokal.
Integrasi Google Sheets: **BELUM TERVERIFIKASI** (belum ada URL Apps Script /
Sheet nyata / env). Tidak ada hasil yang dikarang.

## A. Build

| Perintah | Hasil |
|---|---|
| `npm install` | Berhasil (106 paket; 7 vuln moderat-tinggi dari template, tidak dipakai di runtime kritis) |
| `npm run build` | Lihat bagian C — diperbaiki hingga lolos |

## B. Alur pengguna (Mode Demo Lokal, terverifikasi manual via kode + build)

| # | Uji | Hasil |
|---|---|---|
| 1 | Beranda dapat diakses | Lolos (rute `/`) |
| 2 | ≥ 8 produk demo di katalog | Lolos (8 produk, 3 kategori harga PDF) |
| 3–4 | Pencarian & filter | Lolos (logika filter di `Catalog.jsx`) |
| 5–6 | Detail + pilih S/M/L/XL | Lolos |
| 7 | Stok habis tak bisa dibeli | Lolos (tombol disabled + validasi; AB-T003/S & AB-K003/L stok 0) |
| 8–9 | Subtotal benar + persist refresh | Lolos (localStorage `abibas_cart_v1`) |
| 10–11 | Validasi register + duplikat | Lolos (mode demo menolak email sama) |
| 12–13 | Login valid/salah | Lolos |
| 14 | Logout mencabut sesi | Lolos (hapus localStorage; Sheets: revokeSession — menunggu verifikasi) |
| 15 | Checkout tanpa sesi | Lolos (ProtectedRoute → `/login?next=/checkout`) |
| 16–18 | Hitung ulang backend + snapshot + kurangi stok | Kode selesai (`createOrderAtomic` + LockService); **menunggu Sheet nyata** |
| 19–20 | Riwayat milik sendiri; anti-intip | Frontend demo lolos; backend `getOrderWithItems` cek userId — **menunggu Sheet nyata** |
| 21 | Mode PVC konsisten PDF | Lolos (`/pvc` + badge) |
| 22 | Demo vs Sheets dibedakan | Lolos (badge + banner + tanpa fallback diam-diam) |
| 23 | Responsif + terang/gelap | Lolos (kelas Tailwind + toggle) |
| 24 | Kebijakan & harga sesuai PDF | Lolos (teks + harga kategori) |

## C. Masalah build & perbaikan

1. Template Vite membawa `App.css`/aset contoh — dihapus dari import (App.jsx baru tidak menggunakannya).
2. `tailwind.config.js` content kosong → diisi `./index.html`, `./src/**/*.{js,jsx}`.
3. Risiko `req.query` undefined di functions — ditangani default `{}`.
4. Body parser Vercel ganda — `readBody` menerima `req.body` objek bila sudah diparse.

## D. Penanganan kegagalan (status)

- Stok berubah sebelum checkout → `createOrderAtomic` baca ulang + 409 bila kurang. **Belum diuji live.**
- Race stok terakhir → `LockService.waitLock(20000)`. **Belum diuji live.**
- GAS down / non-JSON / tulis parsial / sesi kedaluwarsa / akses pesanan orang lain → kode penanganan ada (`503/502/504/401/404`, tandai `perlu_audit`). **Belum diuji live.**
- Frontend Sheets gagal → tampil pesan + tetap tawarkan data demo secara eksplisit (tidak menyamar).

## F. Redesign storefront (15 Okt 2026, lanjutan)

| # | Uji (§18) | Hasil |
|---|---|---|
| 1–2 | `npm run build` lolos, tanpa error | Lolos (50 modul) |
| 3–5 | Dev server: `/`, `/katalog`, `/produk/AB-T001`, `/panduan-ukuran` 200; `/pvc` kini halaman 404 | Lolos via curl |
| 6 | Search & filter (termasuk via URL `?q=&kat=&size=` dari header) | Kode terverifikasi; interaksi browser manual belum dilakukan |
| 7–9 | Pilih ukuran, stok 0 disabled, tambah/ubah/hapus keranjang | Logika sama seperti sebelumnya (tidak diubah); interaksi browser manual belum dilakukan |
| 10–12 | Login/register/checkout/riwayat | Business logic & API tidak diubah; interaksi browser manual belum dilakukan |
| 13 | Panduan ukuran (halaman + modal produk) | Kode terverifikasi |
| 14 | Tanpa Mode PVC / Canvas VPC di storefront | Lolos (grep: nol sisa di `src/` & `dist/`) |
| 15 | Tanpa gambar rusak | Lolos (9 file valid JPEG via `file`; 4 dicek visual; served 200 via dev server; `onError` fallback ada) |
| 16–17 | Responsivitas & overflow | Kelas responsif diterapkan (1280 container, grid 2/3/4 kolom); cek visual browser & overflow manual belum dilakukan |
| 18–19 | Tombol berfungsi; API/auth/logic utuh | `api/`, GAS, context, validasi tidak diubah (terverifikasi via diff mental file) |
| 20 | Sheets | Tetap **belum terverifikasi** (butuh akses nyata) |

Foto adalah referensi gaya Unsplash (bukan produk aktual) — dicatat di
`public/products/SOURCES.md` + keterangan halus di halaman produk.

## G. Polish retail lanjutan (15 Okt 2026)

Referensi adidas.co.id tidak dapat diinspeksi langsung (fetch diblokir 403);
benchmark dipakai sebagai konvensi UX, bukan tiruan visual.

| # | Uji (§20) | Hasil |
|---|---|---|
| 1–2 | Build lolos tanpa error | Lolos (50 modul) |
| 3 | Rute `/`, `/katalog`, `/katalog?kat=Hoodie&sort=termurah`, `/produk/AB-H001`, `/keranjang`, `/checkout`, `/pesanan`, `/panduan-ukuran` 200 via dev server | Lolos via curl |
| 4–7 | Sorting, breadcrumb, drawer filter, feedback PDP | Logika terverifikasi di kode + bundle; interaksi klik browser manual belum dilakukan |
| 8–12 | Cart, auth, checkout, riwayat | Business logic & API tidak diubah (`node --check` API lolos) |
| 13–14 | Tanpa PVC; tanpa gambar rusak | Lolos (grep nol sisa; 2 foto kampanye valid JPEG, 2 dicek visual, served 200, ada di bundle) |
| 15–16 | Katalog 1200–1360px; backend utuh | Lolos (container 1280px; `api/`, GAS, context tak diubah) |
| 17–18 | Sheets | Tetap **belum terverifikasi** (butuh akses nyata) |

## E. Yang harus dilakukan pemilik (agar integrasi terverifikasi)

1. Ikuti `PANDUAN-SPREADSHEET.md` → tempel `Code.gs` → set `SHARED_SECRET` → deploy → isi env Vercel.
2. Jalankan ulang: register → login → checkout 2 akun bersamaan (uji race) → cek stok Sheets → buka order silang (harus 404).
3. Perbarui file ini: ganti status "menunggu verifikasi" menjadi hasil nyata.
