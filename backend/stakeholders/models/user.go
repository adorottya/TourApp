package models

import "time"

type Role string

const (
	RoleAdmin   Role = "administrator"
	RoleGuide   Role = "guide"
	RoleTourist Role = "tourist"
)

type User struct {
	ID             int       `json:"id"`
	Username       string    `json:"username"`
	Password       string    `json:"-"`
	Email          string    `json:"email"`
	Role           Role      `json:"role"`
	IsBlocked      bool      `json:"isBlocked"`
	FirstName      string    `json:"firstName"`
	LastName       string    `json:"lastName"`
	ProfilePicture string    `json:"profilePicture"`
	Biography      string    `json:"biography"`
	Motto          string    `json:"motto"`
	CreatedAt      time.Time `json:"createdAt"`
}
