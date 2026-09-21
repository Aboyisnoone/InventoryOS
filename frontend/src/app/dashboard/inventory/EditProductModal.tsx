import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useMutation, useQuery } from "@apollo/client/react";
import { UPDATE_PRODUCT, GET_SUPPLIERS, RECORD_MOVEMENT } from "@/graphql/operations";

export default function EditProductModal({ isOpen, onClose, product }: { isOpen: boolean, onClose: () => void, product: any }) {
  const [formData, setFormData] = useState<any>({});
  
  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT);
  const [recordMovement, { loading: adjusting }] = useMutation(RECORD_MOVEMENT);
  const { data: suppliersData } = useQuery(GET_SUPPLIERS);

  const loading = updating || adjusting;

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        sellingPrice: product.sellingPrice ? String(product.sellingPrice) : "",
        purchasePrice: product.purchasePrice ? String(product.purchasePrice) : "",
        supplierId: product.supplier?.id || "",
        // Separate state for adjustment
        stockAdjustment: "",
      });
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProduct({
        variables: {
          input: {
            id: product.id,
            name: formData.name,
            sku: formData.sku,
            barcode: formData.barcode,
            supplierId: formData.supplierId || null,
            sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice) : null,
            purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
          }
        }
      });
      
      // If the user wants to adjust stock
      if (formData.stockAdjustment) {
        const adjustment = parseFloat(formData.stockAdjustment);
        if (adjustment !== 0) {
          await recordMovement({
            variables: {
              productId: product.id,
              type: "ADJUSTMENT",
              quantityChange: adjustment,
              notes: "Manual stock adjustment via Edit Modal"
            }
          });
        }
      }

      alert("Product updated successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update product.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-8">
        <div className="flex justify-between items-center p-5 border-b border-zinc-100">
          <h2 className="text-xl font-bold text-zinc-900">Edit Product</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Product Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 outline-none transition" 
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">SKU</label>
              <input 
                type="text" 
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Barcode</label>
              <input 
                type="text" 
                value={formData.barcode}
                onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 outline-none transition" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Supplier</label>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-zinc-900 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
            >
              <option value="">No Supplier Selected</option>
              {suppliersData?.suppliers?.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Purchase Price ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 outline-none transition" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Selling Price ($)</label>
              <input 
                type="number" 
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 outline-none transition" 
              />
            </div>
          </div>

          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
            <label className="block text-sm font-bold text-zinc-900 mb-1">Stock Adjustment (Optional)</label>
            <p className="text-xs text-zinc-500 mb-3">Current Balance: {product.balance}</p>
            <input 
              type="number" 
              placeholder="e.g. 5 to add, -2 to remove"
              value={formData.stockAdjustment}
              onChange={(e) => setFormData({...formData, stockAdjustment: e.target.value})}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 outline-none transition" 
            />
          </div>

          <div className="pt-4 flex space-x-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-zinc-700 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
