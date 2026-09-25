/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
  ChevronRight,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import { ZevonLogo } from "@/components/common/Logo";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAuthInitialized,
  logout as logoutAction,
} from "@/redux/features/authSlice";
import { useLogoutMutation, useGetMeQuery } from "@/redux/api/authApi";

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
  const dispatch = useAppDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const currentUser = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsAuthInitialized);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  // Fetch live current user profile if authenticated
  const { data: meData } = useGetMeQuery(undefined, {
    skip: !isAuthenticated || !isInitialized,
  });

  const user = meData?.data || currentUser;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Auth & Admin Role Guard: redirect to login if not authenticated or not ADMIN
  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.replace("/login");
      } else if (user && user.role !== "ADMIN") {
        dispatch(logoutAction());
        router.replace("/login?error=access_denied");
      }
    }
  }, [isInitialized, isAuthenticated, user, dispatch, router]);

  const confirmLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Force logout
    } finally {
      dispatch(logoutAction());
      setIsLogoutModalOpen(false);
      router.push("/login");
    }
  };

  // Helper to render dynamic avatar
  const renderUserAvatar = (size: "sm" | "md" = "md") => {
    const sizeClasses = size === "sm" ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm";
    const initial = (user?.name?.trim().charAt(0) || user?.email?.charAt(0) || "U").toUpperCase();

    return (
      <div
        className={`${sizeClasses} rounded-full overflow-hidden flex items-center justify-center shrink-0 bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-bold shadow-md relative`}
      >
        {user?.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.name || "User Avatar"}
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>
    );
  };

  // Show splash loader while checking auth or redirecting unauthenticated users
  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 flex items-center justify-center font-bold text-black text-xl shadow-xl shadow-amber-500/20 animate-pulse">
            Z
          </div>
          <div className="flex items-center gap-2 text-amber-400 text-sm font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Verifying session...</span>
          </div>
        </div>
      </div>
    );
  }

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
        {/* Brand Header with Frontend Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <ZevonLogo className="hover:opacity-90" showSubtitle={true} />
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
              {renderUserAvatar("md")}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name || "User"}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-amber-400 font-semibold uppercase">
                    {user?.role || "USER"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(true)}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
            <div className="flex h-18 items-center justify-between border-b border-white/10 px-4">
              <ZevonLogo showSubtitle={false} />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
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

            <div className="border-t border-white/10 p-4 space-y-3">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {renderUserAvatar("sm")}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {user?.name || "User"}
                  </p>
                  <span className="text-[10px] text-amber-400 font-semibold uppercase">
                    {user?.role || "USER"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsLogoutModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 cursor-pointer"
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
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
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

          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Currency Switcher */}
            <CurrencySwitcher />

            {/* Dynamic Notifications Dropdown */}
            <NotificationDropdown />

            {/* User Avatar & Logout Trigger */}
            <div className="flex items-center gap-2.5 sm:gap-3 pl-2 border-l border-white/10">
              <div className="flex items-center gap-2">
                {renderUserAvatar("sm")}
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-semibold text-white block leading-tight">
                    {user?.name || "User"}
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
                    {user?.role || "USER"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                title="Log Out of Dashboard"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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

      {/* ── Logout Confirmation Permission Modal ─────────────────── */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-white/10 p-6 shadow-2xl space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <LogOut className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Confirm Sign Out</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to exit your administrator session? You will need to log in again to access the enterprise dashboard.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-400">Account:</span>
              <span className="font-semibold text-white truncate max-w-[200px]">
                {user?.email || "admin@zevon.com"}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition cursor-pointer"
              >
                Stay Logged In
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
              >
                {isLoggingOut && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isLoggingOut ? "Signing Out..." : "Yes, Log Out"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
