# Asumsi & Keterbatasan — Abibas

## Asumsi yang dipakai (ditandai eksplisit)

1. **Produk & stok demo.** 11 produk dan semua stok adalah data demonstrasi,
   struktur disamakan antara `src/data/products.demo.js`, `Code.gs`, dan Sheets.
2. **Kebijakan penukaran demo.** Isi mengikuti PDF (gratis 1× / 7 hari / label
   utuh); memerlukan konfirmasi pemilik sebelum dipakai komersial.
3. **Ongkir simulasi.** Reguler 15rb, Ekspres 28rb, Hemat 10rb — bukan API kurir.
4. **Pembayaran simulasi.** Transfer/QRIS/e-wallet tidak memproses uang nyata.
5. **Gambar ilustrasi.** Foto Unsplash + placeholder SVG berlabel demo, bukan
   foto produk aktual.
6. **Spesifikasi lari = ilustrasi.** Spesifikasi sepatu (busa, drop 8 mm,
   outsole), bahan pakaian, dan kadar karbohidrat/kafein gel adalah **angka
   demo**, bukan hasil uji laboratorium atau data pemasok. Acuan ukuran sepatu
   (`39≈24,5 cm` … `44≈27 cm`) adalah perkiraan panjang kaki, bukan ukuran insole
   resmi — tiap merek bisa berbeda.
7. **Foto referensi gaya.** Foto produk diambil dari Unsplash dan sebagian
   menampilkan merek lain (Nike, Adidas, Garmin). Tidak ada klaim afiliasi; lihat
   `public/products/SOURCES.md`.
8. **Customer Profile = hipotesis.** Segmen & prioritas pain/gain adalah penilaian
   pemilik brand di PDF, bukan hasil survei — belum tervalidasi.

> **Halaman Panduan ukuran dihapus** (19 Okt 2026) karena tabelnya ilustratif.
> Untuk sepatu, acuan panjang kaki kini hanya satu baris di bawah pemilih
> ukuran (lihat asumsi #6). URL lama `/panduan-ukuran` dialihkan ke `/katalog`.

## Keterbatasan teknis

- **Integrasi Sheets belum terverifikasi end-to-end** (menunggu URL Apps Script
  + Sheet nyata + env). Frontend Mode Demo Lokal terbukti jalan; Mode Sheets
  menunggu konfigurasi manual (lihat LAPORAN-PENGUJIAN.md).
- **Sheets bukan database relasional.** Tidak ada transaksi atomik penuh dengan
  rollback; `LockService` mengurangi race stok terakhir, tetapi kegagalan tulis
  parsial hanya ditandai `perlu_audit` untuk pemeriksaan manual.
- **Kuota Apps Script/Sheets terbatas** (baca/tulis per hari, 30 dtk eksekusi) —
  cocok untuk demo kelas, bukan produksi.
- **Hashing dua sisi didokumentasikan:** Vercel memakai `scrypt` Node.js;
  Apps Script hanya menyimpan `passwordHash` dan memverifikasi sesi via
  `tokenHash` SHA-256. Password mentah tidak pernah disimpan/dilog.
- **Nama "Abibas" & visual orisinal** untuk akademik; tidak ada klaim aman hukum
  dan tidak meniru identitas merek lain.

## Pemetaan fitur → VPC (ringkas)

| Tahap | Kebutuhan | Elemen VPC | Fitur UI | Status |
|---|---|---|---|---|
| Beranda | Functional job, Gain 3 | Products & Services | Hero + produk pilihan + CTA | Selesai (demo) |
| Katalog | Gain 4 | Creator 2 | Search + filter kategori/ukuran | Selesai (demo) |
| Detail produk | Pain 1, 2, 3 | Reliever 1, 2, 3 | Ukuran+stok per keluarga (sepatu/baju/satu ukuran), acuan cm sepatu, kebijakan | Selesai (demo) |
| Keranjang | Pain 4 | Reliever 4 | Rincian + subtotal | Selesai (demo) |
| Daftar/login | Gain 4 | Creator 3 | Auth + sesi + redirect next | Selesai (demo); Sheets menunggu verifikasi |
| Checkout | Pain 3, 4; Gain 2 | Reliever 3, 4 | Total + ongkir + bayar simulasi | Selesai (demo); Sheets menunggu verifikasi |
| Konfirmasi | Emotional job | Reliever 5 | Nomor + rincian (setelah 200 OK) | Selesai (demo) |
| Riwayat | Pain 5; Gain 5 | Reliever 5; Creator 4 | Status tiap tahap, milik sendiri | Selesai (demo); Sheets menunggu verifikasi |
