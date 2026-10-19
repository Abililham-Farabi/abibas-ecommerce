# Abibas — Website E-Commerce (Demo Akademik)

Brand pakaian kasual milik sendiri, dibangun dari PDF
`VPC Abibas Digital Business real.pdf` (tugas kuliah Digital Business).
Proposisi nilai: pembeli bisa **memilih ukuran dengan yakin, tahu total biaya
sebelum membayar, dan memantau pesanannya sampai tiba**.

> **DEMO AKADEMIK, PEMBAYARAN TIDAK MEMPROSES UANG NYATA.**
> Seluruh produk, stok, akun demo, ongkir, dan status pesanan adalah simulasi.

## Stack

- Frontend: React 19 + Vite + React Router + Tailwind CSS 3 (JavaScript konsisten)
- State: Context API (Cart, Auth, Mode PVC, Theme)
- Backend: Vercel Functions (`api/`) — Node.js tanpa dependensi tambahan
- Lapisan data: Google Apps Script Web App (`apps-script/Code.gs`)
- Penyimpanan: Google Sheets (5 tab: Users, Products, Orders, OrderItems, Sessions)

Arsitektur wajib: **Browser → Vercel Functions → Apps Script → Sheets**.
Frontend tidak pernah memanggil Apps Script langsung.

## Struktur folder

```
src/pages        Home, Catalog, ProductDetail, Cart, Login, Register,
                 Checkout, OrderDetail, Orders, SizeGuide, NotFound
src/components   Navbar, Footer, ProductCard, SizeTable (+SizeGuideTable/Steps),
                 ProtectedRoute, CostSummary, ui.jsx (Button/Field/Modal/Stepper)
src/context      CartContext, AuthContext
src/api          client.js (satu-satunya pemanggil /api/*)
src/data         products.demo.js, sizeGuide.js, couriers.js
src/utils        format.js, validate.js
api              products, register, login, logout, me,
                 orders/index, orders/[id], _lib/gas.js
apps-script      Code.gs (ditempel ke editor Apps Script)
public/products  foto referensi gaya + SOURCES.md (sumber & lisensi)
public/campaigns foto kampanye beranda + SOURCES.md
public/img       placeholder SVG lama (hanya fallback bila gambar gagal muat)
```

## Syarat

- Node.js 18+ dan npm.

## Instalasi & jalan lokal

```bash
npm install
npm run dev      # buka http://localhost:5173
```

Mode default: `VITE_DATA_MODE=demo` (data lokal berlabel simulasi, tanpa backend).

## Build produksi

```bash
npm run build    # output ke dist/
npm run preview  # pratinjau hasil build
```

## Penyiapan Google Sheets

Ikuti **`PANDUAN-SPREADSHEET.md`** (nama sheet + header + 8 produk awal).
Ringkasan kolom:

- Users: `userId, name, email, passwordHash, createdAt`
- Products: `productId, name, category, description, price, imageUrl, stockS, stockM, stockL, stockXL, createdAt, updatedAt`
- Orders: `orderId, userId, recipientName, phone, address, courier, shippingCost, subtotal, total, paymentMethod, paymentStatus, orderStatus, createdAt, updatedAt`
- OrderItems: `orderItemId, orderId, productId, productNameSnapshot, size, quantity, unitPrice, subtotal`
- Sessions: `sessionId, userId, tokenHash, createdAt, expiresAt, revokedAt`

## Apps Script & env

1. Tempel `apps-script/Code.gs` ke editor Apps Script (lihat panduan).
2. Script Properties: `SHARED_SECRET` = string acak ≥ 32 karakter.
3. Deploy sebagai Web App (Execute as: Me, akses: Anyone), salin URL-nya.

   > Apps Script menjawab setiap request dengan **302** ke
   > `script.googleusercontent.com`. `api/_lib/gas.js` mengikuti redirect itu
   > secara **manual** (GET terpisah) — jangan diubah ke `redirect: 'follow'`,
   > karena fetch akan menurunkan POST menjadi GET sehingga `doPost` tidak
   > pernah terpanggil dan semua `/api/*` gagal.

4. `.env` lokal (untuk uji backend) / Environment Variables Vercel (Production):

```
APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
APPS_SCRIPT_SHARED_SECRET=<sama dengan Script Properties>
VITE_DATA_MODE=sheets
```

> Jangan pernah memberi prefix `VITE_` pada secret — variabel `VITE_*`
> ikut terbundel ke browser. Jangan commit secret ke repo.

## Deploy ke Vercel

1. Push project ke GitHub (repo sudah: `Abililham-Farabi/abibas-ecommerce`).
2. Vercel → New Project → import repo → framework otomatis (Vite);
   build `npm run build`, output `dist`.
3. Tambahkan 3 env (pilih **Production** dan **Preview**):
   `APPS_SCRIPT_URL`, `APPS_SCRIPT_SHARED_SECRET`, `VITE_DATA_MODE=sheets`.
   Nilainya **jangan** ber-prefix `VITE_` kecuali `VITE_DATA_MODE`.
4. Deploy. Frontend + `/api/*` ter-host dalam satu domain.
5. Uji: `https://<project>.vercel.app/api/products` harus balas JSON 8 produk;
   buka `/katalog` (produk dari Sheets, bukan data demo) → register → login →
   checkout → riwayat.

> `VITE_DATA_MODE` **dibundel saat build**. Mengubah/menambah env setelah deploy
> wajib diikuti **Redeploy**, jika tidak aplikasi tetap jalan di mode `demo`.

## Cara menguji

- **Registrasi/login**: `/register` (nama ≥ 2, email valid, password ≥ 8) →
  email duplikat harus 409 → `/login` salah password harus 401 → badge nama
  tampil → Keluar → sesi tercabut (refresh `/pesanan` redirect ke login).
- **Checkout & stok**: tambah produk ukuran tertentu → `/checkout` → total =
  subtotal + ongkir simulasi → buat pesanan → nomor order tampil → cek stok
  berkurang di Sheets tab Products.
- **Riwayat**: `/pesanan` hanya milik akun login; buka ID pesanan orang lain
  manual → harus 404, bukan bocor.
- **Mode Demo Lokal**: set `VITE_DATA_MODE=demo` → tanpa panggilan `/api/*`,
  akun & pesanan hanya di localStorage, tidak menyentuh Sheets. Tidak ada
  badge khusus mode; bedakan lewat env build / tab Network.

## Batasan keamanan & skala

Google Sheets + Apps Script untuk **demonstrasi akademik**: kuota baca/tulis
terbatas, konkurensi hanya dibantu `LockService` (bukan transaksi atomik penuh
dengan rollback), tanpa audit keamanan produksi. Jangan menyimpan data sensitif
nyata. Detail: `ASUMSI-KETERBATASAN.md`.

## Status fitur

- Selesai: seluruh halaman §5 dengan tampilan storefront (foto referensi gaya
  lokal, katalog 4 kolom + sorting + breadcrumb + drawer filter mobile,
  detail 2 kolom + modal ukuran + feedback tambah-keranjang, seksi kampanye
  sekunder, utility bar header, checkout 2 kolom),
  auth cookie HttpOnly + scrypt, validasi & hitung ulang backend, snapshot item,
  kepemilikan pesanan, tema terang editorial, responsif.
- Kontrol presentasi VPC (Mode PVC, Canvas VPC) **dihapus dari toko**; pemetaan
  VPC ↔ fitur tetap didokumentasikan di `ASUMSI-KETERBATASAN.md`.
- Belum teruji ke Sheet nyata (menunggu URL + env manual): baca/tulis end-to-end
  via GAS. Lihat `LAPORAN-PENGUJIAN.md` untuk status jujur per item.
