"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Sparkles } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Inventory", href: "/dashboard/inventory", icon: Package },
    { name: "Billing & POS", href: "/dashboard/billing", icon: ShoppingCart },
    { name: "Suppliers", href: "/dashboard/suppliers", icon: Users },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="w-64 bg-white border-r border-zinc-200 h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-zinc-100">
        <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm">AI</span>
        </div>
        <span className="font-semibold text-zinc-900 tracking-tight">InventoryOS</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-indigo-600" : "text-zinc-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-100">
        <button
          onClick={() => auth.signOut()}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-zinc-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-zinc-400" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
