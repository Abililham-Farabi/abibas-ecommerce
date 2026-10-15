const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister({ name, email, password }) {
  const errors = {};
  if (!name || name.trim().length < 2) errors.name = 'Nama minimal 2 karakter.';
  if (!email || !EMAIL_RE.test(email.trim())) errors.email = 'Masukkan email yang valid.';
  if (!password || password.length < 8)
    errors.password = 'Kata sandi minimal 8 karakter.';
  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email || !EMAIL_RE.test(email.trim())) errors.email = 'Masukkan email yang valid.';
  if (!password) errors.password = 'Masukkan kata sandi.';
  return errors;
}

export function validateCheckout({ recipientName, phone, address, courier, paymentMethod }) {
  const errors = {};
  if (!recipientName || recipientName.trim().length < 3)
    errors.recipientName = 'Nama penerima minimal 3 karakter.';
  if (!phone || !/^[0-9+\-\s]{9,16}$/.test(phone.trim()))
    errors.phone = 'Nomor HP 9–16 digit angka.';
  if (!address || address.trim().length < 10)
    errors.address = 'Alamat minimal 10 karakter (jalan, kota, kode pos).';
  if (!courier) errors.courier = 'Pilih kurir.';
  if (!paymentMethod) errors.paymentMethod = 'Pilih metode pembayaran.';
  return errors;
}
