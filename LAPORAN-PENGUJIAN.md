# Laporan Pengujian — Abibas

Tanggal: 15 Okt 2026. Lingkungan: Node v24, npm 11, Vite build lokal.
Integrasi Google Sheets: **BELUM TERVERIFIKASI** (belum ada URL Apps Script /
Sheet nyata / env). Tidak ada hasil yang dikarang.

**Pembaruan 19 Okt 2026** — lapisan Apps Script **TERVERIFIKASI** untuk baca &
validasi (lihat §H): `doGet` sehat, `doPost` terpanggil, `ping` + `getProducts`
(8 produk) + penolakan validasi berhasil lewat kode produksi `api/_lib/gas.js`.
**Masih belum terverifikasi**: alur tulis penuh (register + checkout nyata yang
mengubah Sheets) dan alur end-to-end lewat Vercel (belum ada env/proyek Vercel).

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
| 21 | Mode PVC konsisten PDF | N/A — Mode PVC & `/pvc` dihapus dari storefront (lihat §F baris 3: `/pvc` kini 404) |
| 22 | Demo vs Sheets dibedakan | Sebagian — **tidak ada badge/banner mode** di kode; pemisahan hanya pada jalur data (demo = localStorage, sheets = `/api/*`). Fallback diam-diam pernah ada (bug) dan kini diperbaiki: gagal muat menampilkan error, data demo tidak ikut ditampilkan |
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
- Frontend Sheets gagal → tampil pesan error, data demo **tidak** ditampilkan
  (diperbaiki 19 Okt 2026; sebelumnya `Home.jsx`/`Catalog.jsx` menelan error
  dan diam-diam menampilkan data demo palsu).

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
| 8–12 | Cart, auth, checkout, riwayat | Business logic & API tidak diubah (`node --check` API lolos — catatan: cek itu **hanya sintaks**, tidak mendeteksi import path rusak yang menimbulkan `MODULE_NOT_FOUND`; sudah diperbaiki, lihat §H) |
| 13–14 | Tanpa PVC; tanpa gambar rusak | Lolos (grep nol sisa; 2 foto kampanye valid JPEG, 2 dicek visual, served 200, ada di bundle) |
| 15–16 | Katalog 1200–1360px; backend utuh | Lolos (container 1280px; `api/`, GAS, context tak diubah) |
| 17–18 | Sheets | Tetap **belum terverifikasi** (butuh akses nyata) |

## H. Temuan & perbaikan 19 Okt 2026

### Verifikasi live lapisan Apps Script (tanpa Vercel)

| Uji | Perintah | Hasil |
|---|---|---|
| Health | `GET /exec` | 302 → echo, lalu **200** `{"ok":true,"service":"abibas-gas",…}` — script & spreadsheet aktif |
| `doPost` benar-benar terpanggil | `POST {"action":"ping"}` (secret sengaja salah) | 302 → GET echo → **403** `{"ok":false,"error":"Akses ditolak."}` |
| URL lama (`apps-script/catatan` sebelumnya) | `GET`/`POST` `/exec` lama | **404** — deployment mati; diganti **Versi 7** (19 Okt 2026 13.26) |
| Aksi autentik (`ping` + secret benar) | `callGas('ping')` | **200** `{"now":"2026-10-19T06:55:33.817Z"}` — secret cocok, `doPost` terpanggil |
| Baca sheet `Products` | `callGas('getProducts')` | **200**, **8 produk** (`AB-T001…AB-H002`), stok & harga sesuai sheet |
| Validasi `createOrderAtomic` (tak menulis) | items kosong | **400** `Item pesanan tidak valid.` |
| Validasi stok (tak menulis) | `AB-T001/S` qty 999 | **400** `Kuantitas tidak valid untuk Kaos Oversize Hitam Essential` |
| Alur tulis penuh: register | `POST /api/register` | **201** — user dibuat (`usr-mvewjjsh-b6a4d456`), hash scrypt + sesi tersimpan |
| Register email duplikat | ulang email sama | **409** `Email sudah terdaftar.` |
| Login salah / benar | `POST /api/login` | **401** lalu **200** |
| Sesi cookie | `GET /api/me` | **200**, user dari sesi |
| Checkout | `POST /api/orders` (AB-T001/S ×1) | **201** `ORD-MVEWJYM6LC`, subtotal 129000 + ongkir 15000 = **144000** |
| Riwayat + itemCount | `GET /api/orders` | **200**, `itemCount: 1` |
| Detail pesanan + items | `GET /api/orders/:id` | **200**, `items` terisi (import yang dulu rusak kini jalan) |
| Stok berkurang | `GET /api/products` | AB-T001/S **10 → 9**, `updatedAt` ikut berubah |
| Alur end-to-end lewat browser/Vercel | — | **Belum** (belum ada env/proyek Vercel) |

Catatan data: pada uji checkout, `phone` `081234567890` kembali sebagai angka
`81234567890` (nol depan hilang) karena kolom `Orders.phone` belum berformat
Plain text — lihat `PANDUAN-SPREADSHEET.md` §3. Bukan bug kode, murni format sel.

Catatan: seluruh uji di atas memakai `api/_lib/gas.js` versi produksi (bukan
mock), sehingga sekaligus membuktikan penanganan redirect 302 yang baru.

### Bug yang ditemukan & diperbaiki

1. **`redirect: 'follow'` merusak semua panggilan.** Apps Script membalas POST
   dengan 302 ke `script.googleusercontent.com`. Dengan `redirect: 'follow'`,
   fetch menurunkan POST menjadi GET dan membuang bodi → `doPost` tidak pernah
   terpanggil, respon akhir HTML → seluruh `/api/*` gagal (502).
   **Fix:** `api/_lib/gas.js` memakai `redirect: 'manual'` lalu GET terpisah
   ke `Location`.
2. **Import path rusak** di `api/orders/[id].js` (`../../_lib/gas.js` →
   `../_lib/gas.js`) → `GET /api/orders/:id` selalu 500 `MODULE_NOT_FOUND`.
   `node --check` tidak menangkap ini karena hanya memvalidasi sintaks.
3. **`sendError` menelan pesan 503** (misconfig env) → kini ditampilkan.
4. **Fallback diam-diam** di `Home.jsx`/`Catalog.jsx` pada mode sheets → kini
   error ditampilkan dan data demo tidak ditampilkan.
5. **`getOrdersByUser`** tidak menghitung jumlah item → `itemCount` ditambahkan.
6. **`Code.gs`**: `updatedAt` (kolom 12) hanya ditulis untuk produk pertama;
   validasi stok dilakukan *setelah* baris order/items ditulis (risiko pesanan
   yatim bila stok berubah) → kini kebutuhan stok diakumulasi per sel dan
   divalidasi **sebelum** menulis apa pun.

### Terverifikasi lewat mock (fetch di-mock, handler API asli)

`GET /api/orders/:id` → 200 `{order:…}` · `GET /api/orders` → 200
`{orders:[{itemCount:3}]}` · `GET /api/products` → 200 · `sendError` 503 →
pesan asli, 500 → "Terjadi kesalahan server." · `npm run lint` dan
`npm run build` lolos.

## E. Yang harus dilakukan pemilik (agar integrasi terverifikasi)

1. Ikuti `PANDUAN-SPREADSHEET.md` → tempel `Code.gs` → set `SHARED_SECRET` → deploy → isi env Vercel.
2. Jalankan ulang: register → login → checkout 2 akun bersamaan (uji race) → cek stok Sheets → buka order silang (harus 404).
3. Perbarui file ini: ganti status "menunggu verifikasi" menjadi hasil nyata.
