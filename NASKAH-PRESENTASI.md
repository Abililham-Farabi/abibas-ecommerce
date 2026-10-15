# Naskah Presentasi VPC Abibas (±7 menit)

> **Catatan redesign:** kontrol Mode PVC sudah dihapus dari antarmuka toko agar
> tampil seperti e-commerce sungguhan. Pemetaan VPC ↔ fitur tetap ada di
> `ASUMSI-KETERBATASAN.md` — tunjukkan langsung fiturnya saat presentasi.

## 1. Beranda — proposisi nilai & pintu masuk
- **Kebutuhan:** functional job (menemukan baju yang cocok) + Gain 3 (desain eksklusif).
- **Fitur:** pesan utama brand + produk pilihan + CTA ke katalog.
- **Kalimat:** "Beranda langsung menjelaskan apa itu Abibas dan mengarahkan pengunjung ke produk."
- **Batasan:** tidak ada klaim terlaris/termurah — hanya contoh kategori + harga PDF.

## 2. Katalog — menemukan produk
- **Kebutuhan:** Gain 4 (belanja singkat dan mudah).
- **Fitur (Creator 2):** pencarian + filter kategori + filter ukuran tersedia, indikator stok.
- **Kalimat:** "Pelanggan menemukan baju yang cocok tanpa harus mencari satu per satu."
- **Demo:** ketik "hoodie", filter ukuran M — tunjukkan produk AB-T003 ukuran S tidak muncul (stok 0).

## 3. Detail produk — menjawab keraguan terbesar
- **Kebutuhan:** Pain 1 (salah ukuran), Pain 2 (foto tak sesuai), Pain 3 (tukar membingungkan).
- **Fitur (Reliever 1, 2, 3):** pilihan S/M/L/XL + stok per ukuran, tabel cm + cara mengukur, deskripsi bahan + tinggi model, kebijakan tukar tertulis.
- **Kalimat:** "Di sini masalah terbesar pelanggan — salah ukuran — kami jawab dengan tabel ukuran dan stok per ukuran."
- **Batasan:** nilai cm ilustratif (contoh), gambar ilustrasi demo bukan foto aktual.

## 4. Keranjang — cek ulang
- **Kebutuhan:** Pain 4 (total biaya tak jelas).
- **Fitur (Reliever 4):** rincian item + ukuran + jumlah + subtotal, tersimpan di localStorage setelah refresh.
- **Kalimat:** "Pelanggan bisa memeriksa ulang ukuran dan jumlah sebelum lanjut."
- **Batasan:** localStorage bukan sumber kebenaran stok — validasi final di backend.

## 5. Daftar & login — akun tercatat
- **Kebutuhan:** Gain 4 (checkout singkat, alamat tersimpan) + dasar Creator 4.
- **Fitur (Creator 3):** email unik, validasi, sesi cookie HttpOnly, redirect kembali ke tujuan (`/login?next=/checkout`).
- **Kalimat:** "Akun membuat checkout lebih cepat dan membuat pesanan tercatat atas nama pelanggan."
- **Batasan:** password di-hash scrypt di backend; demo lokal hanya simulasi browser.

## 6. Checkout — total jelas, bayar simulasi
- **Kebutuhan:** Pain 4 + Gain 2 (harga & total jelas), Pain 3 (syarat tukar).
- **Fitur (Reliever 3, 4):** subtotal + ongkir simulasi + total, 3 metode simulasi, alamat, kebijakan tukar, checkbox konfirmasi.
- **Kalimat:** "Total biaya tampil sebelum membayar, jadi tidak ada kejutan. Pembayaran di demo ini simulasi."
- **Batasan:** tegaskan banner DEMO AKADEMIK; backend menghitung ulang total, harga browser diabaikan.

## 7. Konfirmasi — kepastian tercatat
- **Kebutuhan:** emotional job (yakin, tidak takut kecewa).
- **Fitur:** nomor pesanan + rincian + total + status, hanya tampil setelah backend 200.
- **Kalimat:** "Pelanggan langsung mendapat kepastian bahwa pesanannya tercatat."
- **Batasan:** jika simpan gagal, halaman sukses TIDAK tampil — tampil pesan error jujur.

## 8. Riwayat pesanan — pantau mandiri
- **Kebutuhan:** Pain 5 (tak tahu status) + Gain 5 (mudah dipantau).
- **Fitur (Reliever 5 + Creator 4):** nomor, tanggal, item, total, status tiap tahap; hanya milik sendiri (uji buka ID orang lain → 404).
- **Kalimat:** "Pelanggan tidak perlu bertanya, statusnya selalu bisa dilihat."
- **Batasan:** status simulasi, bukan pelacakan kurir nyata.

## 9. Mode PVC — penutup
- Buka halaman **Canvas VPC** (`/pvc`): tunjukkan segmen, 5 pains, 5 gains, 5 relievers, 4 creators, dan tabel fit.
- Ingatkan: Customer Profile adalah **hipotesis awal yang perlu validasi**, dan satu fitur tidak menyelesaikan seluruh pain.
- Tutup: "Setiap fitur website dapat ditelusuri ke satu elemen kanvas."
