"use client";

import { useQuery } from "@apollo/client/react";
import { GET_DASHBOARD_STATS } from "@/graphql/operations";
import { Package, TrendingUp, AlertCircle, DollarSign, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { format, parseISO } from "date-fns";

export default function DashboardPage() {
  const { data, loading, error } = useQuery(GET_DASHBOARD_STATS, {
    fetchPolicy: "network-only",
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-zinc-200 rounded-md"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-200 rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-zinc-200 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500">Error loading dashboard: {error.message}</div>;
  }

  const products = data?.products || [];
  const history = data?.inventoryHistory || [];

  // Compute stats
  const totalProducts = products.length;
  const lowStockThreshold = 10;
  const lowStockCount = products.filter((p: any) => p.balance < lowStockThreshold).length;
  const totalValue = products.reduce((acc: number, p: any) => acc + (parseFloat(p.balance) * parseFloat(p.purchasePrice || p.sellingPrice || "0")), 0);
  
  // Sales Revenue (assuming SALE movements represent sales)
  const salesMovements = history.filter((m: any) => m.type === 'SALE');
  
  // Format for Bar Chart (Top 5 Products by Stock Value)
  const valueData = [...products]
    .map(p => ({
      name: p.name,
      value: parseFloat(p.balance) * parseFloat(p.purchasePrice || p.sellingPrice || "0")
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Format for Area Chart (Movements over time - simple count per day for now)
  const movementsByDay = history.reduce((acc: any, curr: any) => {
    const day = format(parseISO(curr.createdAt), 'MMM dd');
    if (!acc[day]) acc[day] = { name: day, sales: 0, restocks: 0, adjustments: 0 };
    
    if (curr.type === 'SALE') acc[day].sales += Math.abs(parseFloat(curr.quantityChange || "0"));
    else if (curr.type === 'RESTOCK') acc[day].restocks += parseFloat(curr.quantityChange || "0");
    else acc[day].adjustments += parseFloat(curr.quantityChange || "0");
    
    return acc;
  }, {});
  
  const timelineData = Object.values(movementsByDay).reverse(); // Latest is first from DB, we want chronological for chart

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Overview</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Total Products</p>
            <h3 className="text-2xl font-bold text-zinc-900">{totalProducts}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Inventory Value</p>
            <h3 className="text-2xl font-bold text-zinc-900">${totalValue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Low Stock Items</p>
            <h3 className="text-2xl font-bold text-zinc-900">{lowStockCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Total Sales (Units)</p>
            <h3 className="text-2xl font-bold text-zinc-900">
              {salesMovements.reduce((acc: number, m: any) => acc + Math.abs(parseFloat(m.quantityChange || "0")), 0)}
            </h3>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-medium text-zinc-900 mb-6">Top Products by Value</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueData} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
                <XAxis type="number" tick={{ fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#3f3f46', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f4f4f5' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total Value']}
                />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-lg font-medium text-zinc-900 mb-6">Movement Trends</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRestocks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" name="Sales (Units)" />
                <Area type="monotone" dataKey="restocks" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRestocks)" name="Restocks (Units)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <h3 className="text-lg font-medium text-zinc-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-zinc-500" />
            Recent Activity
          </h3>
        </div>
        <div className="divide-y divide-zinc-100">
          {history.slice(0, 5).map((movement: any) => {
            const product = products.find((p: any) => p.id === movement.product?.id);
            const isSale = movement.type === 'SALE';
            
            return (
              <div key={movement.id} className="p-6 hover:bg-zinc-50 transition flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
                      isSale ? 'bg-emerald-100 text-emerald-700' :
                      movement.type === 'RESTOCK' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {movement.type}
                    </span>
                    <span className="text-sm font-medium text-zinc-900">
                      {Math.abs(parseFloat(movement.quantityChange || "0"))} units
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 mt-1">
                    {format(parseISO(movement.createdAt), 'MMM dd, yyyy h:mm a')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-zinc-900">
                    Balance: {movement.balanceAfter}
                  </p>
                  {movement.notes && (
                    <p className="text-xs text-zinc-500 max-w-[200px] truncate" title={movement.notes}>
                      {movement.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          
          {history.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
              No recent movements found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
