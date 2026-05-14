"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  LayoutDashboard, 
  Store, 
  UtensilsCrossed, 
  MessageSquare, 
  Settings, 
  LogOut,
  X,
  Bell
} from "lucide-react";
import { auth } from "@/lib/firebase";

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { role, logout } = useAuthStore();

  const handleLogout = async () => {
    await auth.signOut();
    logout();
  };

  const navItems = role === "owner" ? [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Messes", href: "/dashboard/messes", icon: Store },
    { name: "Daily Menu", href: "/dashboard/menu", icon: UtensilsCrossed },
    { name: "Requests", href: "/dashboard/requests", icon: Bell },
    { name: "Reviews", href: "/dashboard/reviews", icon: MessageSquare },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ] : [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Favorites", href: "/dashboard/favorites", icon: Store },
    { name: "My Requests", href: "/dashboard/my-requests", icon: Bell },
    { name: "My Reviews", href: "/dashboard/my-reviews", icon: MessageSquare },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-16 left-0 h-[calc(100vh-64px)] w-64 bg-white border-r border-slate-200 flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="flex-1 py-8 px-4 overflow-y-auto">
          <div className="mb-6 px-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              {role === "owner" ? "Owner Panel" : "Student Dashboard"}
            </span>
            <button onClick={onClose} className="md:hidden p-1 text-slate-500 hover:text-slate-900">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    isActive 
                      ? "bg-red-50 text-red-500 border border-red-200" 
                      : "text-slate-600 hover:bg-white hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-red-500" : "text-slate-600"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
