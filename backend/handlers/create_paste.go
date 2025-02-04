package handlers

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	gonanoid "github.com/matoous/go-nanoid/v2"
	"golang.org/x/crypto/bcrypt"
	"pastes.tritan.gg/v2/models"
	"pastes.tritan.gg/v2/services"
)

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

	encryptedContent, err := services.EncryptContent(pasteRequest.Content)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.StandardResponse{
			Status:  fiber.StatusInternalServerError,
			Error:   true,
			Message: "Failed to encrypt content",
		})
	}

	id, err := gonanoid.New(10)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.StandardResponse{
			Status:  fiber.StatusInternalServerError,
			Error:   true,
			Message: "Failed to generate paste ID",
		})
	}

	paste := models.Paste{
		ID:                 id,
		Content:            encryptedContent,
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

	_, err = services.Collection.InsertOne(context.Background(), paste)
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

	encryptedContent, err := services.EncryptContent(content)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.StandardResponse{
			Status:  fiber.StatusInternalServerError,
			Error:   true,
			Message: "Failed to encrypt content",
		})
	}

	id, err := gonanoid.New(10)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.StandardResponse{
			Status:  fiber.StatusInternalServerError,
			Error:   true,
			Message: "Failed to generate paste ID",
		})
	}

	paste := models.Paste{
		ID:        id,
		Content:   encryptedContent,
		CreatedAt: time.Now(),
	}

	_, err = services.Collection.InsertOne(context.Background(), paste)
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
