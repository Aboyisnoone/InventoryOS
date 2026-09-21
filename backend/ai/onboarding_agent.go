package ai

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type BusinessConfigurationSchema struct {
	InventoryFields       []string `json:"inventory_fields"`
	BillingFeatures       []string `json:"billing_features"`
	DashboardWidgets      []string `json:"dashboard_widgets"`
	RequiresExpiryTracking bool    `json:"requires_expiry_tracking"`
	RequiresBatchTracking  bool    `json:"requires_batch_tracking"`
}

func GenerateBusinessConfiguration(ctx context.Context, apiKey, businessName, category, country string) (*BusinessConfigurationSchema, error) {
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, err
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash")
	model.ResponseMIMEType = "application/json"

	prompt := fmt.Sprintf(`
	You are an expert SaaS architect configuring a multi-tenant inventory system.
	A new business has just signed up.
	Business Name: %s
	Business Category: %s
	Country: %s

	Generate a highly tailored software configuration for them.
	Respond ONLY with a valid JSON object matching this schema:
	{
		"inventory_fields": ["array of required inventory field names like 'SKU', 'Barcode', 'Size', 'Color', 'Prescription'"],
		"billing_features": ["array of required billing features like 'GST', 'Discounts', 'Customer Information'"],
		"dashboard_widgets": ["array of useful dashboard metrics like 'Expiring Products', 'Low Stock', 'Daily Revenue'"],
		"requires_expiry_tracking": boolean,
		"requires_batch_tracking": boolean
	}
	`, businessName, category, country)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return nil, err
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty response from Gemini")
	}

	part := resp.Candidates[0].Content.Parts[0]
	jsonText := fmt.Sprintf("%v", part)

	var config BusinessConfigurationSchema
	err = json.Unmarshal([]byte(jsonText), &config)
	if err != nil {
		return nil, fmt.Errorf("failed to parse AI json: %w\nResponse was: %s", err, jsonText)
	}

	return &config, nil
}
