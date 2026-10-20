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
productId | name | category | description | price | imageUrl | sizeType | stockS | stockM | stockL | stockXL | stock39 | stock40 | stock41 | stock42 | stock43 | stock44 | stockOne | createdAt | updatedAt
```

**Tab `Orders`:**

```
orderId | userId | recipientName | phone | address | courier | shippingCost | subtotal | total | paymentMethod | paymentStatus | orderStatus | createdAt | updatedAt | paidAt | packedAt | shippedAt | doneAt
```

> 4 kolom terakhir (`paidAt`…`doneAt`) dipakai fitur **Lacak pesanan** untuk
> menyimpan waktu tiap tahap. Boleh dikosongkan/dihilangkan: tahapan tetap
> berjalan, hanya riwayat waktunya yang tidak tampil (bukan error).

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
| `stockS…stockXL, stock39…stock44, stockOne, quantity` | **Number**, 0 desimal |
| `sizeType` (tab `Products`) | Plain text: `apparel`, `shoes`, atau `one` |
| `createdAt, updatedAt, expiresAt, revokedAt` | **Plain text** (diisi string ISO oleh sistem, mis. `2026-10-15T00:00:00.000Z`) |
| `paidAt, packedAt, shippedAt, doneAt` (tab `Orders`) | **Plain text** (opsional; cap waktu tahap lacak pesanan, diisi `Code.gs`) |
| `phone` (tab `Orders`) | Disarankan **Plain text**; `Code.gs` juga sudah memaksa sel ini berformat teks saat checkout, sehingga `0`/`+` di depan tetap utuh apa pun format kolomnya. (Mengubah format kolom saja tidak cukup — nilai tetap diparse Sheets sebagai angka.) |
| `email` | Plain text (keunikan dicek backend setelah lowercase+trim, bukan oleh Sheets) |

## 4. Data awal

- `Users`, `Orders`, `OrderItems`, `Sessions`: **kosongkan** (hanya header). Diisi otomatis saat register/login/checkout.
- `Products`: isi 10 baris demo di bawah. **Cara termudah:** buka
  `data/products.xlsx` di Excel/Numbers, blok `A1:T11`, copy, lalu tempel di
  sel `A1` tab `Products` (menimpa header lama). Sheets otomatis memecah per
  kolom. Blok di bawah adalah alternatif (copy dari file, bukan dari chat):
  tempel juga mulai `A1` karena header ikut di dalam blok — jangan mulai `A2`,
  dan jangan pakai "Paste special → values only".

```
productId	name	category	description	price	imageUrl	sizeType	stockS	stockM	stockL	stockXL	stock39	stock40	stock41	stock42	stock43	stock44	stockOne	createdAt	updatedAt
AB-R001	Sepatu Lari Daily Trainer	Sepatu lari	Sepatu lari harian dengan busa responsif dan upper knit. Nyaman untuk 5–10 km di aspal.	549000	/products/ab-r001.jpg	shoes					3	5	6	6	4	2			
AB-R002	Sepatu Lari Tempo Ringan	Sepatu lari	Sepatu ringan untuk sesi tempo dan interval. Drop 8 mm, outsole tipis agar kaki tetap dekat ke jalan.	749000	/products/ab-r002.jpg	shoes					2	3	4	5	3	1			
AB-R003	Sepatu Lari Trail	Sepatu lari	Sepatu trail dengan outsole bergerigi untuk jalur berbatu dan tanah. Upper lebih tebal dengan toe cap.	829000	/products/ab-r003.jpg	shoes					1	2	3	2	2	0			
AB-B001	Kaos Lari Dry-Fit Hitam	Baju lari	Kaos lari dry-fit yang cepat kering dengan potongan regular. Cocok untuk sesi pagi dan lari santai.	179000	/products/ab-b001.jpg	apparel	6	9	8	5									
AB-B002	Singlet Lari Mesh	Baju lari	Singlet mesh dengan panel ventilasi di punggung. Ringan dan tidak lengket saat berkeringat.	159000	/products/ab-b002.jpg	apparel	4	6	7	3									
AB-C001	Celana Lari 5" Hitam	Celana lari	Celana lari 5 inci dengan liner dan saku belakang berzip untuk kunci. Tidak mengganggu ayunan kaki.	199000	/products/ab-c001.jpg	apparel	5	8	7	4									
AB-C002	Tights Lari Panjang	Celana lari	Tights panjang dengan kompresi ringan. Ada saku paha untuk ponsel dan gel.	249000	/products/ab-c002.jpg	apparel	3	5	6	2									
AB-G001	Energy Gel Jeruk 30 g	Gel	Gel energi 30 g dengan 22 g karbohidrat, rasa jeruk. Dimakan 15–20 menit sebelum atau saat lari jauh.	25000	/products/ab-g001.svg	one											40		
AB-G002	Energy Gel Kopi 30 g	Gel	Gel energi rasa kopi dengan kafein 40 mg per sachet. Untuk sesi panjang atau lari pagi.	25000	/products/ab-g002.svg	one											35		
AB-W001	Botol Lari 500 ml	Botol	Botol lari 500 ml dengan tutup bite valve dan pegangan tangan. Muat di sabuk lari.	89000	/products/ab-w001.jpg	one											12		
```

- `sizeType` menentukan kolom stok mana yang dipakai:

  | `sizeType` | Ukuran yang dijual | Kolom stok terisi |
  |---|---|---|
  | `shoes` | 39–44 | `stock39` … `stock44` |
  | `apparel` | S, M, L, XL | `stockS` … `stockXL` |
  | `one` | satu ukuran (gel, botol) | `stockOne` (dibaca sistem sebagai ukuran `ALL`) |

  Kolom stok yang tidak dipakai **biarkan kosong** — jangan diisi `0`, agar
  tidak bingung saat mengecek stok.
- `description`: tulis singkat + kegunaan, contoh:
  `Sepatu lari harian dengan busa responsif. Nyaman untuk 5–10 km di aspal.`
- `imageUrl`: `/products/ab-r001.jpg` … `/products/ab-w001.jpg`; gel memakai
  placeholder SVG `/products/ab-g001.svg` sampai foto asli tersedia (lihat
  `public/products/SOURCES.md`).
- `createdAt/updatedAt`: **boleh kosong**. Sistem mengisi `updatedAt` sendiri
  saat stok produk berubah.

### 4b. Kalau spreadsheet sudah berisi data versi lama (pakaian kasual)

Tab `Products` versi lama hanya punya `stockS…stockXL` dan 8 baris kaos/kemeja/
hoodie. Dua cara, pilih salah satu:

**A. Mulai bersih (disarankan untuk demo).**
1. Buka `data/products.xlsx` → blok `A1:T11` → copy.
2. Di tab `Products`, klik sel `A1` → tempel. Header lama (12 kolom) dan
   8 baris lama tertimpa; sheet baru 11 baris jadi tidak ada sisa baris
   di bawahnya.
3. Cek: header baris 1 = 20 kolom sesuai §2, baris 2–11 = 10 produk lari.

**B. Pertahankan baris lama.**
1. Sisipkan **1 kolom** setelah `imageUrl` → beri nama `sizeType`.
2. Sisipkan **7 kolom** sebelum `createdAt` → beri nama `stock39`, `stock40`,
   `stock41`, `stock42`, `stock43`, `stock44`, `stockOne`.
3. Isi `sizeType` baris lama dengan `apparel` (kolom stoknya sudah terisi).
4. Tambahkan 10 baris produk lari dari `data/products.xlsx` di bawah baris lama.

> Pesanan lama di `Orders`/`OrderItems` **tidak perlu diubah**: nama & harga
> produk disimpan sebagai snapshot saat checkout, jadi riwayat tetap terbaca
> walau produknya sudah tidak dijual.

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
- [ ] Kategori hanya: `Sepatu lari`, `Baju lari`, `Celana lari`, `Gel`, `Botol`.
- [ ] `sizeType` hanya `shoes`, `apparel`, atau `one`.
- [ ] 4 tab selain Products hanya header.
