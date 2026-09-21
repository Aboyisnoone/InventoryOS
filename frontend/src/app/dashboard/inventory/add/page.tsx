"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles, Box, DollarSign } from "lucide-react";
import { useMutation, useQuery } from '@apollo/client/react';
import { CREATE_PRODUCT, GET_SUPPLIERS } from '@/graphql/operations';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  
  // Basic states for the form
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [openingStock, setOpeningStock] = useState('');
  const [minStock, setMinStock] = useState('');

  // Fetch suppliers for the dropdown
  const { data: suppliersData } = useQuery(GET_SUPPLIERS);

  // Dynamic fields from Gemini configuration (mocked logic for now)
  const dynamicFields = ["Color", "Warranty Period", "Condition"];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await createProduct({
        variables: {
          input: {
            name,
            sku: sku || undefined,
            barcode: barcode || undefined,
            description: description || undefined,
            supplierId: supplierId || undefined,
            purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
            sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined,
            minStockThreshold: minStock ? parseFloat(minStock) : undefined,
            openingStock: openingStock ? parseFloat(openingStock) : undefined,
          }
        }
      });
      router.push('/dashboard/inventory');
    } catch (err) {
      console.error(err);
      alert("Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4">
        <Link 
          href="/dashboard/inventory" 
          className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Add New Product</h1>
          <p className="text-zinc-500 text-sm mt-1">Create a new item in your inventory ledger.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex items-center">
            <Box className="w-4 h-4 text-zinc-400 mr-2" />
            <h2 className="font-semibold text-zinc-800">Basic Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Product Name *</label>
                <input required value={name} onChange={e => setName(e.target.value)} type="text" className="text-zinc-900 placeholder-zinc-500 w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Wireless Mouse" />
              </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
                  <input 
                    type="text" 
                    list="category-options"
                    className="text-zinc-900 placeholder-zinc-500 w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" 
                    placeholder="Select or type a category..."
                  />
                  <datalist id="category-options">
                    <option value="Electronics" />
                    <option value="Accessories" />
                    <option value="Furniture" />
                    <option value="Clothing" />
                    <option value="Food & Beverage" />
                  </datalist>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">SKU</label>
                <input value={sku} onChange={e => setSku(e.target.value)} type="text" className="text-zinc-900 placeholder-zinc-500 w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" placeholder="MOU-WL-01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Barcode / UPC</label>
                <input value={barcode} onChange={e => setBarcode(e.target.value)} type="text" className="text-zinc-900 placeholder-zinc-500 w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm" placeholder="Scan or type barcode" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="text-zinc-900 placeholder-zinc-500 w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Detailed product description..."></textarea>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-4 flex items-center">
            <DollarSign className="w-4 h-4 text-zinc-400 mr-2" />
            <h2 className="font-semibold text-zinc-800">Pricing & Initial Stock</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Purchase Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <input value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} type="number" step="0.01" className="text-zinc-900 placeholder-zinc-500 w-full pl-8 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Selling Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <input value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} type="number" step="0.01" className="text-zinc-900 placeholder-zinc-500 w-full pl-8 pr-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Supplier</label>
                <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="text-zinc-900 placeholder-zinc-500 w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">Select Supplier</option>
                  {suppliersData?.suppliers?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-zinc-100">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Opening Stock (Ledger Entry)</label>
                <input value={openingStock} onChange={e => setOpeningStock(e.target.value)} type="number" className="text-zinc-900 placeholder-zinc-500 w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0" />
                <p className="text-xs text-zinc-500 mt-1">This will insert an OPENING_STOCK movement in the ledger.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Low Stock Alert Threshold</label>
                <input value={minStock} onChange={e => setMinStock(e.target.value)} type="number" className="text-zinc-900 placeholder-zinc-500 w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="10" />
              </div>
            </div>
          </div>
        </div>

        {/* Gemini Dynamic Configuration Fields */}
        <div className="bg-indigo-50/50 rounded-xl border border-indigo-100 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4">
            <Sparkles className="w-5 h-5 text-indigo-400 opacity-50" />
          </div>
          <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4 flex items-center">
            <Sparkles className="w-4 h-4 text-indigo-600 mr-2" />
            <h2 className="font-semibold text-indigo-900">AI-Generated Fields</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-indigo-700/80 mb-4">
              These fields were specifically generated for your business category during onboarding.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dynamicFields.map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-indigo-900 mb-1">{field}</label>
                  <input type="text" className="text-zinc-900 placeholder-zinc-500 w-full px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" placeholder={`Enter ${field.toLowerCase()}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium transition flex items-center shadow-lg shadow-indigo-600/20 disabled:opacity-70"
          >
            {isSaving ? (
              <span className="flex items-center"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Saving Ledger...</span>
            ) : (
              <span className="flex items-center"><Save className="w-5 h-5 mr-2" /> Save Product</span>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
