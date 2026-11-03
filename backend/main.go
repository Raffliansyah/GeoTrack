package main

import (
	"encoding/json"
	"io"
	"log"
	"math"
	"net/http"
	"strconv"
	"strings"
)

type Entity struct {
	ID        int     `json:"id"`
	Name      string  `json:"name"`
	Type      string  `json:"type"`
	Status    string  `json:"status"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

func main() {
	initDatabase()
	defer db.Close()
	createEntitiesTable()
	seedEntities()

	http.HandleFunc("/api/health", healthHandler)
	http.HandleFunc("/api/entities", entitiesHandler)
	http.HandleFunc("/api/entities/", entityByIDHandler)

	http.HandleFunc("/openapi.yaml", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.Header().Set("Allow", "GET")
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		w.Header().Set("Content-Type", "application/yaml; charset=utf-8")
		http.ServeFile(w, r, "docs/openapi.yaml")
	})

	http.HandleFunc("/swagger/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/swagger/" {
			http.NotFound(w, r)
			return
		}

		if r.Method != http.MethodGet {
			w.Header().Set("Allow", "GET")
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		w.Header().Set("Content-Type", "text/html; charset=utf-8")

		_, err := w.Write([]byte(`<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>GeoTrack API Documentation</title>
		<link rel="stylesheet"
			href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
	</head>
	<body>
		<div id="swagger-ui"></div>

		<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
		<script>
			window.onload = function () {
				SwaggerUIBundle({
					url: "/openapi.yaml",
					dom_id: "#swagger-ui",
					deepLinking: true,
					presets: [
						SwaggerUIBundle.presets.apis
					],
					layout: "BaseLayout"
				});
			};
		</script>
	</body>
	</html>`))

		if err != nil {
			log.Println("Gagal mengirim Swagger UI:", err)
		}
	})

	log.Println("GeoTrack Backend berjalan di http://localhost:8080")

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	response := map[string]string{
		"status":  "success",
		"message": "GeoTrack Backend is running",
	}

	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Println("Gagal mengirim response:", err)
	}
}

func getEntitiesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	rows, err := db.Query(`
        SELECT id, name, type, status, latitude, longitude
        FROM entities
        ORDER BY id ASC
    `)

	if err != nil {
		log.Println("Gagal mengambil entitas dari SQLite:", err)
		http.Error(w, "Gagal mengambil data entitas", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	result := make([]Entity, 0)

	for rows.Next() {
		var entity Entity

		err := rows.Scan(
			&entity.ID,
			&entity.Name,
			&entity.Type,
			&entity.Status,
			&entity.Latitude,
			&entity.Longitude,
		)

		if err != nil {
			log.Println("Gagal membaca entitas:", err)
			http.Error(w, "Gagal membaca data entitas", http.StatusInternalServerError)
			return
		}

		result = append(result, entity)
	}

	if err := rows.Err(); err != nil {
		log.Println("Gagal membaca hasil query:", err)
		http.Error(w, "Gagal membaca data entitas", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(result); err != nil {
		log.Println("Gagal mengirim data entitas:", err)
	}
}

func entitiesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getEntitiesHandler(w, r)

	case http.MethodPost:
		createEntityHandler(w, r)

	default:
		w.Header().Set("Allow", "GET, POST")
		http.Error(
			w,
			"Method not allowed",
			http.StatusMethodNotAllowed,
		)
	}
}

func createEntityHandler(w http.ResponseWriter, r *http.Request) {
	var newEntity Entity

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	defer r.Body.Close()

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&newEntity); err != nil {
		http.Error(w, "Format JSON tidak valid", http.StatusBadRequest)
		return
	}

	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		http.Error(w, "Body harus berisi satu objek JSON", http.StatusBadRequest)
		return
	}

	newEntity.Name = strings.TrimSpace(newEntity.Name)

	if newEntity.Name == "" ||
		(newEntity.Type != "Vehicle" &&
			newEntity.Type != "IoT Device" &&
			newEntity.Type != "Facility") ||
		(newEntity.Status != "Active" &&
			newEntity.Status != "Inactive") ||
		math.IsNaN(newEntity.Latitude) ||
		math.IsNaN(newEntity.Longitude) ||
		math.IsInf(newEntity.Latitude, 0) ||
		math.IsInf(newEntity.Longitude, 0) ||
		newEntity.Latitude < -90 ||
		newEntity.Latitude > 90 ||
		newEntity.Longitude < -180 ||
		newEntity.Longitude > 180 {

		http.Error(w, "Data entitas tidak valid", http.StatusBadRequest)
		return
	}

	result, err := db.Exec(`
        INSERT INTO entities
        (name, type, status, latitude, longitude)
        VALUES (?, ?, ?, ?, ?)
    `,
		newEntity.Name,
		newEntity.Type,
		newEntity.Status,
		newEntity.Latitude,
		newEntity.Longitude,
	)

	if err != nil {
		log.Println("Gagal menyimpan entitas ke SQLite:", err)
		http.Error(w, "Gagal menyimpan entitas", http.StatusInternalServerError)
		return
	}

	id, err := result.LastInsertId()
	if err != nil {
		log.Println("Gagal mendapatkan ID entitas:", err)
		http.Error(w, "Entitas tersimpan, tetapi gagal membaca ID", http.StatusInternalServerError)
		return
	}

	newEntity.ID = int(id)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(newEntity); err != nil {
		log.Println("Gagal mengirim response entitas:", err)
	}
}

func entityByIDHandler(w http.ResponseWriter, r *http.Request) {
	idString := strings.TrimPrefix(r.URL.Path, "/api/entities/")

	id, err := strconv.Atoi(idString)
	if err != nil || id <= 0 || strings.Contains(idString, "/") {
		http.Error(w, "ID entitas tidak valid", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodPut:
		updateEntityHandler(w, r, id)

	case http.MethodDelete:
		deleteEntityHandler(w, r, id)

	default:
		w.Header().Set("Allow", "PUT, DELETE")
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func updateEntityHandler(w http.ResponseWriter, r *http.Request, id int) {
	var updatedEntity Entity

	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	defer r.Body.Close()

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&updatedEntity); err != nil {
		http.Error(w, "Format JSON tidak valid", http.StatusBadRequest)
		return
	}

	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		http.Error(w, "Body harus berisi satu objek JSON", http.StatusBadRequest)
		return
	}

	updatedEntity.Name = strings.TrimSpace(updatedEntity.Name)

	if updatedEntity.Name == "" ||
		(updatedEntity.Type != "Vehicle" &&
			updatedEntity.Type != "IoT Device" &&
			updatedEntity.Type != "Facility") ||
		(updatedEntity.Status != "Active" &&
			updatedEntity.Status != "Inactive") ||
		math.IsNaN(updatedEntity.Latitude) ||
		math.IsNaN(updatedEntity.Longitude) ||
		math.IsInf(updatedEntity.Latitude, 0) ||
		math.IsInf(updatedEntity.Longitude, 0) ||
		updatedEntity.Latitude < -90 ||
		updatedEntity.Latitude > 90 ||
		updatedEntity.Longitude < -180 ||
		updatedEntity.Longitude > 180 {

		http.Error(w, "Data entitas tidak valid", http.StatusBadRequest)
		return
	}

	result, err := db.Exec(`
        UPDATE entities
        SET name = ?,
            type = ?,
            status = ?,
            latitude = ?,
            longitude = ?
        WHERE id = ?
    `,
		updatedEntity.Name,
		updatedEntity.Type,
		updatedEntity.Status,
		updatedEntity.Latitude,
		updatedEntity.Longitude,
		id,
	)

	if err != nil {
		log.Println("Gagal update SQLite:", err)
		http.Error(w, "Gagal memperbarui entitas", http.StatusInternalServerError)
		return
	}

	affected, err := result.RowsAffected()
	if err != nil {
		log.Println("Gagal membaca jumlah baris:", err)
		http.Error(w, "Gagal memeriksa hasil update", http.StatusInternalServerError)
		return
	}

	if affected == 0 {
		http.Error(w, "Entitas tidak ditemukan", http.StatusNotFound)
		return
	}

	updatedEntity.ID = id

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(updatedEntity); err != nil {
		log.Println("Gagal mengirim response update:", err)
	}
}

func deleteEntityHandler(w http.ResponseWriter, r *http.Request, id int) {
	result, err := db.Exec(
		"DELETE FROM entities WHERE id = ?",
		id,
	)

	if err != nil {
		log.Println("Gagal menghapus entitas dari SQLite:", err)
		http.Error(
			w,
			"Gagal menghapus entitas",
			http.StatusInternalServerError,
		)
		return
	}

	affected, err := result.RowsAffected()
	if err != nil {
		log.Println("Gagal memeriksa hasil delete:", err)
		http.Error(
			w,
			"Gagal memeriksa hasil penghapusan",
			http.StatusInternalServerError,
		)
		return
	}

	if affected == 0 {
		http.Error(
			w,
			"Entitas tidak ditemukan",
			http.StatusNotFound,
		)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
