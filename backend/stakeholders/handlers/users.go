package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"stakeholders-service/db"
	"stakeholders-service/models"
)

func GetAllUsers(c *gin.Context) {
	rows, err := db.DB.Query(
		`SELECT id, username, email, role, is_blocked, first_name, last_name, profile_picture, biography, motto, created_at FROM users`,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Username, &u.Email, &u.Role, &u.IsBlocked,
			&u.FirstName, &u.LastName, &u.ProfilePicture, &u.Biography, &u.Motto, &u.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		users = append(users, u)
	}

	c.JSON(http.StatusOK, users)
}

func BlockUser(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	result, err := db.DB.Exec(`UPDATE users SET is_blocked = TRUE WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if n, _ := result.RowsAffected(); n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "user blocked"})
}

func GetProfile(c *gin.Context) {
	userID, _ := c.Get("userId")
	id, err := strconv.Atoi(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	var u models.User
	err = db.DB.QueryRow(
		`SELECT id, username, email, role, is_blocked, first_name, last_name, profile_picture, biography, motto, created_at FROM users WHERE id = $1`,
		id,
	).Scan(&u.ID, &u.Username, &u.Email, &u.Role, &u.IsBlocked,
		&u.FirstName, &u.LastName, &u.ProfilePicture, &u.Biography, &u.Motto, &u.CreatedAt)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, u)
}

type UpdateProfileRequest struct {
	FirstName      string `json:"firstName"`
	LastName       string `json:"lastName"`
	ProfilePicture string `json:"profilePicture"`
	Biography      string `json:"biography"`
	Motto          string `json:"motto"`
}

func UpdateProfile(c *gin.Context) {
	userID, _ := c.Get("userId")
	id, err := strconv.Atoi(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := db.DB.Exec(
		`UPDATE users SET first_name=$1, last_name=$2, profile_picture=$3, biography=$4, motto=$5 WHERE id=$6`,
		req.FirstName, req.LastName, req.ProfilePicture, req.Biography, req.Motto, id,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if n, _ := result.RowsAffected(); n == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "profile updated"})
}
