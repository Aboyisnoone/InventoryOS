fetch('http://localhost:8080/query', { 
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' }, 
  body: JSON.stringify({ 
    query: `mutation CreateProduct($input: CreateProductInput!) { 
      createProduct(input: $input) { 
        id 
        name 
      } 
    }`,
    variables: { 
      input: { 
        name: "Ergonomic Office Chair", 
        sku: "FURN-OC-99", 
        description: "Premium mesh back office chair with lumbar support",
        sellingPrice: 499.00,
        purchasePrice: 250.00,
        minStockThreshold: 15,
        openingStock: 120,
        supplierId: null
      } 
    }
  }) 
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
