// Data produk DEMO — bukan stok nyata. Harga & spesifikasi simulasi.
// sizeType: 'apparel' (S–XL) | 'shoes' (39–44) | 'one' (satu ukuran, kunci 'ALL').
export const DEMO_PRODUCTS = [
  {
    productId: 'AB-R001',
    name: 'Sepatu Lari Daily Trainer',
    category: 'Sepatu lari',
    description:
      'Sepatu lari harian dengan busa responsif dan upper knit. Nyaman untuk 5–10 km di aspal.',
    price: 549000,
    imageUrl: '/products/ab-r001.jpg',
    sizeType: 'shoes',
    stock: { 39: 3, 40: 5, 41: 6, 42: 6, 43: 4, 44: 2 },
  },
  {
    productId: 'AB-R002',
    name: 'Sepatu Lari Tempo Ringan',
    category: 'Sepatu lari',
    description:
      'Sepatu ringan untuk sesi tempo dan interval. Drop 8 mm, outsole tipis agar kaki tetap dekat ke jalan.',
    price: 749000,
    imageUrl: '/products/ab-r002.jpg',
    sizeType: 'shoes',
    stock: { 39: 2, 40: 3, 41: 4, 42: 5, 43: 3, 44: 1 },
  },
  {
    productId: 'AB-R003',
    name: 'Sepatu Lari Trail',
    category: 'Sepatu lari',
    description:
      'Sepatu trail dengan outsole bergerigi untuk jalur berbatu dan tanah. Upper lebih tebal dengan toe cap.',
    price: 829000,
    imageUrl: '/products/ab-r003.jpg',
    sizeType: 'shoes',
    stock: { 39: 1, 40: 2, 41: 3, 42: 2, 43: 2, 44: 0 },
  },
  {
    productId: 'AB-B001',
    name: 'Kaos Lari Dry-Fit Hitam',
    category: 'Baju lari',
    description:
      'Kaos lari dry-fit yang cepat kering dengan potongan regular. Cocok untuk sesi pagi dan lari santai.',
    price: 179000,
    imageUrl: '/products/ab-b001.jpg',
    sizeType: 'apparel',
    stock: { S: 6, M: 9, L: 8, XL: 5 },
  },
  {
    productId: 'AB-B002',
    name: 'Singlet Lari Mesh',
    category: 'Baju lari',
    description:
      'Singlet mesh dengan panel ventilasi di punggung. Ringan dan tidak lengket saat berkeringat.',
    price: 159000,
    imageUrl: '/products/ab-b002.jpg',
    sizeType: 'apparel',
    stock: { S: 4, M: 6, L: 7, XL: 3 },
  },
  {
    productId: 'AB-C001',
    name: 'Celana Lari 5" Hitam',
    category: 'Celana lari',
    description:
      'Celana lari 5 inci dengan liner dan saku belakang berzip untuk kunci. Tidak mengganggu ayunan kaki.',
    price: 199000,
    imageUrl: '/products/ab-c001.jpg',
    sizeType: 'apparel',
    stock: { S: 5, M: 8, L: 7, XL: 4 },
  },
  {
    productId: 'AB-C002',
    name: 'Tights Lari Panjang',
    category: 'Celana lari',
    description:
      'Tights panjang dengan kompresi ringan. Ada saku paha untuk ponsel dan gel.',
    price: 249000,
    imageUrl: '/products/ab-c002.jpg',
    sizeType: 'apparel',
    stock: { S: 3, M: 5, L: 6, XL: 2 },
  },
  {
    productId: 'AB-G001',
    name: 'Energy Gel Jeruk 30 g',
    category: 'Gel',
    description:
      'Gel energi 30 g dengan 22 g karbohidrat, rasa jeruk. Dimakan 15–20 menit sebelum atau saat lari jauh.',
    price: 25000,
    imageUrl: '/products/ab-g001.svg',
    sizeType: 'one',
    stock: { ALL: 40 },
  },
  {
    productId: 'AB-G002',
    name: 'Energy Gel Kopi 30 g',
    category: 'Gel',
    description:
      'Gel energi rasa kopi dengan kafein 40 mg per sachet. Untuk sesi panjang atau lari pagi.',
    price: 25000,
    imageUrl: '/products/ab-g002.svg',
    sizeType: 'one',
    stock: { ALL: 35 },
  },
  {
    productId: 'AB-W001',
    name: 'Botol Lari 500 ml',
    category: 'Botol',
    description:
      'Botol lari 500 ml dengan tutup bite valve dan pegangan tangan. Muat di sabuk lari.',
    price: 89000,
    imageUrl: '/products/ab-w001.jpg',
    sizeType: 'one',
    stock: { ALL: 12 },
  },
];

export const CATEGORIES = ['Sepatu lari', 'Baju lari', 'Celana lari', 'Gel', 'Botol'];
