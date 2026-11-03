package main

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
)

var db *sql.DB

func initDatabase() {
	var err error

	db, err = sql.Open("sqlite", "./geotrack.db")
	if err != nil {
		log.Fatal("Gagal membuka database:", err)
	}

	if err := db.Ping(); err != nil {
		log.Fatal("Gagal menghubungkan database:", err)
	}

	log.Println("SQLite berhasil terhubung")
}

func createEntitiesTable() {
	query := `
        CREATE TABLE IF NOT EXISTS entities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            status TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL
        );
    `

	_, err := db.Exec(query)
	if err != nil {
		log.Fatal("Gagal membuat tabel entities:", err)
	}

	log.Println("Tabel entities berhasil disiapkan")
}

func seedEntities() {
	var count int

	err := db.QueryRow(
		"SELECT COUNT(*) FROM entities",
	).Scan(&count)

	if err != nil {
		log.Fatal("Gagal menghitung entitas:", err)
	}

	if count > 0 {
		log.Println("Data entities sudah tersedia")
		return
	}

	query := `
        INSERT INTO entities
        (name, type, status, latitude, longitude)
        VALUES (?, ?, ?, ?, ?)
    `

	initialEntities := []Entity{
		{
			Name:      "Kendaraan Operasional A",
			Type:      "Vehicle",
			Status:    "Active",
			Latitude:  -6.2088,
			Longitude: 106.8456,
		},
		{
			Name:      "Sensor IoT Jakarta Selatan",
			Type:      "IoT Device",
			Status:    "Active",
			Latitude:  -6.2615,
			Longitude: 106.8106,
		},
		{
			Name:      "Fasilitas Gudang Jakarta",
			Type:      "Facility",
			Status:    "Inactive",
			Latitude:  -6.1754,
			Longitude: 106.8272,
		},
	}

	tx, err := db.Begin()
	if err != nil {
		log.Fatal("Gagal memulai transaksi:", err)
	}
	defer tx.Rollback()

	for _, entity := range initialEntities {
		_, err := tx.Exec(
			query,
			entity.Name,
			entity.Type,
			entity.Status,
			entity.Latitude,
			entity.Longitude,
		)

		if err != nil {
			log.Fatal("Gagal memasukkan data awal:", err)
		}
	}

	if err := tx.Commit(); err != nil {
		log.Fatal("Gagal menyimpan data awal:", err)
	}

	log.Println("Berhasil memasukkan 3 entitas awal ke SQLite")
}
