/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  FolderTree,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  ShoppingCart,
  TicketPercent,
  Zap,
  Image as ImageIcon,
  Gift,
  Users,
  Star,
  MessageSquare,
  Award,
  Truck,
  Store,
  Leaf,
  Coins,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import { useAppSelector } from "@/redux/hooks";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAuthInitialized,
} from "@/redux/features/authSlice";
import { useLogoutMutation } from "@/redux/api/authApi";

// ---------------------------------------------------------------------------
// Sidebar Navigation Groupings based on zevon-server Modules
// ---------------------------------------------------------------------------

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      { icon: BarChart3, label: "Analytics & KPIs", href: "/dashboard/analytics" },
    ],
  },
  {
    title: "Catalog & Stock",
    items: [
      { icon: Package, label: "All Products", href: "/dashboard/products" },
      { icon: FolderTree, label: "Categories", href: "/dashboard/categories" },
      { icon: AlertTriangle, label: "Stock Alerts", href: "/dashboard/stock-alerts", badge: "Low" },
      { icon: Sparkles, label: "Lookbooks & Outfits", href: "/dashboard/lookbooks" },
    ],
  },
  {
    title: "Orders & Sales",
    items: [
      { icon: ShoppingBag, label: "Orders", href: "/dashboard/orders" },
      { icon: RotateCcw, label: "Returns & Refunds", href: "/dashboard/returns" },
      { icon: ShoppingCart, label: "Abandoned Carts", href: "/dashboard/abandoned-carts" },
    ],
  },
  {
    title: "Promotions",
    items: [
      { icon: TicketPercent, label: "Coupons & Discounts", href: "/dashboard/coupons" },
      { icon: Zap, label: "Flash Sales", href: "/dashboard/flash-sales" },
      { icon: ImageIcon, label: "Hero Banners", href: "/dashboard/banners" },
      { icon: Gift, label: "Gift Cards", href: "/dashboard/gift-cards" },
    ],
  },
  {
    title: "Customers & Support",
    items: [
      { icon: Users, label: "Customers", href: "/dashboard/customers" },
      { icon: Star, label: "Reviews & Ratings", href: "/dashboard/reviews" },
      { icon: MessageSquare, label: "Customer Chat", href: "/dashboard/messages" },
      { icon: Award, label: "Loyalty & Rewards", href: "/dashboard/loyalty" },
    ],
  },
  {
    title: "Operations & Store",
    items: [
      { icon: Coins, label: "Currency & Forex", href: "/dashboard/currency" },
      { icon: Truck, label: "Shipping & Delivery", href: "/dashboard/shipping" },
      { icon: Store, label: "Physical Stores", href: "/dashboard/stores" },
      { icon: Leaf, label: "Sustainability", href: "/dashboard/sustainability" },
      { icon: Settings, label: "Store Settings", href: "/dashboard/settings" },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Auth Guard
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Force logout
    } finally {
      router.push("/login");
    }
  };

  // Get active item title for breadcrumb
  let activeTitle = "Overview";
  for (const group of navGroups) {
    for (const item of group.items) {
      if (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))) {
        activeTitle = item.label;
        break;
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
      {/* ── Desktop Sidebar ──────────────────────────────────────── */}
      <aside className="hidden lg:flex w-72 flex-col shrink-0 border-r border-white/10 bg-zinc-950/80 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-white/10 px-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              Z
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white">
                ZEVON
              </span>
              <span className="text-[9px] block font-medium tracking-widest text-amber-400 uppercase">
                Enterprise Dashboard
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {group.title}
              </h3>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                        isActive
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/10 font-semibold"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                            isActive ? "text-amber-400" : "text-slate-400 group-hover:text-white"
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card & Logout Footer */}
        <div className="border-t border-white/10 p-4 bg-zinc-900/40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-bold text-sm flex items-center justify-center shrink-0">
                {currentUser?.name?.charAt(0) || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser?.name || "Admin User"}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-amber-400 font-semibold uppercase">
                    {currentUser?.role || "ADMIN"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer ────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-zinc-950 border-r border-white/10 flex flex-col h-full z-10 animate-in slide-in-from-left duration-200">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-black text-sm">
                  Z
                </div>
                <span className="font-bold text-white tracking-wide">ZEVON Admin</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <h3 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {group.title}
                  </h3>
                  <div className="space-y-0.5 pt-1">
                    {group.items.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
                            isActive
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 p-4">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold hover:bg-rose-500/20"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Area ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 shrink-0 border-b border-white/10 bg-zinc-950/60 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs">
              <Link
                href="/dashboard"
                className="text-slate-400 hover:text-slate-200 transition-colors hidden sm:inline"
              >
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 hidden sm:inline" />
              <span className="font-semibold text-white">{activeTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Currency Switcher */}
            <CurrencySwitcher />

            {/* Quick Status / Environment Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Backend Connected (Port 5000)</span>
            </div>

            {/* Notifications */}
            <button
              type="button"
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-zinc-950" />
            </button>

            {/* User Avatar & Logout */}
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-bold text-xs flex items-center justify-center shadow-md">
                  {currentUser?.name?.charAt(0) || "A"}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-semibold text-white block leading-tight">
                    {currentUser?.name || "Admin"}
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
                    {currentUser?.role || "ADMIN"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Log Out of Dashboard"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-zinc-950/40">
          {children}
        </main>
      </div>
    </div>
  );
}
