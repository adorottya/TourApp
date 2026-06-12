package db

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Connect() {
	dsn := os.Getenv("POSTGRES_DSN")
	if dsn == "" {
		dsn = "host=localhost port=5432 user=stakeholders password=stakeholders dbname=stakeholders sslmode=disable"
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err)
	}

	if err := db.Ping(); err != nil {
		log.Fatal("PostgreSQL ping failed:", err)
	}

	DB = db
	migrate()
	log.Println("Connected to PostgreSQL")
}

func migrate() {
	_, err := DB.Exec(`CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		username VARCHAR(255) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL,
		email VARCHAR(255) UNIQUE NOT NULL,
		role VARCHAR(50) NOT NULL,
		is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
		first_name VARCHAR(255) NOT NULL DEFAULT '',
		last_name VARCHAR(255) NOT NULL DEFAULT '',
		profile_picture TEXT NOT NULL DEFAULT '',
		biography TEXT NOT NULL DEFAULT '',
		motto VARCHAR(255) NOT NULL DEFAULT '',
		created_at TIMESTAMP NOT NULL DEFAULT NOW()
	)`)
	if err != nil {
		log.Fatal("Migration failed:", err)
	}
}
