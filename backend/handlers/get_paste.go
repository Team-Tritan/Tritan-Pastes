package handlers

import (
	"context"
	"time"

	"golang.org/x/crypto/bcrypt"
	"pastes.tritan.gg/v2/models"
	"pastes.tritan.gg/v2/services"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
)

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

	decryptedContent, err := services.DecryptContent(paste.Content)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(models.StandardResponse{
			Status:  fiber.StatusInternalServerError,
			Error:   true,
			Message: "Failed to decrypt paste content",
		})
	}
	paste.Content = decryptedContent

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
