# GeoTrack

**Geographic Entity Management Dashboard**

A full-stack web application for managing geographic entities, monitoring their status, and displaying their locations on an interactive map.

*Aplikasi web full-stack untuk mengelola entitas geografis, memantau status, dan menampilkan lokasi pada peta interaktif.*

**Tech Stack:** React · TypeScript · Vite · Go · SQLite · Leaflet · OpenStreetMap · Swagger UI

//---------------------------------------------//

# 🇮🇩 Bahasa Indonesia

//--------------------------------------------//

## 1. Tentang GeoTrack

GeoTrack adalah aplikasi web full-stack yang dikembangkan untuk mengelola data entitas geografis melalui dashboard interaktif.

Aplikasi ini memungkinkan pengguna untuk menambahkan, melihat, mengubah, dan menghapus entitas, serta menampilkan lokasi berdasarkan koordinat latitude dan longitude pada peta.

GeoTrack mendukung tiga kategori entitas:

- **Vehicle:** Kendaraan operasional.
- **IoT Device:** Perangkat Internet of Things.
- **Facility:** Fasilitas atau lokasi operasional.

GeoTrack menggunakan REST API berbasis Go untuk mengelola data, SQLite sebagai penyimpanan permanen, serta React dan Leaflet untuk antarmuka dan visualisasi peta.

## 2. Teknologi yang Digunakan

| Komponen | Teknologi |
|---|---|
| Frontend | React 19, TypeScript 5.9 |
| Build Tool | Vite 8 |
| Map | React Leaflet 5, Leaflet 1.9 |
| Map Tiles | OpenStreetMap |
| Icons | Lucide React |
| Backend | Go 1.27.3 |
| HTTP Server | Go `net/http` |
| Database | SQLite (`modernc.org/sqlite`) |
| Dokumentasi API | OpenAPI 3.0.3, Swagger UI |

## 3. Fitur Utama

- **Dashboard:** Menampilkan ringkasan jumlah entitas, status Active/Inactive, serta kategori Vehicle, IoT Device, dan Facility.
- **CRUD:** Menambahkan, melihat, mengubah, dan menghapus entitas.
- **Interactive Map:** Menampilkan lokasi entitas melalui marker pada peta.
- **Lihat Lokasi:** Memusatkan peta pada koordinat entitas yang dipilih.
- **Search & Filter:** Mencari dan memfilter entitas berdasarkan nama, tipe, dan status.
- **Pagination:** Mengatur jumlah data yang ditampilkan dan navigasi antarhalaman.
- **Validasi:** Memvalidasi data pada frontend dan backend.
- **Delete Confirmation:** Meminta konfirmasi sebelum menghapus entitas.
- **API Connection Status:** Menampilkan status koneksi frontend dengan backend.
- **Persistent Storage:** Menyimpan data menggunakan SQLite.
- **Swagger UI:** Menyediakan dokumentasi serta pengujian endpoint REST API.

**Catatan:** GeoTrack menggunakan koordinat yang dimasukkan pengguna. Aplikasi ini belum menyediakan pelacakan GPS secara real-time.

## 4. Struktur Proyek

```text
GeoTrack/
├── backend/
│   ├── docs/
│   │   └── openapi.yaml
│   ├── main.go
│   ├── database.go
│   ├── go.mod
│   └── go.sum
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── entityService.ts
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── README.md
└── AGENT.md
```

File `AGENT.md` digunakan untuk mendokumentasikan penggunaan AI selama pengembangan.

## 5. Persyaratan

Sebelum menjalankan aplikasi, pastikan tersedia:

- Go 1.27.3 atau versi yang kompatibel.
- Node.js dan npm yang kompatibel dengan Vite 8.
- Browser modern.
- Koneksi internet untuk memuat peta OpenStreetMap dan aset Swagger UI dari CDN.

Go dan Node.js dapat dijalankan melalui instalasi portable apabila perangkat tidak memiliki akses administrator.

## 6. Cara Menjalankan Backend

Buka terminal pada folder utama GeoTrack.

```powershell
cd backend
go mod download
go run .
```

Backend berjalan pada:

`http://localhost:8080`

Health check:

`http://localhost:8080/api/health`

Saat backend dijalankan dari folder `backend`, sistem otomatis:

1. Membuka atau membuat database `geotrack.db`.
2. Membuat tabel `entities` apabila belum tersedia.
3. Memasukkan tiga data awal apabila tabel masih kosong.
4. Menjalankan REST API.

Data yang sudah tersimpan tidak akan dihapus ketika aplikasi dijalankan ulang.

## 7. Cara Menjalankan Frontend

Buka terminal baru pada folder utama GeoTrack.

```powershell
cd frontend
npm install
npm run dev
```

Buka alamat yang ditampilkan Vite, umumnya:

`http://localhost:5173`

Frontend menggunakan relative API path `/api`. Pada development, request tersebut diteruskan ke backend Go melalui konfigurasi proxy Vite.

Pastikan frontend dan backend berjalan bersamaan.

## 8. REST API

| Method |       Endpoint       |           Fungsi            |
|--------|----------------------|-----------------------------|
| GET    | `/api/health`        | Memeriksa kesehatan backend |
| GET    | `/api/entities`      | Mengambil seluruh entitas   |
| POST   | `/api/entities`      | Menambahkan entitas         |
| PUT    | `/api/entities/{id}` | Memperbarui entitas         |
| DELETE | `/api/entities/{id}` | Menghapus entitas           |

Contoh request untuk menambahkan entitas:

```json
{
  "name": "Kendaraan Operasional A",
  "type": "Vehicle",
  "status": "Active",
  "latitude": -6.2088,
  "longitude": 106.8456
}
```

Tipe entitas yang didukung: `Vehicle`, `IoT Device`, dan `Facility`.

Status yang didukung: `Active` dan `Inactive`.

## 9. Validasi Data

Frontend dan backend melakukan validasi terhadap:

- Nama entitas tidak boleh kosong.
- Tipe entitas harus sesuai kategori yang tersedia.
- Status harus `Active` atau `Inactive`.
- Latitude berada dalam rentang -90 hingga 90.
- Longitude berada dalam rentang -180 hingga 180.
- Koordinat harus berupa angka yang valid dan finite.

Backend menolak request yang tidak valid menggunakan respons HTTP yang sesuai.

## 10. Dokumentasi Swagger

Swagger UI tersedia pada:

`http://localhost:8080/swagger/`

Spesifikasi OpenAPI tersedia pada:

`backend/docs/openapi.yaml`

Spesifikasi juga dapat diakses melalui:

`http://localhost:8080/openapi.yaml`

Swagger memungkinkan pengembang melihat dokumentasi dan melakukan pengujian endpoint secara interaktif.

## 11. Pengujian

Pengujian CRUD telah dilakukan secara manual melalui Swagger UI.

|   Pengujian   | HTTP Status | Hasil |
|---------------|-------------|-------|
| GET Entities  | 200         | PASS  |
| POST Entity   | 201         | PASS  |
| PUT Entity    | 200         | PASS  |
| DELETE Entity | 204         | PASS  |

Pengujian frontend juga mencakup proses CRUD, peta, pencarian, filter, pagination, penyimpanan data SQLite, status koneksi API, dan build produksi.

Validasi backend diuji menggunakan beberapa request dengan input tidak valid.

## 12. Build Frontend

Untuk memastikan frontend berhasil dikompilasi:

```powershell
cd frontend
npm run build
```

Hasil build disimpan pada folder `frontend/dist/`.

## 13. Penggunaan AI

AI digunakan sebagai alat bantu selama proses pengembangan, termasuk untuk perencanaan, implementasi, debugging, review kode, dokumentasi API, dan panduan pengujian.

Hasil implementasi tetap diperiksa dan diuji secara manual.

Informasi lebih lanjut didokumentasikan dalam `AGENT.md`.

## 14. Batasan Implementasi

- Koordinat entitas dimasukkan secara manual.
- Belum mendukung pelacakan GPS secara real-time.
- Belum menyediakan autentikasi pengguna.
- Belum dikonfigurasi untuk deployment produksi.
- Implementasi difokuskan pada kebutuhan pengelolaan entitas geografis dan demonstrasi lokal.


//---------------------------------------------//

# 🇬🇧 English

//--------------------------------------------//

## 1. About GeoTrack

GeoTrack is a full-stack web application developed to manage geographic entities through an interactive dashboard.

The application allows users to create, view, update, and delete geographic entities while visualizing their locations using latitude and longitude coordinates on a map.

GeoTrack supports three entity categories:

- **Vehicle:** Operational vehicles.
- **IoT Device:** Internet of Things devices.
- **Facility:** Operational facilities or locations.

GeoTrack uses a Go REST API for data management, SQLite for persistent storage, and React with Leaflet for its interface and map visualization.

## 2. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 19, TypeScript 5.9 |
| Build Tool | Vite 8 |
| Maps | React Leaflet 5, Leaflet 1.9 |
| Map Tiles | OpenStreetMap |
| Icons | Lucide React |
| Backend | Go 1.27.3 |
| HTTP Server | Go `net/http` |
| Database | SQLite (`modernc.org/sqlite`) |
| API Documentation | OpenAPI 3.0.3, Swagger UI |

## 3. Key Features

- **Dashboard:** Displays entity totals, Active/Inactive status, and category summaries.
- **CRUD Operations:** Create, read, update, and delete geographic entities.
- **Interactive Map:** Visualize entity coordinates using map markers.
- **View Location:** Focus the map on a selected entity.
- **Search & Filter:** Search and filter entities by name, type, and status.
- **Pagination:** Navigate records and select page sizes.
- **Input Validation:** Validate entity data on both frontend and backend.
- **Delete Confirmation:** Prevent accidental deletion through confirmation.
- **API Connection Status:** Display frontend-to-backend connectivity status.
- **Persistent Storage:** Store entity data in SQLite.
- **Swagger UI:** Explore and test REST API endpoints interactively.

**Note:** GeoTrack uses manually entered geographic coordinates and does not implement real-time GPS tracking.

## 4. Project Structure

```text
GeoTrack/
├── backend/
│   ├── docs/
│   │   └── openapi.yaml
│   ├── main.go
│   ├── database.go
│   ├── go.mod
│   └── go.sum
│
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── entityService.ts
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── README.md
└── AGENT.md
```

The `AGENT.md` file documents AI assistance used throughout the development process.

## 5. Prerequisites

- Go 1.27.3 or a compatible version.
- Node.js and npm compatible with Vite 8.
- A modern web browser.
- An internet connection for OpenStreetMap tiles and CDN-hosted Swagger UI assets.

Portable installations of Go and Node.js can be used in environments without administrator privileges.

## 6. Running the Backend

Open a terminal in the GeoTrack project root.

```powershell
cd backend
go mod download
go run .
```

The backend runs at:

`http://localhost:8080`

Health endpoint:

`http://localhost:8080/api/health`

When started from the `backend` directory, the application automatically:

1. Opens or creates the `geotrack.db` SQLite database.
2. Creates the `entities` table if it does not exist.
3. Inserts three initial records if the table is empty.
4. Starts the REST API server.

Existing records are preserved between application restarts.

## 7. Running the Frontend

Open a separate terminal in the GeoTrack project root.

```powershell
cd frontend
npm install
npm run dev
```

Open the URL displayed by Vite, typically:

`http://localhost:5173`

The frontend uses `/api` as its relative API path. During development, Vite proxies these requests to the Go backend.

Both the frontend and backend must be running.

## 8. REST API

| Method |       Endpoint       |        Description          |
|--------|----------------------|-----------------------------|
| GET    | `/api/health`        | Check backend health        |
| GET    | `/api/entities`      | Retrieve all entities       |
| POST   | `/api/entities`      | Create an entity            |
| PUT    | `/api/entities/{id}` | Update an entity            |
| DELETE | `/api/entities/{id}` | Delete an entity            |

Example entity request:

```json
{
  "name": "Kendaraan Operasional A",
  "type": "Vehicle",
  "status": "Active",
  "latitude": -6.2088,
  "longitude": 106.8456
}
```

Supported entity types: `Vehicle`, `IoT Device`, and `Facility`.

Supported statuses: `Active` and `Inactive`.

## 9. Input Validation

Both frontend and backend validate the following:

- Entity name must not be empty.
- Entity type must match a supported category.
- Status must be either `Active` or `Inactive`.
- Latitude must be between -90 and 90.
- Longitude must be between -180 and 180.
- Coordinates must be valid finite numbers.

Invalid requests are rejected with appropriate HTTP error responses.

## 10. Swagger Documentation

Swagger UI:

`http://localhost:8080/swagger/`

OpenAPI specification:

`backend/docs/openapi.yaml`

Specification URL:

`http://localhost:8080/openapi.yaml`

Swagger UI provides interactive API documentation and testing capabilities.

## 11. Testing

CRUD operations have been manually verified through Swagger UI.

|   Operation   | HTTP Status | Result |
|---------------|-------------|-------|
| GET Entities  | 200         | PASS  |
| POST Entity   | 201         | PASS  |
| PUT Entity    | 200         | PASS  |
| DELETE Entity | 204         | PASS  |

Frontend testing covered CRUD operations, map interactions, search and filtering, pagination, SQLite persistence, API connection status, and production build.

Backend validation was also checked using invalid input requests.

## 12. Frontend Build

Run the following command to verify the production build:

```powershell
cd frontend
npm run build
```

Build artifacts are generated in `frontend/dist/`.

## 13. AI-Assisted Development

AI tools were used to support planning, implementation, debugging, code review, API documentation, and testing guidance.

Implementation results were manually reviewed and verified.

Further information is available in `AGENT.md`.

## 14. Current Limitations

- Entity coordinates are entered manually.
- Real-time GPS tracking is not implemented.
- User authentication is not implemented.
- Production deployment is not configured.
- The application focuses on geographic entity management and local demonstration.