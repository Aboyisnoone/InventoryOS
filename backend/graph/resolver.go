package graph

import (
	"context"
	"strconv"

	"github.com/google/uuid"
	"github.com/Aboyisnoone/inventory-saas-backend/auth"
	"github.com/Aboyisnoone/inventory-saas-backend/db"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require
// here.

type Resolver struct {
	Queries *db.Queries
}

func getOrCreateBusiness(ctx context.Context, q *db.Queries) uuid.UUID {
	userCtx := auth.ForContext(ctx)
	if userCtx != nil && userCtx.BusinessID != "" {
		if id, err := uuid.Parse(userCtx.BusinessID); err == nil {
			return id
		}
	}

	panic("Unauthorized: No Business ID found in context. Are you missing a Firebase token?")
}

func getUserID(ctx context.Context) uuid.NullUUID {
	userCtx := auth.ForContext(ctx)
	if userCtx != nil && userCtx.UserID != "" {
		if id, err := uuid.Parse(userCtx.UserID); err == nil {
			return uuid.NullUUID{UUID: id, Valid: true}
		}
	}
	return uuid.NullUUID{Valid: false}
}

func floatToDecimalStr(f float64) string {
	return strconv.FormatFloat(f, 'f', 2, 64)
}
func parseDecimalStr(s string) float64 {
	f, _ := strconv.ParseFloat(s, 64)
	return f
}
