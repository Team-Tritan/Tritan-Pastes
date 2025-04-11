package services

import (
	"context"
	"os"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	Client     *mongo.Client
	Collection *mongo.Collection
)

func ConnectToMongoDB() (*mongo.Client, error) {
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	clientOptions := options.Client().ApplyURI(mongoURI)

	var err error
	Client, err = mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		return nil, err
	}

	if err = Client.Ping(context.Background(), nil); err != nil {
		return nil, err
	}

	database := Client.Database("pastebin")
	Collection = database.Collection("pastes")

	indexModel := mongo.IndexModel{
		Keys:    bson.M{"expiresAt": 1},
		Options: options.Index().SetExpireAfterSeconds(0),
	}
	_, err = Collection.Indexes().CreateOne(context.Background(), indexModel)
	return Client, err
}
