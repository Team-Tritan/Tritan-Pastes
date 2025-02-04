package handlers

import (
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	app.Post("/api/pastes", createPasteHandler)
	app.Post("/api/quick", quickPasteHandler)
	app.Get("/api/pastes/:id", getPasteHandler)
	app.Post("/api/pastes/:id", getPasteHandler)
}
