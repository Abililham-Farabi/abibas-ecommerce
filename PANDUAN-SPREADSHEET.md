# Panduan Pembuatan Google Sheets — Abibas

Panduan praktik langkah demi langkah agar tidak salah kolom. Ikuti urutan persis;
nama sheet dan header **case-sensitive** (dibaca oleh `apps-script/Code.gs`).

## 1. Buat spreadsheet

1. Buka `sheets.google.com` → **Blank spreadsheet**.
2. Rename file menjadi `Abibas DB (Demo)`.
3. Hapus `Sheet1` bawaan, buat 5 tab baru dengan nama persis:
   `Users`, `Products`, `Orders`, `OrderItems`, `Sessions`.

## 2. Isi header baris 1 (copy-paste per tab)

**Tab `Users`:**

```
userId | name | email | passwordHash | createdAt
```

**Tab `Products`:**

```
productId | name | category | description | price | imageUrl | stockS | stockM | stockL | stockXL | createdAt | updatedAt
```

**Tab `Orders`:**

```
orderId | userId | recipientName | phone | address | courier | shippingCost | subtotal | total | paymentMethod | paymentStatus | orderStatus | createdAt | updatedAt
```

**Tab `OrderItems`:**

```
orderItemId | orderId | productId | productNameSnapshot | size | quantity | unitPrice | subtotal
```

**Tab `Sessions`:**

```
sessionId | userId | tokenHash | createdAt | expiresAt | revokedAt
```

Setelah header terisi: blok baris 1 → **View → Freeze → 1 row**, lalu bold.

## 3. Format kolom

| Kolom | Format |
|---|---|
| `price, shippingCost, subtotal, total, unitPrice` | **Format → Number → Number** (angka murni, mis. `129000`, tanpa `Rp`/titik) |
| `stockS/M/L/XL, quantity` | **Number**, 0 desimal |
| `createdAt, updatedAt, expiresAt, revokedAt` | **Plain text** (diisi string ISO oleh sistem, mis. `2026-10-15T00:00:00.000Z`) |
| `phone` (tab `Orders`) | Disarankan **Plain text**; `Code.gs` juga sudah memaksa sel ini berformat teks saat checkout, sehingga `0`/`+` di depan tetap utuh apa pun format kolomnya. (Mengubah format kolom saja tidak cukup — nilai tetap diparse Sheets sebagai angka.) |
| `email` | Plain text (keunikan dicek backend setelah lowercase+trim, bukan oleh Sheets) |

## 4. Data awal

- `Users`, `Orders`, `OrderItems`, `Sessions`: **kosongkan** (hanya header). Diisi otomatis saat register/login/checkout.
- `Products`: isi 8 baris demo (harga dikunci sesuai PDF VPC):

| productId | name | category | price | stockS | stockM | stockL | stockXL |
|---|---|---:|---|---|---|---|---|
| AB-T001 | Kaos Oversize Hitam Essential | Kaos oversize | 129000 | 10 | 12 | 8 | 5 |
| AB-T002 | Kaos Oversize Putih Essential | Kaos oversize | 129000 | 8 | 10 | 10 | 6 |
| AB-T003 | Kaos Oversize Sage Lapang | Kaos oversize | 129000 | 0 | 7 | 9 | 4 |
| AB-K001 | Kemeja Kasual Linen Cream | Kemeja kasual | 189000 | 6 | 8 | 8 | 3 |
| AB-K002 | Kemeja Kasual Oxford Navy | Kemeja kasual | 189000 | 5 | 6 | 7 | 2 |
| AB-K003 | Kemeja Kasual Flanel Cokelat | Kemeja kasual | 189000 | 4 | 5 | 0 | 3 |
| AB-H001 | Hoodie Fleece Abu Muda | Hoodie | 249000 | 7 | 9 | 6 | 4 |
| AB-H002 | Hoodie Fleece Hitam Pekat | Hoodie | 249000 | 6 | 8 | 5 | 5 |

- `description`: tulis singkat + bahan + tinggi model, contoh:
  `Kaos oversize katun combed 24s. Model 175 cm memakai ukuran M.`
- `imageUrl`: `/products/ab-t001.jpg` … `/products/ab-h002.jpg` (foto referensi lokal, lihat `public/products/SOURCES.md`).
- `createdAt/updatedAt`: tanggal hari ini format ISO.

## 5. Pengaman ringan

1. Blok header tiap tab → **Data → Protect range** (hanya kamu yang bisa edit header).
2. **Jangan** share ke "Anyone with link". Apps Script berjalan sebagai akunmu
   (`Execute as: Me`), jadi tidak perlu dibuka publik.

## 6. Lanjut ke Apps Script

1. **Extensions → Apps Script** → hapus isi editor → tempel seluruh
   `apps-script/Code.gs` → Save.
2. Ikon roda gigi (**Project Settings**) → **Script Properties** → tambah:
   `SHARED_SECRET` = string acak ≥ 32 karakter (sama dengan env Vercel
   `APPS_SCRIPT_SHARED_SECRET`).
3. **Deploy → New deployment → Web app** → Execute as: **Me** →
   Who has access: **Anyone** → Deploy → salin URL ke
   `APPS_SCRIPT_URL` di Vercel (dan `.env` lokal bila menguji backend lokal).
4. Setiap mengubah kode: **Deploy → Manage deployments → Edit → New version**.

## 7. Cek akhir

- [ ] 5 tab, nama persis.
- [ ] Header baris 1 persis, tanpa spasi tambahan.
- [ ] Harga/stok angka murni.
- [ ] Kategori hanya: `Kaos oversize`, `Kemeja kasual`, `Hoodie`.
- [ ] 4 tab selain Products hanya header.
