"use client";

import { useState } from "react";
import { Search, ScanLine, Minus, Plus, Trash2, CreditCard, Banknote } from "lucide-react";
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_PRODUCTS, RECORD_MOVEMENT } from '@/graphql/operations';

export default function PointOfSalePage() {
  const [cart, setCart] = useState<any[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Items");

  const { data, loading, refetch } = useQuery(GET_PRODUCTS);
  const products = data?.products || [];

  const [recordMovement] = useMutation(RECORD_MOVEMENT);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    try {
      // For each item in the cart, record a SALE movement (deducting inventory)
      for (const item of cart) {
        await recordMovement({
          variables: {
            productId: item.id,
            type: "SALE",
            quantityChange: -item.quantity, // negative change for a sale
            notes: "POS Checkout"
          }
        });
      }
      
      alert("Checkout successful! Inventory deducted.");
      setCart([]);
      refetch();
    } catch (err) {
      console.error(err);
      alert("Checkout failed.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: product.sellingPrice || 0, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Filter products based on search and category
  const filteredProducts = products.filter((product: any) => {
    // 1. Search Query filter
    const matchesSearch = !searchQuery || 
      (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    // 2. Category filter (naive matching based on name for now since we don't have a strict category field)
    let matchesCategory = true;
    if (activeCategory === "Electronics") {
      matchesCategory = !!product.name?.toLowerCase().match(/cable|mouse|keyboard|screen|monitor|charger|adapter/);
    } else if (activeCategory === "Furniture") {
      matchesCategory = !!product.name?.toLowerCase().match(/desk|chair|table|stand/);
    } else if (activeCategory === "Accessories") {
      matchesCategory = !!product.name?.toLowerCase().match(/case|cover|stand|mount|ring|light/);
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-[calc(100vh-6rem)] -m-8 flex overflow-hidden bg-zinc-100">
      
      {/* LEFT: Product Grid */}
      <div className="flex-1 flex flex-col h-full border-r border-zinc-200 bg-zinc-50">
        
        {/* Search & Scan */}
        <div className="p-4 bg-white border-b border-zinc-200 flex space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm border border-zinc-300 rounded-xl text-zinc-900 placeholder-zinc-500 font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
            />
          </div>
          <button 
            onClick={() => alert("Barcode scanning feature is coming soon!")}
            className="px-4 py-3 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition flex items-center justify-center shadow-sm"
          >
            <ScanLine className="w-5 h-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="px-4 py-3 border-b border-zinc-200 flex space-x-2 overflow-x-auto no-scrollbar bg-white">
          {["All Items", "Electronics", "Furniture", "Accessories"].map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                activeCategory === cat 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading && <div className="col-span-full text-center py-10 text-zinc-500">Loading inventory...</div>}
            {!loading && filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-10 text-zinc-500">No products found.</div>
            )}
            {filteredProducts.map((product: any) => (
              <button 
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition flex flex-col text-left group active:scale-95"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform origin-bottom-left text-zinc-400">📦</div>
                <h3 className="text-sm font-medium text-zinc-900 leading-tight mb-1">{product.name}</h3>
                <p className="text-indigo-600 font-bold mt-auto">${(product.sellingPrice || 0).toFixed(2)}</p>
                <p className="text-xs text-zinc-500 mt-1">Stock: {product.balance}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Register/Cart */}
      <div className="w-[400px] flex flex-col bg-white h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
        
        {/* Cart Header */}
        <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center">Current Order</h2>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
          </span>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <ScanLine className="w-12 h-12 mb-3 opacity-50" />
              <p>Scan or select items to begin</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between border-b border-zinc-100 pb-4 last:border-0 last:pb-0">
                <div className="flex-1 pr-4">
                  <h4 className="text-sm font-medium text-zinc-900 line-clamp-2 leading-snug">{item.name}</h4>
                  <p className="text-indigo-600 text-sm font-bold mt-1">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <div className="flex items-center space-x-3 bg-zinc-50 rounded-lg p-1 border border-zinc-200">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-zinc-200 rounded text-zinc-600"><Minus className="w-3 h-3" /></button>
                    <span className="text-sm font-bold text-zinc-900 w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-zinc-200 rounded text-zinc-600"><Plus className="w-3 h-3" /></button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center mt-2">
                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 space-y-3">
          <div className="flex justify-between text-sm text-zinc-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-zinc-600">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-zinc-900 pt-2 border-t border-zinc-200">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-3">
            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut || cart.length === 0}
              className="bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 py-3 rounded-xl font-semibold flex items-center justify-center transition shadow-sm disabled:opacity-50"
            >
              <Banknote className="w-5 h-5 mr-2" /> {isCheckingOut ? "Processing..." : "Cash"}
            </button>
            <button 
              onClick={handleCheckout}
              disabled={isCheckingOut || cart.length === 0}
              className="bg-indigo-600 border border-indigo-600 text-white hover:bg-indigo-700 py-3 rounded-xl font-semibold flex items-center justify-center transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5 mr-2" /> {isCheckingOut ? "Processing..." : "Card"}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
