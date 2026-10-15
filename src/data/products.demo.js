// Data produk DEMO — bukan stok nyata. Harga dikunci sesuai PDF VPC:
// Kaos oversize Rp129.000 | Kemeja kasual Rp189.000 | Hoodie Rp249.000
export const DEMO_PRODUCTS = [
  {
    productId: 'AB-T001',
    name: 'Kaos Oversize Hitam Essential',
    category: 'Kaos oversize',
    description:
      'Kaos oversize katun combed 24s, potongan longgar, jahitan rantai. Model 175 cm memakai ukuran M.',
    price: 129000,
    imageUrl: '/products/ab-t001.jpg',
    stockS: 10,
    stockM: 12,
    stockL: 8,
    stockXL: 5,
  },
  {
    productId: 'AB-T002',
    name: 'Kaos Oversize Putih Essential',
    category: 'Kaos oversize',
    description:
      'Kaos oversize katun combed 24s warna putih tulang, tidak menerawang. Model 175 cm memakai ukuran M.',
    price: 129000,
    imageUrl: '/products/ab-t002.jpg',
    stockS: 8,
    stockM: 10,
    stockL: 10,
    stockXL: 6,
  },
  {
    productId: 'AB-T003',
    name: 'Kaos Oversize Sage Lapang',
    category: 'Kaos oversize',
    description:
      'Kaos oversize warna sage dengan sablon dada kecil Abibas. Model 178 cm memakai ukuran L.',
    price: 129000,
    imageUrl: '/products/ab-t003.jpg',
    stockS: 0,
    stockM: 7,
    stockL: 9,
    stockXL: 4,
  },
  {
    productId: 'AB-K001',
    name: 'Kemeja Kasual Linen Cream',
    category: 'Kemeja kasual',
    description:
      'Kemeja kasual campuran linen, adem untuk kampus. Potongan regular. Model 175 cm memakai ukuran M.',
    price: 189000,
    imageUrl: '/products/ab-k001.jpg',
    stockS: 6,
    stockM: 8,
    stockL: 8,
    stockXL: 3,
  },
  {
    productId: 'AB-K002',
    name: 'Kemeja Kasual Oxford Navy',
    category: 'Kemeja kasual',
    description:
      'Kemeja oxford navy lengan panjang yang bisa digulung. Model 178 cm memakai ukuran L.',
    price: 189000,
    imageUrl: '/products/ab-k002.jpg',
    stockS: 5,
    stockM: 6,
    stockL: 7,
    stockXL: 2,
  },
  {
    productId: 'AB-K003',
    name: 'Kemeja Kasual Flanel Cokelat',
    category: 'Kemeja kasual',
    description:
      'Kemeja flanel cokelat kotak halus, bahan menyerap keringat. Model 175 cm memakai ukuran M.',
    price: 189000,
    imageUrl: '/products/ab-k003.jpg',
    stockS: 4,
    stockM: 5,
    stockL: 0,
    stockXL: 3,
  },
  {
    productId: 'AB-H001',
    name: 'Hoodie Fleece Abu Muda',
    category: 'Hoodie',
    description:
      'Hoodie fleece 330gsm dengan saku kanguru dan tali pipih. Model 178 cm memakai ukuran L.',
    price: 249000,
    imageUrl: '/products/ab-h001.jpg',
    stockS: 7,
    stockM: 9,
    stockL: 6,
    stockXL: 4,
  },
  {
    productId: 'AB-H002',
    name: 'Hoodie Fleece Hitam Pekat',
    category: 'Hoodie',
    description:
      'Hoodie fleece hitam pekat, bagian dalam lembut. Model 175 cm memakai ukuran M.',
    price: 249000,
    imageUrl: '/products/ab-h002.jpg',
    stockS: 6,
    stockM: 8,
    stockL: 5,
    stockXL: 5,
  },
];

export const CATEGORIES = ['Kaos oversize', 'Kemeja kasual', 'Hoodie'];
export const SIZES = ['S', 'M', 'L', 'XL'];

export function stockOf(product, size) {
  if (!product) return 0;
  return Number(product[`stock${size}`] ?? 0);
}
