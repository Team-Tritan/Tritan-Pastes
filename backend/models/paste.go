package models

import (
	"time"
)

type StandardResponse struct {
	Status  int         `json:"status"`
	Error   bool        `json:"error"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type Paste struct {
	ID                 string    `json:"id" bson:"_id"`
	Content            string    `json:"content" bson:"content"`
	Password           []byte    `json:"-" bson:"password,omitempty"`
	ExpiresAt          time.Time `json:"-" bson:"expiresAt,omitempty"`
	CreatedAt          time.Time `json:"createdAt" bson:"createdAt"`
	Viewed             bool      `json:"-" bson:"viewed"`
	ExpireAfterViewing bool      `json:"-" bson:"expireAfterViewing"`
	IP                 string    `json:"-" bson:"ip"`
}

type CreatePasteRequest struct {
	Content            string    `json:"content"`
	Password           string    `json:"password"`
	ExpiresAt          time.Time `json:"expiresAt"`
	ExpireAfterViewing bool      `json:"expireAfterViewing"`
	IP                 string    `json:"ip"`
}
