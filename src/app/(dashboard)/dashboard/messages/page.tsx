"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import {
  MessageSquare,
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  CheckCheck,
  Check,
  Search,
  RefreshCw,
  User as UserIcon,
  Sparkles,
  X,
  Download,
  Wifi,
  WifiOff,
  Clock,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useAppSelector } from "@/redux/hooks";
import { selectCurrentUser, selectAccessToken } from "@/redux/features/authSlice";
import {
  useGetChatRoomsQuery,
  useLazyGetChatHistoryQuery,
  useMarkChatAsReadMutation,
  useUploadChatAttachmentMutation,
} from "@/redux/api/chatApi";
import type { ChatMessage, ChatRoom, AttachmentType } from "@/types/chat";

// Helper to construct absolute URL for backend uploads
function getAssetUrl(path?: string | null): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.mirnoman.com";
  const cleanBase = backendUrl.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

// Relative time formatter
function formatTimeAgo(dateString?: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 30) return "Just now";
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Time formatter (e.g., 04:15 PM)
function formatMessageTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

// Date group header
function formatGroupDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

// Canned quick reply templates
const QUICK_RESPONSES = [
  "Hello! How can I assist you today?",
  "Your order is currently being processed and will dispatch soon.",
  "Could you please share your Order ID for verification?",
  "Thank you for contacting ZEVON luxury support!",
];

export default function MessagesPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const reduxToken = useAppSelector(selectAccessToken);

  // Active Selected Conversation State
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "unread">("all");

  // Socket Connection State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // RTK Queries & Mutations
  const {
    data: roomsResponse,
    isLoading: isLoadingRooms,
    refetch: refetchRooms,
  } = useGetChatRoomsQuery(undefined, {
    pollingInterval: 15000, // Background poll every 15s as fallback
  });

  const [triggerGetHistory, { isFetching: isFetchingHistory }] =
    useLazyGetChatHistoryQuery();

  const [markChatAsRead] = useMarkChatAsReadMutation();
  const [uploadAttachment] = useUploadChatAttachmentMutation();

  // Scroll to bottom smoothly
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // 1. Initialize WebSocket Connection
  useEffect(() => {
    let token = reduxToken;
    if (!token && typeof window !== "undefined") {
      token = localStorage.getItem("zevon_access_token");
    }

    if (!token) return;

    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.mirnoman.com";
    const socketUrl = `${backendUrl.replace(/\/+$/, "")}/chat`;

    const socketInstance: Socket = io(socketUrl, {
      auth: { token: `Bearer ${token}` },
      extraHeaders: { Authorization: `Bearer ${token}` },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketInstance.on("connect", () => {
      setSocketConnected(true);
    });

    socketInstance.on("disconnect", () => {
      setSocketConnected(false);
    });

    socketInstance.on("error", (err: unknown) => {
      console.error("Socket error:", err);
    });

    // Real-time incoming message in joined room
    socketInstance.on("new_message", (message: ChatMessage) => {
      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      // Refetch rooms to update snippets and counts
      refetchRooms();
    });

    // Global admin channel notification when any customer messages
    socketInstance.on("admin_incoming_message", (_payload: unknown) => {
      refetchRooms();
    });

    // Customer typing indicator
    socketInstance.on(
      "user_typing",
      (payload: {
        userId: string;
        name: string;
        role: string;
        isTyping: boolean;
      }) => {
        if (payload.role === "CUSTOMER") {
          setIsTyping(payload.isTyping);
          setTypingUser(payload.name);
          if (payload.isTyping) {
            if (typingTimeoutRef.current)
              clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
              setTypingUser(null);
            }, 3000);
          }
        }
      },
    );

    // Messages marked as read broadcast
    socketInstance.on("messages_read", () => {
      setMessages((prev) =>
        prev.map((msg) => ({ ...msg, isRead: true })),
      );
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [reduxToken, refetchRooms]);

  // Robust rooms extraction from API response
  const rooms: ChatRoom[] = useMemo(() => {
    const raw: any = roomsResponse?.data ?? roomsResponse;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "object" && "rooms" in raw && Array.isArray(raw.rooms)) {
      return raw.rooms;
    }
    return [];
  }, [roomsResponse]);

  // Filtered rooms list
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const customerName = r.customer?.name || "Customer";
      const customerEmail = r.customer?.email || "";
      const matchesSearch =
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter =
        filterType === "all" ? true : r.unreadCount > 0;
      return matchesSearch && matchesFilter;
    });
  }, [rooms, searchQuery, filterType]);

  // 2. Room Selection & History Fetching
  const handleSelectRoom = useCallback(
    async (room: ChatRoom) => {
      if (!room || !room.customerId) return;

      // Leave previous room if any
      if (socket && selectedRoom && selectedRoom.customerId !== room.customerId) {
        socket.emit("leave_room", { customerId: selectedRoom.customerId });
      }

      setSelectedRoom(room);
      setIsTyping(false);
      setTypingUser(null);
      setSelectedFile(null);
      setFilePreview(null);

      // Join new room via WebSocket
      if (socket) {
        socket.emit("join_room", { customerId: room.customerId });
        socket.emit("mark_read", { customerId: room.customerId });
      }

      // Call REST endpoint to mark as read in DB
      if (room.unreadCount > 0) {
        markChatAsRead(room.customerId);
      }

      // Fetch message history
      try {
        const res: any = await triggerGetHistory({
          customerId: room.customerId,
          limit: 100,
        }).unwrap();
        const rawHistory = res?.data ?? res;
        if (Array.isArray(rawHistory)) {
          setMessages(rawHistory);
        } else if (rawHistory && "messages" in rawHistory && Array.isArray(rawHistory.messages)) {
          setMessages(rawHistory.messages);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    },
    [socket, selectedRoom, markChatAsRead, triggerGetHistory],
  );

  // Auto-select first room on initial load
  useEffect(() => {
    if (!selectedRoom && rooms.length > 0 && rooms[0]) {
      handleSelectRoom(rooms[0]);
    }
  }, [rooms, selectedRoom, handleSelectRoom]);


  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom(false);
  }, [messages, scrollToBottom]);

  // 3. Typing event throttle
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket || !selectedRoom) return;

    socket.emit("typing", {
      roomId: selectedRoom.roomId,
      isTyping: true,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        roomId: selectedRoom.roomId,
        isTyping: false,
      });
    }, 2000);
  };

  // 4. File Attachment Picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 5. Send Message (with or without attachment)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedRoom || (!inputText.trim() && !selectedFile)) return;

    let attachmentUrl: string | undefined = undefined;
    let attachmentType: AttachmentType | undefined = undefined;

    // Upload attachment if any
    if (selectedFile) {
      try {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await uploadAttachment(formData).unwrap();
        if (uploadRes.data) {
          attachmentUrl = uploadRes.data.url;
          attachmentType = uploadRes.data.attachmentType;
        }
      } catch (uploadError) {
        console.error("Failed to upload attachment:", uploadError);
        alert("Attachment upload failed. Please try again.");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const content = inputText.trim() || undefined;

    // Emit socket message
    if (socket) {
      socket.emit("send_message", {
        roomId: selectedRoom.roomId,
        content,
        attachmentUrl,
        attachmentType,
      });
    }

    // Stop typing state
    if (socket && selectedRoom) {
      socket.emit("typing", {
        roomId: selectedRoom.roomId,
        isTyping: false,
      });
    }

    // Clear input & attachments
    setInputText("");
    removeSelectedFile();
  };


  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { [date: string]: ChatMessage[] } = {};
    messages.forEach((msg) => {
      const dateKey = formatGroupDate(msg.createdAt);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(msg);
    });
    return groups;
  }, [messages]);

  return (
    <div className="space-y-6 pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span>Customer Chat & Inquiries</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Real-time customer support & live socket messaging for ZEVON Luxury Store
          </p>
        </div>

        {/* Live Socket Connection Status Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              socketConnected
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            {socketConnected ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Wifi className="w-3.5 h-3.5" />
                <span>Live Socket Connected</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <WifiOff className="w-3.5 h-3.5" />
                <span>Reconnecting Gateway...</span>
              </>
            )}
          </div>

          <button
            onClick={() => refetchRooms()}
            className="p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-slate-300 hover:text-white transition-all shadow-sm"
            title="Refresh conversations"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoadingRooms ? "animate-spin text-amber-400" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Main Chat Grid (Left Sidebar + Chat Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] rounded-3xl bg-zinc-950/40 border border-white/10 p-2 sm:p-3 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Customer Threads List (4 cols)               */}
        {/* ========================================================= */}
        <div
          className={`lg:col-span-4 flex flex-col h-full rounded-2xl bg-zinc-900/70 border border-white/5 p-4 overflow-hidden ${
            selectedRoom ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-950/60 rounded-xl border border-white/5 mb-3 text-xs">
            <button
              onClick={() => setFilterType("all")}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                filterType === "all"
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All Threads ({roomsResponse?.data?.rooms?.length || 0})
            </button>
            <button
              onClick={() => setFilterType("unread")}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                filterType === "unread"
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Unread (
              {roomsResponse?.data?.rooms?.filter((r) => r.unreadCount > 0)
                .length || 0}
              )
            </button>
          </div>

          {/* Threads List Container */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {isLoadingRooms && (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-xs">Loading conversations...</span>
              </div>
            )}

            {!isLoadingRooms && filteredRooms.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center p-4 text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-xs font-semibold text-slate-300">
                  {searchQuery
                    ? "No conversations found"
                    : "No active customer chats"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
                  When customers send messages from the store or contact widget,
                  they will appear here in real time.
                </p>
              </div>
            )}

            {!isLoadingRooms &&
              filteredRooms.map((room) => {
                const isSelected = selectedRoom?.customerId === room.customerId;
                const hasUnread = room.unreadCount > 0;

                return (
                  <div
                    key={room.customerId}
                    onClick={() => handleSelectRoom(room)}
                    className={`group relative p-3.5 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-500/15 to-amber-500/5 border-amber-500/40 shadow-[0_0_16px_rgba(245,158,11,0.1)]"
                        : hasUnread
                          ? "bg-zinc-800/80 border-amber-500/30 hover:bg-zinc-800 hover:border-amber-500/50"
                          : "bg-zinc-950/40 border-white/5 hover:bg-zinc-900/60 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {room.customer.avatarUrl ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden relative border border-white/10">
                            <Image
                              src={getAssetUrl(room.customer.avatarUrl)}
                              alt={room.customer.name}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-black font-bold text-sm flex items-center justify-center shadow-inner">
                            {room.customer.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {/* Status dot */}
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4
                            className={`text-xs font-bold truncate ${
                              isSelected
                                ? "text-amber-300"
                                : hasUnread
                                  ? "text-white"
                                  : "text-slate-200"
                            }`}
                          >
                            {room.customer.name}
                          </h4>
                          <span
                            className={`text-[10px] whitespace-nowrap ${
                              hasUnread ? "text-amber-400 font-semibold" : "text-slate-500"
                            }`}
                          >
                            {formatTimeAgo(room.updatedAt)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 truncate mb-1">
                          {room.lastMessage?.attachmentUrl && !room.lastMessage?.content ? (
                            <span className="flex items-center gap-1 text-amber-400/90 italic">
                              <ImageIcon className="w-3 h-3" /> [Attachment Sent]
                            </span>
                          ) : (
                            room.lastMessage?.content || "No message content"
                          )}
                        </p>

                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500 truncate max-w-[140px]">
                            {room.customer.email}
                          </span>
                          {hasUnread && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-extrabold text-[10px] shadow-sm animate-pulse">
                              {room.unreadCount} new
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Active Chat Conversation (8 cols)           */}
        {/* ========================================================= */}
        <div
          className={`lg:col-span-8 flex flex-col h-full rounded-2xl bg-zinc-900/90 border border-white/5 backdrop-blur-xl overflow-hidden ${
            !selectedRoom ? "hidden lg:flex" : "flex"
          }`}
        >
          {selectedRoom ? (
            <>
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-white/10 bg-zinc-950/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  {/* Customer Avatar */}
                  <div className="relative">
                    {selectedRoom.customer.avatarUrl ? (
                      <div className="w-11 h-11 rounded-full overflow-hidden relative border border-amber-500/30">
                        <Image
                          src={getAssetUrl(selectedRoom.customer.avatarUrl)}
                          alt={selectedRoom.customer.name}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black font-bold text-sm flex items-center justify-center">
                        {selectedRoom.customer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">
                        {selectedRoom.customer.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold">
                        Customer
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{selectedRoom.customer.email}</span>
                      {selectedRoom.customer.phone && (
                        <>
                          <span>•</span>
                          <span>{selectedRoom.customer.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Header Actions */}
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-[11px] text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Room: {selectedRoom.roomId}
                  </span>
                </div>
              </div>

              {/* Chat Message Feed Area */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-5 custom-scrollbar bg-gradient-to-b from-zinc-950/20 via-zinc-900/10 to-zinc-950/30">
                {isFetchingHistory && messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                    <span className="text-xs">Fetching message history...</span>
                  </div>
                )}

                {messages.length === 0 && !isFetchingHistory && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                      <Sparkles className="w-6 h-6 text-amber-400/80" />
                    </div>
                    <p className="text-xs font-semibold text-slate-300">
                      Beginning of conversation
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-[240px]">
                      Send a message below to start assisting {selectedRoom.customer.name}.
                    </p>
                  </div>
                )}

                {/* Grouped Messages by Day */}
                {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
                  <div key={dateLabel} className="space-y-4">
                    {/* Date Separator */}
                    <div className="flex items-center justify-center my-3">
                      <span className="px-3 py-1 rounded-full bg-zinc-950/80 border border-white/5 text-[10px] font-semibold text-slate-400 shadow-sm">
                        {dateLabel}
                      </span>
                    </div>

                    {/* Messages in Group */}
                    {msgs.map((msg) => {
                      const isAdmin =
                        msg.sender?.role === "ADMIN" ||
                        msg.sender?.role === "MANAGER" ||
                        msg.senderId === currentUser?.id;

                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                            isAdmin ? "ml-auto flex-row-reverse" : "mr-auto"
                          }`}
                        >
                          {/* Sender Avatar */}
                          <div className="flex-shrink-0 self-end">
                            {isAdmin ? (
                              <div className="w-7 h-7 rounded-full bg-amber-500 text-black font-bold text-xs flex items-center justify-center shadow-md">
                                {currentUser?.name?.charAt(0).toUpperCase() || "A"}
                              </div>
                            ) : msg.sender?.avatarUrl ? (
                              <div className="w-7 h-7 rounded-full overflow-hidden relative border border-white/10">
                                <Image
                                  src={getAssetUrl(msg.sender.avatarUrl)}
                                  alt={msg.sender.name || "Customer"}
                                  fill
                                  unoptimized
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-zinc-800 text-slate-300 font-bold text-xs flex items-center justify-center border border-white/10">
                                {selectedRoom.customer.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Message Content Bubble */}
                          <div className="space-y-1">
                            <div
                              className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                                isAdmin
                                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium rounded-br-none shadow-[0_4px_14px_rgba(245,158,11,0.2)]"
                                  : "bg-zinc-800/90 text-slate-100 rounded-bl-none border border-white/10 shadow-md"
                              }`}
                            >
                              {/* Attachment Rendering */}
                              {msg.attachmentUrl && (
                                <div className="mb-2">
                                  {msg.attachmentType === "IMAGE" ||
                                  msg.attachmentUrl.match(/\.(jpeg|jpg|png|webp|gif)$/i) ? (
                                    <div
                                      onClick={() =>
                                        setLightboxImage(
                                          getAssetUrl(msg.attachmentUrl),
                                        )
                                      }
                                      className="relative w-48 h-36 rounded-xl overflow-hidden border border-black/20 cursor-pointer group"
                                    >
                                      <Image
                                        src={getAssetUrl(msg.attachmentUrl)}
                                        alt="Chat Attachment"
                                        fill
                                        unoptimized
                                        className="object-cover group-hover:scale-105 transition-transform"
                                      />
                                    </div>
                                  ) : (
                                    <a
                                      href={getAssetUrl(msg.attachmentUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                                        isAdmin
                                          ? "bg-black/10 border-black/20 text-black hover:bg-black/20"
                                          : "bg-zinc-900 border-white/10 text-white hover:bg-zinc-950"
                                      } transition-colors`}
                                    >
                                      <FileText className="w-4 h-4 flex-shrink-0" />
                                      <span className="truncate text-xs font-semibold">
                                        View Attached Document
                                      </span>
                                      <Download className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
                                    </a>
                                  )}
                                </div>
                              )}

                              {/* Text Message */}
                              {msg.content && (
                                <p className="whitespace-pre-wrap break-words">
                                  {msg.content}
                                </p>
                              )}
                            </div>

                            {/* Timestamp & Read Indicator */}
                            <div
                              className={`flex items-center gap-1.5 text-[10px] text-slate-500 px-1 ${
                                isAdmin ? "justify-end" : "justify-start"
                              }`}
                            >
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {isAdmin && (
                                <span>
                                  {msg.isRead ? (
                                    <CheckCheck className="w-3 h-3 text-amber-400" />
                                  ) : (
                                    <Check className="w-3 h-3 text-slate-500" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Customer Typing Bubble Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-3 mr-auto">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-slate-300">
                      {selectedRoom.customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="px-4 py-2.5 rounded-2xl bg-zinc-800/80 border border-white/5 text-slate-400 text-xs flex items-center gap-2">
                      <span>{typingUser || "Customer"} is typing</span>
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Canned Responses Bar */}
              <div className="px-4 py-2 bg-zinc-950/70 border-t border-white/5 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1 flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Quick replies:
                </span>
                {QUICK_RESPONSES.map((qr, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputText(qr)}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-slate-300 hover:text-white text-[11px] whitespace-nowrap transition-colors flex-shrink-0"
                  >
                    {qr}
                  </button>
                ))}
              </div>

              {/* Selected File Attachment Preview (if any) */}
              {selectedFile && (
                <div className="px-4 py-2.5 bg-amber-500/10 border-t border-amber-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {filePreview ? (
                      <div className="w-8 h-8 rounded-lg overflow-hidden relative border border-amber-500/40 flex-shrink-0">
                        <Image
                          src={filePreview}
                          alt="Upload Preview"
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <FileText className="w-6 h-6 text-amber-400 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeSelectedFile}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Input Area */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 bg-zinc-950/80 border-t border-white/10 flex items-center gap-2"
              >
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                  className="hidden"
                />

                {/* Attachment Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-slate-400 hover:text-amber-400 transition-colors"
                  title="Attach Image or PDF"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Text Input */}
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder={`Reply to ${selectedRoom.customer.name}...`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={
                    (!inputText.trim() && !selectedFile) ||
                    isUploading ||
                    !socketConnected
                  }
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
                >
                  {isUploading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">
                    {isUploading ? "Uploading..." : "Send"}
                  </span>
                </button>
              </form>
            </>
          ) : (
            // No Room Selected Placeholder
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-500">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Select a customer conversation
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                Choose an active customer inquiry from the left thread list to
                view their message history and reply in real time.
              </p>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950/80 border border-white/10 text-xs text-slate-400">
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Socket Gateway ready for live incoming messages</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-zinc-900 border border-white/20 text-white hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-full">
              <Image
                src={lightboxImage}
                alt="Enlarged Attachment"
                fill
                unoptimized
                className="object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
