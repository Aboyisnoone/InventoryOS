package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/Aboyisnoone/inventory-saas-backend/auth"
	"github.com/Aboyisnoone/inventory-saas-backend/db"
	"github.com/Aboyisnoone/inventory-saas-backend/graph"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
	"github.com/vektah/gqlparser/v2/ast"
)

const defaultPort = "8080"

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	// 1. Connect to PostgreSQL
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgresql://postgres:postgres@127.0.0.1:5432/inventory_saas?sslmode=disable"
	}
	conn, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}
	queries := db.New(conn)

	// 2. Setup Firebase Auth
	authClient, err := auth.NewAuthClient("", queries)
	if err != nil {
		log.Printf("Warning: Failed to initialize Firebase Auth (mocking for now): %v", err)
	}

	// 3. Setup GraphQL Server
	srv := handler.New(graph.NewExecutableSchema(graph.Config{Resolvers: &graph.Resolver{
		Queries: queries,
	}}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))
	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	// 4. Setup CORS and Middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
	})

	mux := http.NewServeMux()
	mux.Handle("/", playground.Handler("GraphQL playground", "/query"))
	mux.Handle("/query", srv)

	var handler http.Handler = mux
	if authClient != nil {
		handler = authClient.Middleware(handler)
	}
	handler = c.Handler(handler)

	log.Printf("Server starting on http://localhost:%s/", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
