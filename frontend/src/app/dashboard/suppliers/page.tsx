"use client";

import Link from "next/link";
import { Users, Plus, Search, Mail, Phone, MoreHorizontal } from "lucide-react";
import { useQuery } from '@apollo/client/react';
import { GET_SUPPLIERS } from '@/graphql/operations';

export default function SuppliersPage() {
  const { data, loading } = useQuery(GET_SUPPLIERS);
  const suppliers = data?.suppliers || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Suppliers</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your vendors and restock sources.</p>
        </div>
        <Link 
          href="/dashboard/suppliers/add"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search suppliers by name or email..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-500 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-900 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Supplier Name</th>
                <th className="px-6 py-4">Primary Contact</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Active Products</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {loading && <tr><td colSpan={5} className="px-6 py-4 text-center">Loading suppliers...</td></tr>}
              {suppliers.length === 0 && !loading && (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-zinc-500">No suppliers found.</td></tr>
              )}
              {suppliers.map((supplier: any) => (
                <tr key={supplier.id} className="hover:bg-zinc-50 transition">
                  <td className="px-6 py-4 font-medium text-zinc-900 flex items-center">
                    <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold mr-3">
                      {supplier.name.charAt(0)}
                    </div>
                    {supplier.name}
                  </td>
                  <td className="px-6 py-4">{supplier.contactName || 'â€”'}</td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="flex items-center text-xs">
                      <Mail className="w-3 h-3 mr-2 text-zinc-400" /> {supplier.email || 'â€”'}
                    </div>
                    <div className="flex items-center text-xs">
                      <Phone className="w-3 h-3 mr-2 text-zinc-400" /> {supplier.phone || 'â€”'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                      â€” items
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      className="text-zinc-400 hover:text-indigo-600 transition p-1"
                      onClick={() => alert("Supplier editing & deletion will be available in a future update.")}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
