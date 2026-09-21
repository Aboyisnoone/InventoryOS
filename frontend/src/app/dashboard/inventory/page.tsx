"use client";

import Link from "next/link";
import { Plus, Search, Filter, AlertTriangle, ArrowUpDown, Edit } from "lucide-react";
import { useQuery } from '@apollo/client/react';
import { GET_PRODUCTS } from '@/graphql/operations';
import EditProductModal from './EditProductModal';
import { useState } from "react";

export default function InventoryDashboard() {
  const { data, loading, error, refetch } = useQuery(GET_PRODUCTS);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  const inventory = data?.products || [];

  const totalProducts = inventory.length;
  // Fallback minStockThreshold to 10 if not defined
  const lowStockAlerts = inventory.filter((item: any) => (item.balance || 0) <= (item.minStockThreshold || 10)).length;
  const totalValue = inventory.reduce((sum: number, item: any) => sum + ((item.balance || 0) * (item.sellingPrice || 0)), 0);

  // Apply search and filters
  const filteredInventory = inventory.filter((item: any) => {
    // 1. Search filter
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.sku && item.sku.toLowerCase().includes(q)) ||
      (item.barcode && item.barcode.toLowerCase().includes(q));

    // 2. Status filter
    const balance = parseFloat(item.balance || 0);
    const threshold = parseFloat(item.minStockThreshold || 10);
    let itemStatus = "IN_STOCK";
    if (balance <= 0) itemStatus = "OUT_OF_STOCK";
    else if (balance <= threshold) itemStatus = "LOW_STOCK";

    const matchesStatus = statusFilter === "ALL" || statusFilter === itemStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Inventory</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your products and track stock levels.</p>
        </div>
        <Link 
          href="/dashboard/inventory/add" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-500 text-sm font-medium mb-1">Total Products</p>
          <p className="text-3xl font-bold text-zinc-900">{totalProducts}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-500 text-sm font-medium mb-1">Low Stock Alerts</p>
          <div className="flex items-center">
            <p className="text-3xl font-bold text-amber-600">{lowStockAlerts}</p>
            <AlertTriangle className="w-5 h-5 text-amber-500 ml-3" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-500 text-sm font-medium mb-1">Total Value</p>
          <p className="text-3xl font-bold text-zinc-900">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalValue)}
          </p>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search by name, SKU, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-500 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center px-3 py-2 text-sm font-medium text-zinc-600 bg-zinc-50 border border-zinc-300 rounded-lg hover:bg-zinc-100 transition"
            >
              <Filter className="w-4 h-4 mr-2" /> 
              {statusFilter === "ALL" ? "Filter" : statusFilter.replace("_", " ")}
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg z-10 py-1">
                <button 
                  onClick={() => { setStatusFilter("ALL"); setShowFilterDropdown(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 ${statusFilter === 'ALL' ? 'font-bold text-indigo-600' : 'text-zinc-700'}`}
                >
                  All Statuses
                </button>
                <button 
                  onClick={() => { setStatusFilter("IN_STOCK"); setShowFilterDropdown(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 ${statusFilter === 'IN_STOCK' ? 'font-bold text-indigo-600' : 'text-zinc-700'}`}
                >
                  In Stock
                </button>
                <button 
                  onClick={() => { setStatusFilter("LOW_STOCK"); setShowFilterDropdown(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 ${statusFilter === 'LOW_STOCK' ? 'font-bold text-indigo-600' : 'text-zinc-700'}`}
                >
                  Low Stock
                </button>
                <button 
                  onClick={() => { setStatusFilter("OUT_OF_STOCK"); setShowFilterDropdown(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-zinc-50 ${statusFilter === 'OUT_OF_STOCK' ? 'font-bold text-indigo-600' : 'text-zinc-700'}`}
                >
                  Out of Stock
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-900 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4 flex items-center">Stock <ArrowUpDown className="w-3 h-3 ml-2 text-zinc-400" /></th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading && <tr><td colSpan={6} className="px-6 py-4 text-center">Loading inventory...</td></tr>}
              {!loading && filteredInventory.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No products found matching your filters.</td></tr>
              )}
              {filteredInventory.map((item: any) => (
                <tr key={item.id} className="hover:bg-zinc-50 transition">
                  <td className="px-6 py-4 font-medium text-zinc-900">{item.name}</td>
                  <td className="px-6 py-4 font-mono text-xs">{item.sku}</td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${item.balance <= (item.minStockThreshold || 10) ? 'text-red-600' : 'text-zinc-900'}`}>
                      {item.balance}
                    </span>
                  </td>
                  <td className="px-6 py-4">${item.sellingPrice || '0.00'}</td>
                  <td className="px-6 py-4">
                    {(() => {
                      const balance = parseFloat(item.balance || 0);
                      const threshold = parseFloat(item.minStockThreshold || 10);
                      
                      if (balance <= 0) {
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
                            Out of Stock
                          </span>
                        );
                      } else if (balance <= threshold) {
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
                            Low Stock
                          </span>
                        );
                      } else {
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                            In Stock
                          </span>
                        );
                      }
                    })()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setEditingProduct(item)}
                      className="text-zinc-400 hover:text-indigo-600 transition p-1"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EditProductModal 
        isOpen={!!editingProduct} 
        onClose={() => {
          setEditingProduct(null);
          refetch();
        }} 
        product={editingProduct} 
      />
    </div>
  );
}
