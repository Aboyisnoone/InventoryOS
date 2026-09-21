-- name: GetUserByFirebaseUID :one
SELECT * FROM users WHERE firebase_uid = $1 LIMIT 1;

-- name: CreateUser :one
INSERT INTO users (firebase_uid, email, display_name)
VALUES ($1, $2, $3)
RETURNING *;

-- name: CreateBusiness :one
INSERT INTO businesses (name, category, country, currency)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: CreateBusinessMember :one
INSERT INTO business_members (business_id, user_id, role)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetBusinessConfiguration :one
SELECT * FROM business_configurations WHERE business_id = $1 LIMIT 1;

-- name: UpsertBusinessConfiguration :one
INSERT INTO business_configurations (business_id, config_schema, status)
VALUES ($1, $2, $3)
ON CONFLICT (business_id) DO UPDATE 
SET config_schema = EXCLUDED.config_schema, status = EXCLUDED.status, updated_at = CURRENT_TIMESTAMP
RETURNING *;

-- name: CreateSupplier :one
INSERT INTO suppliers (business_id, name, contact_name, email, phone)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetSuppliers :many
SELECT * FROM suppliers WHERE business_id = $1 ORDER BY name;

-- name: CreateProduct :one
INSERT INTO products (
    business_id, sku, barcode, name, description, supplier_id, 
    purchase_price, selling_price, min_stock_threshold, dynamic_fields
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
) RETURNING *;

-- name: GetProducts :many
SELECT p.*, COALESCE(b.quantity, 0) as balance
FROM products p
LEFT JOIN inventory_balances b ON p.id = b.product_id
WHERE p.business_id = $1 
ORDER BY p.created_at DESC;

-- name: GetProduct :one
SELECT * FROM products WHERE id = $1 AND business_id = $2 LIMIT 1;

-- name: InitializeInventoryBalance :one
INSERT INTO inventory_balances (product_id, business_id, quantity)
VALUES ($1, $2, $3)
RETURNING *;

-- name: UpdateInventoryBalance :one
UPDATE inventory_balances
SET quantity = quantity + $2, updated_at = CURRENT_TIMESTAMP
WHERE product_id = $1 AND business_id = $3
RETURNING *;

-- name: RecordInventoryMovement :one
INSERT INTO inventory_movements (
    business_id, product_id, user_id, type, quantity_change, balance_after, notes
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
) RETURNING *;

-- name: GetInventoryMovements :many
SELECT * FROM inventory_movements 
WHERE business_id = $1 AND (sqlc.narg('product_id')::uuid IS NULL OR product_id = sqlc.narg('product_id')::uuid)
ORDER BY created_at DESC;

-- name: GetUserBusinessRole :one
SELECT m.business_id, m.role 
FROM business_members m
JOIN users u ON m.user_id = u.id
WHERE u.firebase_uid = $1
LIMIT 1;

-- name: GetFirstBusiness :one
SELECT id FROM businesses LIMIT 1;

-- name: UpdateProduct :one
UPDATE products
SET
    name = COALESCE(sqlc.narg('name'), name),
    sku = COALESCE(sqlc.narg('sku'), sku),
    barcode = COALESCE(sqlc.narg('barcode'), barcode),
    description = COALESCE(sqlc.narg('description'), description),
    supplier_id = COALESCE(sqlc.narg('supplier_id'), supplier_id),
    purchase_price = COALESCE(sqlc.narg('purchase_price'), purchase_price),
    selling_price = COALESCE(sqlc.narg('selling_price'), selling_price)
WHERE id = $1 AND business_id = $2
RETURNING *;
-- name: GetInventoryBalance :one
SELECT * FROM inventory_balances WHERE product_id = $1 AND business_id = $2;
