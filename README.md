# SAIMED Digital Link Hub — Analytics Dashboard

## Isi folder
- `index.html` — halaman dashboard.
- `assets/css/style.css` — styling dashboard.
- `assets/js/app.js` — render statistik, grafik, filter periode, dan export CSV.
- `tracker.js` — script pelacak kunjungan dan klik untuk dipasang pada halaman Digital Link Hub.

## Menjalankan
1. Ekstrak folder ke `htdocs`, misalnya `C:\xampp\htdocs\saimed-analytics-dashboard`.
2. Jalankan Apache dari XAMPP.
3. Buka `http://localhost/saimed-analytics-dashboard/`.

Bootstrap menggunakan CDN **5.3.9** (rilis stabil terbaru per 21 November 2026). Chart menggunakan Chart.js CDN. Koneksi internet diperlukan untuk memuat library dan font.

## Menghubungkan dengan halaman SAIMED Link Hub
1. Salin `tracker.js` ke folder project Link Hub Anda.
2. Tambahkan sebelum `</body>` pada halaman Link Hub:

```html
<script src="assets/js/tracker.js"></script>
```

Sesuaikan path `src` sesuai lokasi file tracker.js di project Anda. Pastikan Link Hub dan dashboard berada pada origin yang sama (contoh keduanya `http://localhost/...`).
3. Pastikan tautan memakai teks atau URL yang mengandung nama kanal (Shopee, Tokopedia, WhatsApp, Instagram, Website) agar klasifikasi klik otomatis sesuai.
4. Buka Link Hub lalu klik beberapa tautan. Kunjungan dan klik akan tersimpan pada `localStorage` browser yang sama.
5. Buka dashboard. Saat data aktual sudah ada, dashboard otomatis memakai data tersebut dan tidak lagi menampilkan data demo.

## Catatan penting
- Saat belum ada data aktual, dashboard menampilkan **data demo** agar layout dan grafik bisa diperiksa.
- Data disimpan di browser (`localStorage`), bukan server. Data hanya tersedia di browser/perangkat yang sama dan dapat hilang jika data situs dibersihkan.
- Angka perangkat pada dashboard dihitung dari event pageview dan click yang direkam.
- Ini prototipe analytics front-end, bukan sistem analytics multi-user. Untuk statistik publik/produksi lintas perangkat, perlu endpoint backend (PHP) + database (MySQL) dan endpoint penerima event.
- Export report menghasilkan file CSV dari data yang tersedia di browser.
