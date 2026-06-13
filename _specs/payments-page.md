# Payments Page

## Overview

Halaman admin-only yang menampilkan rekap finansial seluruh job — total yang sudah dibayar (job COMPLETED) dan estimasi yang masih pending (job yang sudah ada reporter/editor tapi belum selesai). Data dapat di-export ke CSV untuk keperluan pembayaran manual atau akuntansi.

## Scope

- Backend: satu endpoint baru `GET /api/v1/payments`
- Frontend: satu halaman baru `/payments` (admin only) dengan summary cards, filter bar, tabel, dan export CSV

## User Stories

- Sebagai admin, saya ingin melihat total payout yang sudah terbayar agar tahu berapa yang sudah dikeluarkan
- Sebagai admin, saya ingin melihat estimasi pending agar bisa menyiapkan dana untuk job yang sedang berjalan
- Sebagai admin, saya ingin memfilter by status, periode, dan nama agar bisa mencari data spesifik
- Sebagai admin, saya ingin export ke CSV agar bisa melakukan pembayaran manual dan pencatatan akuntansi

## Payment Calculation Rules

**Reporter payment:**
- `Math.floor(duration_seconds / 60) * rate_per_minute`
- Dibulatkan ke bawah — kelebihan detik tidak dihitung
- Rate dibaca dari tabel settings

**Editor payment:**
- Flat fee per job, dibaca dari tabel settings saat job di-complete
- Tidak bergantung pada durasi

**Snapshot rule:**
- Kedua nilai disimpan ke `jobs.reporter_payment` dan `jobs.editor_payment` saat admin menandai job COMPLETED
- Untuk job COMPLETED, selalu gunakan nilai tersimpan — jangan hitung ulang
- Untuk job pending, kembalikan estimasi menggunakan rate/flat fee dari settings saat itu

## Backend

### Endpoint

`GET /api/v1/payments`

Auth: `authenticate` + `authorize(['admin'])`

### Query Parameters (semua opsional)

| Param | Type | Keterangan |
|-------|------|-----------|
| `search` | string | Filter by case_name, reporter name, atau editor name (ILIKE) |
| `status` | `paid` \| `pending` | `paid` = hanya COMPLETED, `pending` = non-COMPLETED yang sudah ada reporter/editor |
| `period` | `month` \| `last` | `month` = bulan berjalan, `last` = bulan lalu, kosong = semua waktu |

### Response Shape

```
{
  "summary": {
    "total_payout":     number,   // SUM paid reporter + editor
    "reporter_total":   number,   // SUM reporter_payment WHERE COMPLETED
    "reporter_minutes": number,   // SUM FLOOR(duration/60) WHERE COMPLETED + reporter
    "editor_total":     number,   // SUM editor_payment WHERE COMPLETED + editor
    "editor_jobs":      number,   // COUNT WHERE COMPLETED + editor
    "pending_total":    number    // SUM estimasi WHERE non-COMPLETED + ada reporter/editor
  },
  "jobs": [
    {
      "id":               string,
      "case_name":        string,
      "duration":         number,          // detik
      "status":           string,          // JobStatus
      "reporter_name":    string | null,
      "reporter_payment": number | null,   // null jika belum ada reporter
      "editor_name":      string | null,
      "editor_payment":   number | null,   // null jika belum ada editor
      "completed_at":     string | null    // ISO 8601
    }
  ]
}
```

### Summary Calculation Rules

```
total_payout     = SUM(reporter_payment + editor_payment) WHERE status = 'COMPLETED'
reporter_total   = SUM(reporter_payment)  WHERE status = 'COMPLETED'
reporter_minutes = SUM(FLOOR(duration/60)) WHERE status = 'COMPLETED' AND reporter_id IS NOT NULL
editor_total     = SUM(editor_payment) WHERE status = 'COMPLETED' AND editor_id IS NOT NULL
editor_jobs      = COUNT(*) WHERE status = 'COMPLETED' AND editor_id IS NOT NULL
pending_total    = SUM(estimasi_reporter + estimasi_editor)
                   WHERE status != 'COMPLETED'
                   AND (reporter_id IS NOT NULL OR editor_id IS NOT NULL)
```

Estimasi pending menggunakan rumus yang sama dengan final payment (Math.floor), bukan Math.ceil.

Job yang belum punya reporter dan editor sama sekali tidak masuk hitungan pending.

## Frontend

### Route

`/payments` — hanya bisa diakses role `admin`. Tampil di sidebar admin.

### 1. Summary Cards (4 kartu)

| Kartu | Value | Subjudul |
|-------|-------|---------|
| Total Payout | `summary.total_payout` | "reporter + editor" |
| Reporter | `summary.reporter_total` | "`{reporter_minutes}` menit dibayar" |
| Editor | `summary.editor_total` | "`{editor_jobs}` jobs selesai" |
| Pending | `summary.pending_total` | "belum COMPLETED" |

### 2. Filter Bar

Tiga filter sejajar di kiri, dua tombol di kanan:

- **Search input** — filter by case name, reporter name, editor name
- **Select status** — All / Paid / Pending
- **Select period** — All time / This month / Last month
- **Tombol Reset** — kembalikan semua filter ke default
- **Tombol Export CSV** — trigger download file CSV

Semua filter bekerja bersamaan (AND). Reset mengembalikan semua filter sekaligus.

### 3. Tabel per Job

| Kolom | Data | Catatan |
|-------|------|---------|
| Case | case_name + durasi + status badge | Dua baris |
| Reporter | reporter_name | `—` kalau null |
| Reporter Pay | reporter_payment | Muted/estimasi kalau belum COMPLETED |
| Editor | editor_name | `—` kalau null |
| Editor Pay | editor_payment | Muted/estimasi kalau belum COMPLETED |
| Status | Badge Paid / Pending / — | Lihat aturan badge |

**Footer tabel:** baris total — jumlah reporter pay + editor pay dari semua baris yang terfilter.

### 4. Payment Status Badge

| Kondisi | Badge |
|---------|-------|
| `status === 'COMPLETED'` | Hijau — "Paid" |
| Ada reporter atau editor, belum COMPLETED | Oranye — "Pending" |
| Belum ada reporter maupun editor | Abu-abu — "—" |

### 5. Export CSV

Trigger download file `payments-YYYY-MM-DD.csv` dari data tabel yang sedang ditampilkan (tidak perlu endpoint khusus). Kolom CSV:

`Case name, Duration (min), Reporter, Reporter Pay, Editor, Editor Pay, Status, Completed at`

- Duration: `Math.floor(duration / 60)` menit
- Pay: format Rupiah, `—` jika null
- Status: "Paid" atau "Pending"
- Completed at: tanggal lokal, `—` jika null

## Behavior Notes

- Summary cards hanya menghitung job COMPLETED — job pending masuk ke kartu Pending
- Nilai reporter/editor pay untuk job pending ditampilkan muted sebagai estimasi, bukan angka final
- Kartu Pending menampilkan total kewajiban yang sudah terbentuk (ada reporter/editor) tapi belum dibayar
- Job NEW tanpa reporter/editor tidak muncul di mana pun di halaman ini
