package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/Aboyisnoone/inventory-saas-backend/db"
)

type contextKey struct {
	name string
}

var UserCtxKey = &contextKey{"user"}
var BusinessCtxKey = &contextKey{"business"}
var RoleCtxKey = &contextKey{"role"}

func AuthMiddleware(dbQueries *db.Queries) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				next.ServeHTTP(w, r)
				return
			}

			// In a real implementation, we would verify the Firebase JWT token here
			// using firebase.google.com/go/v4. For now, we simulate extraction.
			tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
			
			// Simulated token verification
			// firebaseUID := verifyToken(tokenString)
			firebaseUID := tokenString // Fake it till we make it for the foundation phase
			
			if firebaseUID == "" {
				next.ServeHTTP(w, r)
				return
			}

			// Find user in DB
			ctx := r.Context()
			user, err := dbQueries.GetUserByFirebaseUID(ctx, firebaseUID)
			if err != nil {
				// User not found in our DB yet
				next.ServeHTTP(w, r)
				return
			}

			// Put user in context
			ctx = context.WithValue(ctx, UserCtxKey, &user)

			// Get Business-Tenant Context if provided in headers (e.g. X-Business-ID)
			// A user can belong to multiple businesses, so the frontend must specify which one they are currently acting on.
			businessIDStr := r.Header.Get("X-Business-ID")
			if businessIDStr != "" {
				// We would parse the UUID and check `dbQueries.GetUserBusinesses` to ensure they actually belong to it
				// and extract their role.
				
				// Simulated for now
				ctx = context.WithValue(ctx, BusinessCtxKey, businessIDStr)
				ctx = context.WithValue(ctx, RoleCtxKey, "OWNER") // Extracted from business_members
			}

			r = r.WithContext(ctx)
			next.ServeHTTP(w, r)
		})
	}
}

// ForContext finds the user from the context.
func ForContext(ctx context.Context) *db.User {
	raw, _ := ctx.Value(UserCtxKey).(*db.User)
	return raw
}

// BusinessForContext gets the current active business tenant from the context.
func BusinessForContext(ctx context.Context) string {
	raw, _ := ctx.Value(BusinessCtxKey).(string)
	return raw
}

// RoleForContext gets the user's role in the current active business tenant.
func RoleForContext(ctx context.Context) string {
	raw, _ := ctx.Value(RoleCtxKey).(string)
	return raw
}
