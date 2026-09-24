export type AttachmentType = "IMAGE" | "PDF" | "FILE";

export interface ChatSender {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  customerId: string;
  content?: string | null;
  attachmentUrl?: string | null;
  attachmentType?: AttachmentType | null;
  isRead: boolean;
  createdAt: string;
  sender?: ChatSender;
}

export interface ChatCustomerInfo {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role?: string;
}

export interface ChatRoom {
  roomId: string;
  customerId: string;
  customer: ChatCustomerInfo;
  lastMessage?: ChatMessage | null;
  unreadCount: number;
  updatedAt: string;
}

export interface ChatRoomsResponse {
  rooms: ChatRoom[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    roomId: string;
    customerId: string;
  };
}

export interface UploadChatResponse {
  url: string;
  originalName: string;
  mimetype: string;
  size: number;
  attachmentType: AttachmentType;
}

export interface ChatHistoryQuery {
  page?: number;
  limit?: number;
}
