package handlers

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"pastes.tritan.gg/v2/models"
	"pastes.tritan.gg/v2/services"
)

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
