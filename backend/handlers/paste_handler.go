package handlers

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"

	"pastes.tritan.gg/v2/models"
	"pastes.tritan.gg/v2/services"
)

func SetupRoutes(app *fiber.App) {
	app.Post("/api/pastes", createPasteHandler)
	app.Post("/api/quick", quickPasteHandler)
	app.Get("/api/pastes/:id", getPasteHandler)
	app.Post("/api/pastes/:id", getPasteHandler)
}

func createPasteHandler(c *fiber.Ctx) error {
	var pasteRequest models.CreatePasteRequest

	if err := c.BodyParser(&pasteRequest); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(models.StandardResponse{
			Status:  fiber.StatusBadRequest,
			Error:   true,
			Message: "Invalid request body",
		})
	}

	if pasteRequest.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.StandardResponse{
			Status:  fiber.StatusBadRequest,
			Error:   true,
			Message: "Content cannot be empty",
		})
	}

	paste := models.Paste{
		ID:                 uuid.New().String(),
		Content:            pasteRequest.Content,
		CreatedAt:          time.Now(),
		ExpiresAt:          pasteRequest.ExpiresAt,
		ExpireAfterViewing: pasteRequest.ExpireAfterViewing,
		Viewed:             false,
	}

	if pasteRequest.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(pasteRequest.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(models.StandardResponse{
				Status:  fiber.StatusInternalServerError,
				Error:   true,
				Message: "Password hashing failed",
			})
		}
		paste.Password = hashedPassword
	}

	_, err := services.Collection.InsertOne(context.Background(), paste)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.StandardResponse{
			Status:  fiber.StatusInternalServerError,
			Error:   true,
			Message: "Failed to create paste",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(models.StandardResponse{
		Status:  fiber.StatusCreated,
		Error:   false,
		Message: "Paste created successfully",
		Data: map[string]string{
			"id": paste.ID,
		},
	})
}

func quickPasteHandler(c *fiber.Ctx) error {
	content := string(c.Body())

	if content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(models.StandardResponse{
			Status:  fiber.StatusBadRequest,
			Error:   true,
			Message: "Content cannot be empty",
		})
	}

	paste := models.Paste{
		ID:        uuid.New().String(),
		Content:   content,
		CreatedAt: time.Now(),
	}

	_, err := services.Collection.InsertOne(context.Background(), paste)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.StandardResponse{
			Status:  fiber.StatusInternalServerError,
			Error:   true,
			Message: "Failed to create paste",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(models.StandardResponse{
		Status:  fiber.StatusCreated,
		Error:   false,
		Message: "Paste created successfully",
		Data: map[string]string{
			"id": paste.ID,
		},
	})
}

func getPasteHandler(c *fiber.Ctx) error {
	id := c.Params("id")

	var paste models.Paste
	err := services.Collection.FindOne(context.Background(), bson.M{"_id": id}).Decode(&paste)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(models.StandardResponse{
			Status:  fiber.StatusNotFound,
			Error:   true,
			Message: "This paste does not exist.",
		})
	}

	if paste.ExpireAfterViewing && paste.Viewed {
		return c.Status(fiber.StatusGone).JSON(models.StandardResponse{
			Status:  fiber.StatusGone,
			Error:   true,
			Message: "This paste has been viewed and is no longer available.",
		})
	}

	if !paste.ExpiresAt.IsZero() && time.Now().After(paste.ExpiresAt) {
		return c.Status(fiber.StatusGone).JSON(models.StandardResponse{
			Status:  fiber.StatusGone,
			Error:   true,
			Message: "This paste has expired.",
		})
	}

	if len(paste.Password) > 0 {
		var authRequest struct {
			Password string `json:"password"`
		}

		if c.Method() == fiber.MethodPost {
			if err := c.BodyParser(&authRequest); err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(models.StandardResponse{
					Status:  fiber.StatusBadRequest,
					Error:   true,
					Message: "Invalid authentication request",
				})
			}

			err = bcrypt.CompareHashAndPassword(paste.Password, []byte(authRequest.Password))
			if err != nil {
				return c.Status(fiber.StatusUnauthorized).JSON(models.StandardResponse{
					Status:  fiber.StatusUnauthorized,
					Error:   true,
					Message: "The password you entered is incorrect.",
				})
			}
		} else {
			return c.Status(fiber.StatusUnauthorized).JSON(models.StandardResponse{
				Status:  fiber.StatusUnauthorized,
				Error:   true,
				Message: "This paste is password protected.",
			})
		}
	}

	if paste.ExpireAfterViewing {
		paste.Viewed = true
		_, err = services.Collection.UpdateOne(context.Background(), bson.M{"_id": paste.ID}, bson.M{
			"$set": bson.M{"viewed": true},
		})
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(models.StandardResponse{
				Status:  fiber.StatusInternalServerError,
				Error:   true,
				Message: "Failed to mark paste as viewed",
			})
		}
	}

	return c.Status(fiber.StatusOK).JSON(models.StandardResponse{
		Status:  fiber.StatusOK,
		Error:   false,
		Message: "Paste retrieved successfully",
		Data:    paste,
	})
}
