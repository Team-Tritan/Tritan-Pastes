package main

import (
	"context"
	"log"
	"os"

	"pastes.tritan.gg/v2/handlers"
	"pastes.tritan.gg/v2/services"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	} else {
		log.Println("Environment variables loaded successfully")
	}

	client, err := services.ConnectToMongoDB()
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	defer client.Disconnect(context.Background())

	secretKey := os.Getenv("SECRET_KEY")
	services.SetSecretKey(secretKey)

	app := fiber.New()
	handlers.SetupRoutes(app)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8069"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(app.Listen(":" + port))
}
