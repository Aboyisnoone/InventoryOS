# InventoryOS

InventoryOS is a modern, full-stack Inventory Management and Point-of-Sale (POS) SaaS application. It is designed to help small and medium-sized businesses track their stock, manage sales, and receive real-time alerts when inventory runs low.

## 🚀 Features

- **Point of Sale (POS):** A streamlined checkout interface with cart management, dynamic search, category filtering, and real-time inventory deduction upon checkout.
- **Auditable Inventory Ledger:** Built on a double-entry accounting model. Every stock change (opening stock, sales, manual adjustments) is safely recorded in an `inventory_movements` ledger for complete traceability.
- **Real-Time KPI Dashboard:** Dynamic calculation of Total Products, Total Value, and Low Stock Alerts.
- **Telegram Notifications:** Integrates directly with the Telegram Bot API to send instant push notifications to your phone whenever a product's stock drops below its designated minimum threshold.
- **Secure Authentication:** Powered by Firebase Authentication. Users are automatically provisioned into secure, isolated business environments upon their first login.
- **Supplier Management:** (Coming Soon) Track vendors and restock sources.

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS, Lucide Icons
- **State & Data Fetching:** Apollo GraphQL Client
- **Authentication:** Firebase Auth

### Backend
- **Language:** Go (Golang)
- **API:** GraphQL (via `gqlgen`)
- **Database:** PostgreSQL
- **Database ORM/Querying:** `sqlc` for type-safe SQL queries
- **Authentication:** Firebase Admin SDK (JWT verification)

## 📦 Project Structure

```
InventorySaaS/
├── frontend/                 # Next.js web application
│   ├── src/app/              # Next.js pages and layouts
│   ├── src/components/       # Reusable UI components
│   ├── src/graphql/          # Apollo client setup and GraphQL operations
│   └── src/lib/              # Firebase configuration
│
└── backend/                  # Go GraphQL server
    ├── db/                   # sqlc schemas, queries, and generated code
    ├── graph/                # gqlgen schemas and resolvers
    ├── auth/                 # Firebase JWT verification middleware
    └── notifications/        # Telegram Bot integration
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+)
- Go (v1.21+)
- PostgreSQL (v14+)
- A Firebase Project (with Email/Password auth enabled)
- A Telegram Bot Token (via BotFather)

### 1. Database Setup
1. Create a PostgreSQL database named `inventory_saas`.
2. Run the schema migrations located in `backend/db/schema.sql`.

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   go mod download
   ```
3. Set your environment variables (or let them default to localhost):
   ```bash
   export DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/inventory_saas?sslmode=disable"
   export TELEGRAM_BOT_TOKEN="your-telegram-bot-token"
   ```
4. Start the server:
   ```bash
   go run server.go
   ```
   *The server will start on http://localhost:8080*

### 3. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The application will be available at http://localhost:3000*

## 🔒 Security
InventoryOS uses a custom Go middleware to intercept all GraphQL requests. It validates Firebase JWTs using Google's public certificates, ensuring that every request is strictly authenticated and scoped to the user's specific `BusinessID`.

## 📄 License
This project is proprietary and confidential.
