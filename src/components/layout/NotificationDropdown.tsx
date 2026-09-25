"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Package,
  AlertTriangle,
  RotateCcw,
  Star,
  CheckCheck,
  ExternalLink,
  Loader2,
  X,
  Info,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useGetUnreadNotificationsCountQuery,
  useMarkNotificationsAsReadMutation,
  type NotificationItem,
} from "@/redux/api/notificationsApi";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notifRes, isLoading } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000, // auto-refresh every 30s
  });
  const { data: countRes } = useGetUnreadNotificationsCountQuery(undefined, {
    pollingInterval: 15000,
  });
  const [markAsRead, { isLoading: isMarking }] = useMarkNotificationsAsReadMutation();

  const notifications: NotificationItem[] = notifRes?.data || [];
  const unreadCount = countRes?.data?.unreadCount ?? notifications.filter((n) => !n.isRead).length;

  // Filter notifications
  const displayedNotifications = notifications.filter((n) =>
    filter === "UNREAD" ? !n.isRead : true
  );

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAsRead({ all: true }).unwrap();
    } catch {}
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await markAsRead({ id: item.id }).unwrap();
      } catch {}
    }
    setIsOpen(false);
  };

  const getTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "ORDER":
        return <Package className="w-4 h-4 text-emerald-400" />;
      case "STOCK":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "RETURN":
        return <RotateCcw className="w-4 h-4 text-rose-400" />;
      case "REVIEW":
        return <Star className="w-4 h-4 text-yellow-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 ring-2 ring-zinc-950"></span>
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isMarking}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-white/5 px-4 pt-2 gap-2 bg-zinc-900/40">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`pb-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
                filter === "ALL"
                  ? "border-amber-400 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("UNREAD")}
              className={`pb-2 text-xs font-semibold border-b-2 transition cursor-pointer ${
                filter === "UNREAD"
                  ? "border-amber-400 text-amber-400"
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                <span className="text-xs">Loading notifications...</span>
              </div>
            ) : displayedNotifications.length > 0 ? (
              displayedNotifications.map((n) => (
                <Link
                  key={n.id}
                  href={n.link}
                  onClick={() => handleItemClick(n)}
                  className={`flex items-start gap-3 p-3.5 hover:bg-white/5 transition group cursor-pointer ${
                    !n.isRead ? "bg-amber-500/5" : ""
                  }`}
                >
                  <div className="p-2 rounded-xl bg-zinc-900 border border-white/5 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    {getTypeIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <h4
                        className={`text-xs font-semibold truncate ${
                          !n.isRead ? "text-white font-bold" : "text-slate-300"
                        }`}
                      >
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono block pt-0.5">
                      {new Date(n.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                <Bell className="w-6 h-6 mx-auto text-slate-700 mb-1" />
                <p>No notifications to show.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
