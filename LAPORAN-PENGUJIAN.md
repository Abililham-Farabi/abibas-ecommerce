# Laporan Pengujian — Abibas

Tanggal: 15 Okt 2026. Lingkungan: Node v24, npm 11, Vite build lokal.
Integrasi Google Sheets: **BELUM TERVERIFIKASI** (belum ada URL Apps Script /
Sheet nyata / env). Tidak ada hasil yang dikarang.

**Pembaruan 19 Okt 2026** — lapisan Apps Script **TERVERIFIKASI end-to-end**
(lihat §H): `doGet` sehat, `doPost` terpanggil, dan seluruh alur tulis nyata
(register → login → sesi → checkout → stok berkurang → riwayat → detail) berhasil
lewat kode produksi `api/_lib/gas.js`. Data uji sudah dibersihkan via aksi
`cleanupTestData`. **Belum**: alur end-to-end lewat Vercel (belum ada proyek/env Vercel).

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
| Stok berkurang | `GET /api/products` | AB-T001/S **10 → 9**, `updatedAt` ikut berubah (**terverifikasi**) |
| `phone` nol depan | checkout `phone: 081234567890` | **Gagal** saat format kolom masih otomatis (tersimpan `81234567890`); **diperbaiki di `Code.gs`** (`setNumberFormat('@')`) → tersimpan `"081234567890"` (**lulus**) |
| Pembersihan data uji | aksi `cleanupTestData` | **Lulus** — hapus 1 user, 4 sesi, 3 order, 3 item; stok dikembalikan (`AB-T001/S`=10, `AB-T002/M`=10); sisa user `null`, sisa order 0 |
| Alur end-to-end lewat browser/Vercel | — | **Belum** (belum ada proyek/env Vercel) |

Catatan data: `phone` `081234567890` sempat kembali sebagai angka `81234567890`
(nol depan hilang). Mengubah format kolom jadi Plain text **tidak cukup** —
nilai `appendRow` tetap diparse Sheets. Diperbaiki di `Code.gs`
(`createOrderAtomic` memaksa sel phone `setNumberFormat('@')`), lalu terbukti
kembali sebagai string `"081234567890"`.

Aksi pemeliharaan `cleanupTestData` (wajib `confirm: 'HAPUS-DATA-UJI'`) dipakai
untuk menghapus data uji & mengembalikan stok demo; berguna untuk reset sebelum
demo/presentasi. Bila tidak diperlukan lagi, aksi & helper `deleteRowsBy` dapat
dihapus dari `Code.gs`.

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

## I. Verifikasi produksi Vercel (19 Okt 2026)

Target: <https://abibas-ecommerce.vercel.app> (deployment produksi, `VITE_DATA_MODE=sheets`).
Metode: `curl` + cookie jar terhadap API live, lalu `cleanupTestData` via `api/_lib/gas.js` produksi.

### Uji baca

| Uji | Hasil |
| --- | --- |
| `GET /api/products` | 200, 8 produk dari Sheets (`AB-T001…AB-H002`) |
| `GET /api/orders`, `/api/me` tanpa sesi | 401 `{"error":"Sesi tidak ditemukan. Silakan masuk."}` |
| `GET /api/orders/ORD-NGAWUR` | 401 (auth dicek sebelum ID; bukan 500) |
| `GET /`, `/katalog`, `/produk/AB-T001` | 200 HTML (rewrite SPA jalan) |
| `GET /api/tidak-ada` | 404 (tidak dibajak fallback SPA) |
| `POST /api/login` body `{}` | 400 JSON rapi (bukan 502 HTML) |
| Bundle `index-*.js` | `function $n(){return!1}` → `isDemoMode()===false`, mode `sheets` aktif |
| `Set-Cookie` | `abibas_session=…; HttpOnly; SameSite=Lax; Secure; Max-Age=604800` |

### Uji tulis E2E (20/20 lolos)

register 201 → register duplikat 409 → login sandi salah 401 → login benar 200 →
`/api/me` 200 → checkout `AB-T001/S`×1 201 (`ORD-MVEYJEWUDX`, total 144000 =
129000 + ongkir 15000) → `GET /api/orders` 200 (`itemCount:1`) →
`GET /api/orders/:id` 200 (item terisi, `phone` tetap teks `"081234567890"`) →
stok `AB-T001/S` 10→9 → logout 200 → `/api/me` 401.

### Pembersihan & verifikasi akhir

`cleanupTestData` menghapus **1 user, 2 sesi, 1 order, 1 orderItem**, mereset
`AB-T001/S=10` (`updatedAt` → `2026-10-15T00:00:00.000Z`). Setelah itu: stok
`AB-T001/S=10`, sesi lama 401, login akun yang sudah dihapus 401 — spreadsheet
kembali bersih.

## J. Fitur lacak pesanan + perbaikan daftar kosong (19 Okt 2026)

### Diagnosis "Pesanan saya kosong padahal checkout berhasil"

Diuji dengan akun + pesanan uji baru di produksi: `GET /api/orders` mengembalikan
**1 pesanan** dan `userId`-nya **identik** dengan sesi (`/api/me`). Jadi lapisan
server (Vercel → GAS → Sheets) benar; penyebabnya ada di sisi klien:

1. respons `/api/*` tidak mengirim `Cache-Control: no-store` (hanya
   `public, max-age=0, must-revalidate`), sehingga halaman bisa disajikan dari
   cache perantara;
2. `Orders.jsx` hanya memuat data sekali saat mount — bila Safari memulihkan
   halaman dari **bfcache** (tombol back), JS tidak dijalankan ulang dan daftar
   lama (kosong) tetap tampil tanpa satu pun request.

**Perbaikan:** semua respons `/api/*` kini `Cache-Control: no-store, max-age=0`
(sekaligus menutup cache data pesanan/pemilik), dan `/pesanan` memuat ulang saat
halaman kembali aktif (`pageshow` + `visibilitychange`) plus tombol "Muat ulang".

### Status pesanan kini bergerak (persisten)

Sebelumnya `orderStatus` selamanya `menunggu_pembayaran_simulasi` — label
`diproses/dikirim/selesai` ada di `ui.jsx` tapi tidak pernah ditulis kode mana pun.

- `Code.gs`: aksi baru `updateOrderStatus` — wajib pemilik, naik **satu tahap**
  per panggilan (`menunggu_pembayaran_simulasi → pembayaran_simulasi_dikonfirmasi
  → diproses → dikirim → selesai`), idempoten, menulis `orderStatus`, `updatedAt`,
  `paymentStatus` (tahap pertama), dan cap waktu tahap `paidAt`/`packedAt`/
  `shippedAt`/`doneAt`. Kolom cap waktu bersifat **opsional**: bila header belum
  ada, tahapan tetap jalan tanpa riwayat waktu.
- `api/orders/[id].js`: `POST { status }` (whitelist di Vercel + validasi ulang di GAS).
- UI: `/pesanan` jadi pusat lacak (tile **Belum Bayar · Dikemas · Dikirim ·
  Selesai** + badge jumlah sebagai filter, kartu pesanan, "Lihat riwayat
  lengkap"); `/pesanan/:id` menampilkan **timeline tahapan** + tombol simulasi.
  Gaya monokrom Abibas (bukan oranye Shopee); label/warna dari satu sumber di
  `src/utils/format.js`.

Deployment Apps Script: **Versi 10 (19 Okt 2026 15.38)**; 4 header kolom `O1:R1`
ditambahkan di tab `Orders` (`paidAt | packedAt | shippedAt | doneAt`).

### Uji lokal (harness Node + Spreadsheet tiruan, `Code.gs` apa adanya)

14/14 lolos: lompat tahap → 409 · bukan pemilik → 404 · status ngawur → 400 ·
alur penuh 4 tahap + cap waktu + `paymentStatus` · idempoten · degradasi mulus
tanpa kolom cap waktu · `getOrdersByUser` tetap benar (`itemCount`).

### Uji produksi (setelah deploy)

| Uji | Hasil |
| --- | --- |
| `Cache-Control` pada `/api/*` | `no-store, max-age=0` |
| register → checkout `AB-T002/M` | 201 → 201 (`ORD-MVF0F7M89X`) |
| `GET /api/orders` | 200, **berisi 1 pesanan** (orderId cocok) |
| status awal | `menunggu_pembayaran_simulasi` (order & payment) |
| `POST` lompat tahap / status ngawur / pesanan orang lain | 409 / 400 / 404 |
| `POST` bertahap 4× | 200 semua, `orderStatus` naik tepat satu langkah |
| `paymentStatus` | ikut jadi `pembayaran_simulasi_dikonfirmasi` |
| `paidAt, packedAt, shippedAt, doneAt` | terisi berurutan (`…:30.050Z → :35.269Z → :40.379Z → :45.761Z`) |

**Pembersihan:** terarah (email + orderId uji saja) → 1 user, 1 sesi, 1 order,
1 orderItem terhapus, `AB-T002/M` kembali 10. Pesanan asli pemilik di tab `Orders`
tidak tersentuh (uji tulis ke order itu balas 404). Verifikasi akhir: stok 10,
login akun uji 401, `/api/orders` tanpa sesi 401.

### Keterbatasan yang jujur

- Tahapan masih **manual (tombol simulasi)**, bukan alur pembayaran/kurir nyata;
  no. resi (`ABI…`) juga hanya tampilan.
- Kolom `paidAt`…`doneAt` harus ditambah manual di Sheet bila riwayat waktu per
  tahap diinginkan.
## K. Penyederhanaan tampilan (19 Okt 2026)

Keputusan produk dari pemilik: **hapus Panduan ukuran** (halaman + semua tautan)
dan **strip "Info belanja"** di beranda, serta **kolom "Kebijakan" di footer** —
alasannya kontennya berulang dan tabel ukurannya ilustratif sehingga lebih
menambah keraguan daripada kepercayaan. Tampilan jadi lebih bersih dan footer
menyusut dari 4 kolom ke 3 (brand · Belanja · Bantuan).

Yang dihapus/diubah:

| Berkas | Perubahan |
| --- | --- |
| `src/pages/SizeGuide.jsx`, `src/components/SizeTable.jsx`, `src/data/sizeGuide.js` | file dihapus |
| `src/App.jsx` | rute `/panduan-ukuran` → `<Navigate to="/katalog" replace />` |
| `src/components/Navbar.jsx` | tautan "Panduan Ukuran" (utility bar + menu mobile) dihapus |
| `src/pages/Home.jsx` | CTA hero "Cek ukuran" dihapus, klaim "panduan ukuran yang jelas" dibuang, seksi "Info belanja" dihapus |
| `src/pages/ProductDetail.jsx` | tombol + modal "Panduan ukuran (cm)" dihapus (pemilih ukuran tetap) |
| `src/components/Footer.jsx` | item "Panduan ukuran" & kolom "Kebijakan" dihapus, `lg:grid-cols-4` → `-3` |
| `ASUMSI-KETERBATASAN.md` | asumsi "Tabel ukuran ilustratif" dihapus + renumber |

Halaman **Panduan ukuran tetap tercatat di §A–§G sebagai riwayat** pengujian
sebelum penghapusan.

Verifikasi: `npm run lint` (5 peringatan lama, tidak ada baru) dan `npm run
build` lolos; `grep` memastikan **nol** sisa rujukan `SizeTable`, `sizeGuide`,
`guideOpen`, atau teks "Cara mengukur" (satu-satunya sisa string
`panduan-ukuran` adalah rute redirect). Bundle produksi `index-BsOmGqeV.js`
tidak lagi memuat "Cara mengukur"/"Panduan ukuran"/"Lebar". URL lama tetap balas
HTML 200 lalu dialihkan ke `/katalog` di sisi klien.
## L. Reposisi katalog ke perlengkapan lari (20 Okt 2026)

Keputusan pemilik: Abibas fokus **olahraga lari**, bukan sepak bola maupun
pakaian kasual. Katalog diganti total: sepatu lari, baju lari, celana lari,
gel energi, dan botol minum.

### Perubahan data & model

| Area | Sebelum | Sesudah |
|---|---|---|
| Produk | 8 SKU kaos/kemeja/hoodie | 10 SKU: 3 sepatu, 2 baju, 2 celana, 2 gel, 1 botol |
| Ukuran | selalu S–XL | `sizeType`: `apparel` (S–XL), `shoes` (39–44), `one` (satu ukuran) |
| Kolom stok `Products` | `stockS…stockXL` | + `sizeType`, `stock39…stock44`, `stockOne` |
| Pemetaan kolom di GAS | nomor kolom tetap `{S:7,M:8,L:9,XL:10}` | dibaca dari **nama header** (`stockColumns`) |
| Keranjang/pesanan | ukuran selalu ada | `size: 'ALL'` untuk gel/botol, disembunyikan di UI |

`getProducts` di GAS mengembalikan `sizeType` + `stock` (objek) **dan** tetap
`stockS…stockXL` agar frontend versi lama tetap jalan selama masa transisi.

### Kode yang berubah

`src/data/products.demo.js` (10 produk) · `src/utils/format.js` (`SIZE_TYPES`,
`SIZES`, `SHOE_SIZE_CM`, `sizesFor`, `stockOf`, `totalStock`, `sizeLabel`,
`isOneSize`) · `ProductDetail` (ukuran per keluarga + acuan cm sepatu, tanpa
pemilih ukuran untuk gel/botol) · `Catalog` (filter ukuran 39–44, placeholder
cari) · `Cart`/`Checkout`/`OrderDetail` (label `ALL` disembunyikan) ·
`Home`/`Navbar`/`Footer`/`index.html` (copy & kategori lari) ·
`apps-script/Code.gs` (`SIZE_TYPES`, `headerOf`, `stockColumns`, validasi ukuran
per produk, decrement/restore stok dinamis, `updatedAt` dicari dari header).

### Aset

- 8 foto produk + hero + 2 foto kampanye dari Unsplash (lisensi & ID dicatat di
  `public/products/SOURCES.md` dan `public/campaigns/SOURCES.md`).
- Gel memakai placeholder SVG buatan sendiri (`ab-g001.svg`, `ab-g002.svg`,
  tanda "?") sampai foto asli diunggah pemilik.
- Foto kaos/kemeja/hoodie lama dihapus; `public/img/ab-*.svg` diganti satu
  `public/img/placeholder.svg`.
- Logo baru: `public/logo.svg` (sepatu lari + garis kecepatan di kotak ink)
  untuk favicon/ikon dan `public/logo-mark.svg` (transparan) di navbar;
  `public/favicon.svg` (logo ungu bawaan template, tak terpakai) dihapus.

### Verifikasi di branch (mode demo, tanpa database)

`npm run lint` — 5 peringatan lama, tidak ada yang baru.
`npm run build` — lolos. `node --check` pada salinan `Code.gs` — sintaks OK.
Belum ada pengujian database/GAS di branch ini sesuai keputusan pemilik;
langkah tempel `Code.gs`, isi ulang tab `Products`, dan smoke test produksi
dilakukan setelah merge ke `main`.

## M. Peluncuran katalog lari ke produksi (20 Okt 2026)

Merge `feat/running-store` → `main` (fast-forward `9ac1721..6f278a4`), Vercel
auto-deploy; bundle produksi `assets/index-Dvy_j2-T.js`. GAS dinaikkan ke
versi 11, tab `Products` diisi 10 produk lari (20 kolom) dari
`data/products.xlsx`.

### Smoke test produksi (API langsung)

| Uji | Hasil |
|---|---|
| Register + login pengguna uji | 201 / 200 |
| POST `/api/orders` sepatu `AB-R001` size `42` + gel `AB-G001` `ALL` ×2 | 201, total Rp614.000 |
| Stok `AB-R001/42` | 6 → 5 |
| Stok `AB-G001/ALL` | 40 → 38 |
| Stok `AB-R001/41` (tak dipesan) | tetap 6 |
| GET `/api/orders/:id` | 200, 2 item, size `42` & `ALL` tersimpan |
| `/panduan-ukuran` | redirect ke `/katalog` (10 produk) |
| Gambar `/katalog?kat=Baju lari` | kaos hitam + singlet (bukan sepatu) |

### Pembersihan data uji

`cleanupTestData`: 1 user, 2 session, 1 order, 2 order item dihapus;
stok `AB-R001/42` = 6 dan `AB-G001/ALL` = 40 dikembalikan. Pesanan asli
pemilik tidak disentuh (penghapusan hanya berdasarkan email/orderId uji).

Catatan: dua produk yang sempat dipesan kini punya `updatedAt` terisi —
nilainya benar (waktu stok terakhir berubah), bukan data uji yang tertinggal.

## N. Optimasi kecepatan katalog & lacak pesanan (22 Okt 2026)

Keluhan: halaman katalog dan "lacak pesanan" terasa lambat. Penyebab utama
bukan beratnya halaman, melainkan setiap kunjungan menunggu Apps Script
(1,5–2,1 dtk per eksekusi) dan `Orders` memakai tiga eksekusi berantai.

### Perubahan

- **GAS v12** (`apps-script/Code.gs`): `getProducts` memakai `CacheService`
  (30 dtk) dengan `invalidateProductsCache()` setiap stok berubah;
  `productMap(true)` tetap membaca sheet langsung saat checkout (anti-oversell).
  Aksi baru `getOrdersWithSession` dan `getOrderWithSession` menggabungkan
  validasi sesi + data pesanan dalam satu eksekusi.
- **Vercel Functions**: `/api/products` memakai cache memori 30 dtk + header
  `public, s-maxage=60, stale-while-revalidate=600`; saat GAS gagal, salinan
  terakhir tetap disajikan. GET `/api/orders` dan `/api/orders/:id` memakai
  aksi sesi-gabungan; POST tetap lewat `requireSession`.
- **Klien**: hook `useProducts` (cache memori + `sessionStorage`, TTL 5 menit,
  refresh di belakang layar) dipakai `Home`, `Catalog`, dan `ProductDetail`.
  `Orders` menyimpan salinan per pengguna, memperbaiki listener
  `pageshow`/`visibilitychange` (tidak lagi memuat ganda saat tab aktif), dan
  `AuthContext` menyimpan petunjuk sesi agar halaman tidak tertahan.
- **Gambar**: seluruh JPEG produk/kampanye di-re-encode (maks 1200 px, q72,
  progresif): total 1.444 KB → 770 KB; hero 100 KB → 60 KB. Ditambah
  `width`/`height`, `loading`, `fetchpriority` untuk hero, dan
  `Cache-Control: public, max-age=3600, stale-while-revalidate=86400` untuk
  `/products/*` dan `/campaigns/*`.

### Verifikasi

Deploy: GAS versi 12 (URL sama), `main` `eeee387`, bundle
`assets/index-VCMFv7Ox.js`.

Harness lokal (handler Vercel + GAS asli): **16/16 lolos** — katalog, register,
`/api/me`, daftar pesanan, buat pesanan, stok turun, detail pesanan, 401 tanpa
sesi, pemulihan stok lewat `cleanupTestData`.

Produksi:

| Uji | Hasil |
|---|---|
| `/api/products` panggilan pertama | 200, 2,89 dtk, `x-vercel-cache: MISS` |
| `/api/products` panggilan berikutnya | 200, 48 ms, `HIT` (age 2) |
| Siklus kedaluwarsa cache | `STALE` → revalidasi → `HIT` (age 30) |
| Header cache katalog | `public` (Vercel menormalkan `s-maxage`) |
| Header gambar | `public, max-age=3600, stale-while-revalidate=86400` |
| Register / login | 201 / 200 |
| `GET /api/orders` (sesi valid) | 200, 3,66–3,77 dtk, 1 eksekusi GAS |
| `POST /api/orders` sepatu 42 + gel ALL ×2 | 201, total Rp614.000 |
| Stok setelah pesanan | 42: 6→5, ALL: 40→38 |
| `GET /api/orders/:id` | 200, 2 item, size `42` & `ALL` |
| Tanpa cookie | 401 |
| Setelah sesi dihapus `cleanupTestData` | 401 "Sesi kedaluwarsa" |
| Halaman `/katalog` produksi | 200, 10 produk, foto tampil |

Catatan pengukuran: angka di atas sampel tunggal dan sangat dipengaruhi cold
start Apps Script (register 6,2 dtk; buat pesanan 6,3 dtk). Perbaikan terukur
paling jelas ada di kunjungan berulang: katalog dari >2 dtk menjadi ~50 ms
lewat cache CDN, dan daftar pesanan turun dari tiga eksekusi GAS menjadi satu.

### Pembersihan data uji

Empat akun uji (dua lokal, dua produksi) dihapus lewat `cleanupTestData`
beserta 4 sesi, 3 pesanan, dan 6 item; stok `AB-R001/42` dan
`AB-G001/ALL` dikembalikan ke 6 dan 40. Pesanan asli pemilik tidak disentuh.

### Sisa peluang (belum dikerjakan)

- Register/login masih menunggu GAS (scrypt + beberapa baca sheet).
- `getOrdersWithSession` masih membaca 4 sheet; bisa dipercepat dengan indeks
  atau menggabungkan pembacaan, tetapi menyentuh jalur otorisasi.
- GAS tidak mendukung HTTP cache; percepatan berikutnya harus dari CDN/klien.

