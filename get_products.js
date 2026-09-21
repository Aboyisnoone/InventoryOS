fetch('http://localhost:8080/query', { 
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' }, 
  body: JSON.stringify({ 
    query: `query { 
      products { 
        id 
        name 
        sku 
        balance 
        sellingPrice 
      } 
    }`
  }) 
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(console.error);
