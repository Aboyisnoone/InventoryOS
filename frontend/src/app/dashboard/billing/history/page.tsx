"use client";

import { Search, Receipt, ArrowRight, Download, Filter } from "lucide-react";

export default function SalesHistoryPage() {
  const invoices = [
    { id: "INV-2026-0921", date: "Sep 21, 2026 10:45 AM", customer: "Walk-in Customer", total: "$345.50", items: 3, method: "Credit Card", status: "Paid" },
    { id: "INV-2026-0920", date: "Sep 21, 2026 09:12 AM", customer: "Walk-in Customer", total: "$12.00", items: 1, method: "Cash", status: "Paid" },
    { id: "INV-2026-0919", date: "Sep 20, 2026 04:30 PM", customer: "Alice Johnson", total: "$1,249.00", items: 2, method: "Credit Card", status: "Paid" },
    { id: "INV-2026-0918", date: "Sep 20, 2026 01:15 PM", customer: "Walk-in Customer", total: "$45.00", items: 1, method: "Cash", status: "Refunded" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Sales History</h1>
          <p className="text-zinc-500 text-sm mt-1">View past transactions, invoices, and refunds.</p>
        </div>
        <button className="bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center shadow-sm">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-500 text-sm font-medium mb-1">Today's Sales</p>
          <p className="text-2xl font-bold text-emerald-600">$357.50</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-500 text-sm font-medium mb-1">Today's Orders</p>
          <p className="text-2xl font-bold text-zinc-900">2</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-500 text-sm font-medium mb-1">Weekly Revenue</p>
          <p className="text-2xl font-bold text-zinc-900">$4,892.00</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm">
          <p className="text-zinc-500 text-sm font-medium mb-1">Avg. Order Value</p>
          <p className="text-2xl font-bold text-zinc-900">$185.00</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search by invoice ID or customer..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-300 rounded-lg text-zinc-900 placeholder-zinc-500 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
          <button className="flex items-center px-3 py-2 text-sm font-medium text-zinc-600 bg-zinc-50 border border-zinc-300 rounded-lg hover:bg-zinc-100 transition">
            <Filter className="w-4 h-4 mr-2" /> Date Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-900 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-50 transition cursor-pointer group">
                  <td className="px-6 py-4 font-medium text-indigo-600 flex items-center">
                    <Receipt className="w-4 h-4 mr-2 text-zinc-400" /> {inv.id}
                  </td>
                  <td className="px-6 py-4">{inv.date}</td>
                  <td className="px-6 py-4">{inv.customer}</td>
                  <td className="px-6 py-4">{inv.items}</td>
                  <td className="px-6 py-4">{inv.method}</td>
                  <td className="px-6 py-4 font-bold text-zinc-900">{inv.total}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-600 transition ml-auto" />
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
