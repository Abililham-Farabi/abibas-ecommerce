/**
 * ABIBAS — Google Apps Script Web App
 * Lapisan akses data: Vercel Functions -> Apps Script ini -> Google Sheets.
 *
 * CARA PAKAI:
 * 1. Buat spreadsheet sesuai PANDUAN-SPREADSHEET.md (5 tab: Users, Products,
 *    Orders, OrderItems, Sessions — header baris 1 persis).
 * 2. Di spreadsheet: Extensions -> Apps Script -> hapus Code.gs bawaan ->
 *    tempel seluruh file ini -> Save.
 * 3. Project Settings (ikon roda gigi) -> Script Properties -> tambah:
 *      SHARED_SECRET = <string acak min 32 karakter, sama dengan env Vercel>
 * 4. Deploy -> New deployment -> type Web app ->
 *    Execute as: Me, Who has access: Anyone (agar Vercel bisa memanggil) ->
 *    Deploy -> salin Web app URL ke env Vercel APPS_SCRIPT_URL.
 * 5. Setiap ubah kode: Deploy -> Manage deployments -> Edit -> New version.
 *
 * KEAMANAN: secret dicek tiap request. Password TIDAK di-hash di sini —
 * hashing scrypt dilakukan di Vercel; kolom passwordHash hanya penyimpanan.
 * Sesi: yang disimpan hanya tokenHash (SHA-256 hex dari token mentah).
 */

var SHEETS = {
  Users: 'Users',
  Products: 'Products',
  Orders: 'Orders',
  OrderItems: 'OrderItems',
  Sessions: 'Sessions',
};

var COURIER_COST = { reguler: 15000, ekspres: 28000, hemat: 10000 };
var PAYMENTS = ['transfer', 'qris', 'ewallet'];
var SIZES = ['S', 'M', 'L', 'XL'];

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var expected = PropertiesService.getScriptProperties().getProperty('SHARED_SECRET') || '';
    if (!expected || body.secret !== expected) {
      return json({ ok: false, error: 'Akses ditolak.', status: 403 }, 403);
    }
    var action = String(body.action || '');
    var p = body.payload || {};
    var data = route(action, p);
    return json({ ok: true, data: data }, 200);
  } catch (err) {
    var status = (err && err.status) || 500;
    var msg = status >= 500 ? 'Terjadi kesalahan database.' : String((err && err.message) || err);
    return json({ ok: false, error: msg, status: status }, status);
  }
}

function fail(message, status) {
  var e = new Error(message);
  e.status = status || 400;
  throw e;
}

function json(obj, status) {
  var out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

/* ---------- util sheet ---------- */

function sheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if (!sh) fail('Sheet tidak ditemukan: ' + name, 500);
  return sh;
}

function rows(name) {
  var sh = sheet(name);
  var values = sh.getDataRange().getValues();
  if (values.length < 2) return { sh: sh, header: values[0] || [], data: [] };
  return { sh: sh, header: values[0], data: values.slice(1) };
}

function toObj(header, row) {
  var o = {};
  for (var i = 0; i < header.length; i++) o[String(header[i])] = row[i];
  return o;
}

function normEmail(email) {
  return String(email || '').trim().toLowerCase();
}

/* ---------- router ---------- */

function route(action, p) {
  switch (action) {
    case 'ping':
      return { now: new Date().toISOString() };
    case 'getUserByEmail':
      return { user: findUserByEmail(p.email) };
    case 'getUserById':
      return { user: findUserById(p.userId) };
    case 'createUser':
      return { user: createUser(p) };
    case 'getProducts':
      return { products: getProducts() };
    case 'createSession':
      return { session: createSession(p) };
    case 'getSession':
      return getSessionWithUser(p.tokenHash);
    case 'revokeSession':
      return { revoked: revokeSession(p.tokenHash) };
    case 'getOrdersByUser':
      return { orders: getOrdersByUser(p.userId) };
    case 'getOrderWithItems':
      return { order: getOrderWithItems(p.orderId, p.userId) };
    case 'createOrderAtomic':
      return { order: createOrderAtomic(p) };
    default:
      fail('Aksi tidak dikenal: ' + action, 400);
  }
}

/* ---------- users & sessions ---------- */

function findUserByEmail(email) {
  var r = rows(SHEETS.Users);
  var want = normEmail(email);
  for (var i = 0; i < r.data.length; i++) {
    var o = toObj(r.header, r.data[i]);
    if (normEmail(o.email) === want && want) {
      return { userId: o.userId, name: o.name, email: normEmail(o.email), passwordHash: o.passwordHash };
    }
  }
  return null;
}

function findUserById(userId) {
  var r = rows(SHEETS.Users);
  for (var i = 0; i < r.data.length; i++) {
    var o = toObj(r.header, r.data[i]);
    if (String(o.userId) === String(userId)) {
      return { userId: o.userId, name: o.name, email: normEmail(o.email) };
    }
  }
  return null;
}

function findUserRowWithHash(userId) {
  var r = rows(SHEETS.Users);
  for (var i = 0; i < r.data.length; i++) {
    var o = toObj(r.header, r.data[i]);
    if (String(o.userId) === String(userId)) return o;
  }
  return null;
}

function createUser(p) {
  if (!p.userId || !p.name || !normEmail(p.email) || !p.passwordHash) fail('Data pengguna tidak lengkap.', 400);
  if (findUserByEmail(p.email)) fail('Email sudah terdaftar.', 409);
  sheet(SHEETS.Users).appendRow([p.userId, String(p.name).trim(), normEmail(p.email), p.passwordHash, p.createdAt || new Date().toISOString()]);
  return { userId: p.userId, name: String(p.name).trim(), email: normEmail(p.email) };
}

function createSession(p) {
  if (!p.sessionId || !p.userId || !p.tokenHash || !p.expiresAt) fail('Data sesi tidak lengkap.', 400);
  sheet(SHEETS.Sessions).appendRow([p.sessionId, p.userId, p.tokenHash, p.createdAt || new Date().toISOString(), p.expiresAt, '']);
  return { sessionId: p.sessionId };
}

function getSessionWithUser(tokenHash) {
  if (!tokenHash) return { session: null, user: null };
  var r = rows(SHEETS.Sessions);
  var now = new Date();
  for (var i = 0; i < r.data.length; i++) {
    var o = toObj(r.header, r.data[i]);
    if (String(o.tokenHash) === String(tokenHash)) {
      if (o.revokedAt) return { session: null, user: null };
      if (o.expiresAt && new Date(o.expiresAt) < now) return { session: null, user: null };
      var u = findUserRowWithHash(o.userId);
      if (!u) return { session: null, user: null };
      return {
        session: { sessionId: o.sessionId, userId: o.userId, expiresAt: o.expiresAt },
        user: { userId: u.userId, name: u.name, email: normEmail(u.email) },
      };
    }
  }
  return { session: null, user: null };
}

function revokeSession(tokenHash) {
  var r = rows(SHEETS.Sessions);
  for (var i = 0; i < r.data.length; i++) {
    if (String(r.data[i][2]) === String(tokenHash)) {
      r.sh.getRange(i + 2, 6).setValue(new Date().toISOString());
      return true;
    }
  }
  return false;
}

/* ---------- products ---------- */

function getProducts() {
  var r = rows(SHEETS.Products);
  var out = [];
  for (var i = 0; i < r.data.length; i++) {
    var o = toObj(r.header, r.data[i]);
    out.push({
      productId: String(o.productId),
      name: String(o.name),
      category: String(o.category),
      description: String(o.description || ''),
      price: Number(o.price),
      imageUrl: String(o.imageUrl || ''),
      stockS: Number(o.stockS) || 0,
      stockM: Number(o.stockM) || 0,
      stockL: Number(o.stockL) || 0,
      stockXL: Number(o.stockXL) || 0,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    });
  }
  return out;
}

function productMap() {
  var list = getProducts();
  var m = {};
  for (var i = 0; i < list.length; i++) m[list[i].productId] = list[i];
  return m;
}

/* ---------- orders ---------- */

function getOrdersByUser(userId) {
  var r = rows(SHEETS.Orders);
  var out = [];
  for (var i = 0; i < r.data.length; i++) {
    var o = toObj(r.header, r.data[i]);
    if (String(o.userId) === String(userId)) {
      out.push({
        orderId: o.orderId,
        userId: o.userId,
        recipientName: o.recipientName,
        phone: o.phone,
        address: o.address,
        courier: o.courier,
        shippingCost: Number(o.shippingCost) || 0,
        subtotal: Number(o.subtotal) || 0,
        total: Number(o.total) || 0,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
      });
    }
  }
  return out;
}

function getOrderWithItems(orderId, userId) {
  var r = rows(SHEETS.Orders);
  var order = null;
  for (var i = 0; i < r.data.length; i++) {
    var o = toObj(r.header, r.data[i]);
    if (String(o.orderId) === String(orderId)) {
      order = o;
      break;
    }
  }
  if (!order) return null;
  // Otorisasi: hanya pemilik yang boleh membaca.
  if (String(order.userId) !== String(userId)) fail('Pesanan tidak ditemukan.', 404);
  var ri = rows(SHEETS.OrderItems);
  var items = [];
  for (var j = 0; j < ri.data.length; j++) {
    var it = toObj(ri.header, ri.data[j]);
    if (String(it.orderId) === String(orderId)) {
      items.push({
        productId: it.productId,
        productNameSnapshot: it.productNameSnapshot,
        size: it.size,
        quantity: Number(it.quantity) || 0,
        unitPrice: Number(it.unitPrice) || 0,
        subtotal: Number(it.subtotal) || 0,
      });
    }
  }
  return {
    orderId: order.orderId,
    userId: order.userId,
    recipientName: order.recipientName,
    phone: order.phone,
    address: order.address,
    courier: order.courier,
    shippingCost: Number(order.shippingCost) || 0,
    subtotal: Number(order.subtotal) || 0,
    total: Number(order.total) || 0,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: items,
  };
}

/**
 * Transaksi terpusat dengan LockService agar dua checkout bersamaan pada
 * stok terakhir tidak lolos dua-duanya. Keterbatasan: Sheets bukan database
 * relasional — tidak ada rollback atomik penuh; jika penulisan item gagal
 * setelah order tertulis, order ditandai agar mudah diaudit manual.
 */
function createOrderAtomic(p) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    if (!p.userId) fail('Pengguna tidak valid.', 401);
    if (!p.items || p.items.length === 0 || p.items.length > 20) fail('Item pesanan tidak valid.', 400);
    if (!p.recipientName || String(p.recipientName).trim().length < 3) fail('Nama penerima minimal 3 karakter.', 400);
    if (!p.phone || !/^[0-9+\-\s]{9,16}$/.test(String(p.phone).trim())) fail('Nomor HP tidak valid.', 400);
    if (!p.address || String(p.address).trim().length < 10) fail('Alamat minimal 10 karakter.', 400);
    if (!(p.courier in COURIER_COST)) fail('Kurir tidak valid.', 400);
    if (PAYMENTS.indexOf(p.paymentMethod) < 0) fail('Metode pembayaran tidak valid.', 400);

    var catalog = productMap();
    var subtotal = 0;
    var lines = [];
    for (var i = 0; i < p.items.length; i++) {
      var it = p.items[i] || {};
      var prod = catalog[String(it.productId)];
      if (!prod) fail('Produk tidak ditemukan: ' + it.productId, 400);
      if (SIZES.indexOf(it.size) < 0) fail('Ukuran tidak valid untuk ' + prod.name, 400);
      var qty = Number(it.quantity);
      if (qty % 1 !== 0 || qty < 1 || qty > 20) fail('Kuantitas tidak valid untuk ' + prod.name, 400);
      var stok = Number(prod['stock' + it.size]) || 0;
      if (stok < qty) fail('Stok ' + prod.name + ' ukuran ' + it.size + ' tersisa ' + stok + '.', 409);
      var line = {
        productId: prod.productId,
        productNameSnapshot: prod.name,
        size: it.size,
        quantity: qty,
        unitPrice: Number(prod.price),
        subtotal: Number(prod.price) * qty,
        rowIndex: findProductRowIndex(prod.productId),
      };
      subtotal += line.subtotal;
      lines.push(line);
    }

    var shippingCost = COURIER_COST[p.courier];
    var total = subtotal + shippingCost;
    var now = new Date().toISOString();
    var orderId = 'ORD-' + new Date().getTime().toString(36).toUpperCase() + Math.floor(Math.random() * 1296).toString(36).toUpperCase();

    sheet(SHEETS.Orders).appendRow([
      orderId, p.userId, String(p.recipientName).trim(), String(p.phone).trim(), String(p.address).trim(),
      p.courier, shippingCost, subtotal, total, p.paymentMethod,
      'menunggu_pembayaran_simulasi', 'menunggu_pembayaran_simulasi', now, now,
    ]);

    try {
      var shItems = sheet(SHEETS.OrderItems);
      for (var k = 0; k < lines.length; k++) {
        var L = lines[k];
        shItems.appendRow([
          orderId + '-IT' + (k + 1), orderId, L.productId, L.productNameSnapshot,
          L.size, L.quantity, L.unitPrice, L.subtotal,
        ]);
      }
    } catch (itemErr) {
      // Tandai order agar bisa diaudit; Sheets tidak mendukung rollback penuh.
      markOrderNote(orderId, 'ITEM_WRITE_PARTIAL');
      throw itemErr;
    }

    // Kurangi stok per ukuran.
    var shProd = sheet(SHEETS.Products);
    var colBySize = { S: 7, M: 8, L: 9, XL: 10 }; // kolom stockS..stockXL (1-indexed)
    for (var m = 0; m < lines.length; m++) {
      var LM = lines[m];
      var col = colBySize[LM.size];
      var cell = shProd.getRange(LM.rowIndex, col);
      var current = Number(cell.getValue()) || 0;
      var next = current - LM.quantity;
      if (next < 0) fail('Stok berubah saat checkout untuk ' + LM.productNameSnapshot + ' (' + LM.size + ').', 409);
      cell.setValue(next);
    }
    shProd.getRange(findProductRowIndex(lines[0].productId), 12).setValue(now);

    return getOrderWithItems(orderId, p.userId);
  } finally {
    try { lock.releaseLock(); } catch (e) { /* abaikan */ }
  }
}

function findProductRowIndex(productId) {
  var r = rows(SHEETS.Products);
  for (var i = 0; i < r.data.length; i++) {
    if (String(r.data[i][0]) === String(productId)) return i + 2; // +header
  }
  fail('Produk tidak ditemukan: ' + productId, 400);
  return -1;
}

function markOrderNote(orderId, note) {
  try {
    var r = rows(SHEETS.Orders);
    for (var i = 0; i < r.data.length; i++) {
      if (String(r.data[i][0]) === String(orderId)) {
        r.sh.getRange(i + 2, 12).setValue('perlu_audit:' + note);
        return;
      }
    }
  } catch (e) { /* abaikan */ }
}
