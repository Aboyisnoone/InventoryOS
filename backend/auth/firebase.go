package auth

import (
	"context"
	"database/sql"
	"log"
	"net/http"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"github.com/Aboyisnoone/inventory-saas-backend/db"
	"google.golang.org/api/option"
)

// Define context keys
type contextKey struct{ name string }

var (
	UserContextKey = &contextKey{"user"}
)

// UserContext holds information extracted from the Firebase JWT and database
type UserContext struct {
	FirebaseUID string
	Email       string
	Role        string
	BusinessID  string
	UserID      string
}

type AuthClient struct {
	auth    *auth.Client
	queries *db.Queries
}

func NewAuthClient(credentialsFile string, queries *db.Queries) (*AuthClient, error) {
	ctx := context.Background()
	var app *firebase.App
	var err error

	if credentialsFile != "" {
		opt := option.WithCredentialsFile(credentialsFile)
		app, err = firebase.NewApp(ctx, nil, opt)
	} else {
		// Verify tokens using public certificates without needing ADC
		app, err = firebase.NewApp(ctx, &firebase.Config{ProjectID: "inventory-saas-1566c"}, option.WithoutAuthentication())
	}

	if err != nil {
		return nil, err
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		return nil, err
	}

	return &AuthClient{auth: authClient, queries: queries}, nil
}

// Middleware verifies the Firebase ID token
func (a *AuthClient) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow introspection queries to pass through without auth
		if r.Method == "OPTIONS" {
			next.ServeHTTP(w, r)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			// Reject unauthenticated requests
			http.Error(w, "Unauthorized: Missing Authorization header", http.StatusUnauthorized)
			return
		}

		splitToken := strings.Split(authHeader, "Bearer ")
		if len(splitToken) != 2 {
			http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
			return
		}

		tokenString := splitToken[1]
		token, err := a.auth.VerifyIDToken(r.Context(), tokenString)
		if err != nil {
			log.Printf("error verifying ID token: %v\n", err)
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		email := ""
		if emailClaim, ok := token.Claims["email"]; ok {
			email = emailClaim.(string)
		}

		// Inject user info into context
		userCtx := &UserContext{
			FirebaseUID: token.UID,
			Email:       email,
		}

		// Try to get existing user business
		biz, err := a.queries.GetUserBusinessRole(r.Context(), token.UID)
		if err != nil {
			// If not found, auto-provision user and business
			log.Printf("User not found in DB, auto-provisioning: %v", token.UID)

			// 1. Create User
			dbUser, err := a.queries.CreateUser(r.Context(), db.CreateUserParams{
				FirebaseUid: token.UID,
				Email:       email,
				DisplayName: sql.NullString{String: email, Valid: email != ""},
			})
			if err != nil {
				log.Printf("Error creating user: %v", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

			// 2. Create Business
			newBiz, err := a.queries.CreateBusiness(r.Context(), db.CreateBusinessParams{
				Name:     "My Business",
				Category: "Retail",
				Currency: sql.NullString{String: "USD", Valid: true},
			})
			if err != nil {
				log.Printf("Error creating business: %v", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

			// 3. Link User to Business
			_, err = a.queries.CreateBusinessMember(r.Context(), db.CreateBusinessMemberParams{
				UserID:     dbUser.ID,
				BusinessID: newBiz.ID,
				Role:       db.UserRoleOWNER,
			})
			if err != nil {
				log.Printf("Error creating user business role: %v", err)
				http.Error(w, "Internal Server Error", http.StatusInternalServerError)
				return
			}

			userCtx.BusinessID = newBiz.ID.String()
			userCtx.Role = "OWNER"
			userCtx.UserID = dbUser.ID.String()
		} else {
			userCtx.BusinessID = biz.BusinessID.String()
			userCtx.Role = string(biz.Role)
			
			// Also fetch the user ID
			dbUser, err := a.queries.GetUserByFirebaseUID(r.Context(), token.UID)
			if err == nil {
				userCtx.UserID = dbUser.ID.String()
			}
		}

		ctx := context.WithValue(r.Context(), UserContextKey, userCtx)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	})
}

// ForContext finds the user from the context.
func ForContext(ctx context.Context) *UserContext {
	raw, _ := ctx.Value(UserContextKey).(*UserContext)
	return raw
}
