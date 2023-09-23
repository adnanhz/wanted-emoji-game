package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ScoreEntry struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
}

func main() {
	log.Println("HELLO WORLD")
	mongoUri := os.Getenv("DB_URL")
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(mongoUri).SetServerAPIOptions(serverAPI)
	client, err := mongo.Connect(context.TODO(), opts)
	if err != nil {
		panic(err)
	}
	defer func() {
		if err = client.Disconnect(context.TODO()); err != nil {
			panic(err)
		}
	}()
	var result bson.M
	if err := client.Database("wanted-emoji-db").RunCommand(context.TODO(), bson.D{{"ping", 1}}).Decode(&result); err != nil {
		panic(err)
	}
	fmt.Println("You successfully connected to MongoDB!")

	http.HandleFunc("/submit", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		if r.Method != "POST" {
			http.NotFound(w, r)
			return
		}
		var scoreEntry ScoreEntry
		err := json.NewDecoder(r.Body).Decode(&scoreEntry)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		coll := client.Database("wanted-emoji-db").Collection("scores")
		doc := ScoreEntry{Name: scoreEntry.Name, Score: scoreEntry.Score}
		result, err := coll.InsertOne(context.TODO(), doc)
		fmt.Printf("Inserted document with _id: %v\n", result.InsertedID)
	})

	http.HandleFunc("/highest5", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.Header().Set("Access-Control-Allow-Origin", "*")
		if r.Method != "GET" {
			http.NotFound(w, r)
			return
		}
		var scoreEntries []ScoreEntry
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		filter := bson.D{}
		opts := options.Find().SetLimit(5).SetSort(bson.D{{"score", -1}})
		coll := client.Database("wanted-emoji-db").Collection("scores")
		cursor, err := coll.Find(context.TODO(), filter, opts)
		if err = cursor.All(context.TODO(), &scoreEntries); err != nil {
			panic(err)
		}

		jData, err := json.Marshal(scoreEntries)
		if err != nil {
			fmt.Println("Could not marshal json")
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(jData)
	})

	http.ListenAndServe(":8080", nil)
}
