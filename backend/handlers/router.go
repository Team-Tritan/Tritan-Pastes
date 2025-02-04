package handlers

import (
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	app.Post("/api/quick", quickPasteHandler)
	app.Post("/api/pastes", createPasteHandler)
	app.Get("/api/pastes/:id", getPasteHandler)
}
