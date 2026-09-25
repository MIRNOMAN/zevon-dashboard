import { baseApi, type ApiResponse } from "./baseApi";
import type {
  GiftCardItem,
  CreateGiftCardInput,
  GiftCardQueryParams,
} from "@/types/giftCards";
import type { GiftCardsResponseData } from "./giftCardsApi";

export type CustomerTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

export interface TierConfigItem {
  name: string;
  minSpend: number;
  nextTierSpend: number | null;
  multiplier: number;
  color: string;
}

export interface LoyaltyTopMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string | null;
  tier: CustomerTier;
  pointsBalance: number;
  lifetimeSpent: number;
  createdAt: string;
}

export interface PointTransactionItem {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  type: string;
  description: string;
  referenceId?: string | null;
  createdAt: string;
}

export interface LoyaltyOverviewData {
  tierStats: {
    totalMembers: number;
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
  };
  tierConfig: Record<CustomerTier, TierConfigItem>;
  pointsStats: {
    pointsInCirculation: number;
    pointsInCirculationBDT: number;
    lifetimePointsIssued: number;
    lifetimeSpendBDT: number;
  };
  referralStats: {
    totalReferrals: number;
    rewardedReferrals: number;
    pendingReferrals: number;
    totalRewardsBDT: number;
  };
  topMembers: LoyaltyTopMember[];
  recentTransactions: PointTransactionItem[];
}

export interface LoyaltyMemberItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  tier: CustomerTier;
  pointsBalance: number;
  lifetimePointsEarned: number;
  lifetimeSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyMembersResponseData {
  members: LoyaltyMemberItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AdjustPointsRequest {
  userId: string;
  amount: number;
  reason: string;
  type?: string;
}

export interface AdjustPointsResponseData {
  userId: string;
  adjustedAmount: number;
  newBalance: number;
  reason: string;
}

export interface LoyaltyMembersQueryParams {
  page?: number;
  limit?: number;
  tier?: CustomerTier;
  search?: string;
}

export const loyaltyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Get Admin Loyalty & Referral Overview Stats
    getLoyaltyOverview: builder.query<ApiResponse<LoyaltyOverviewData>, void>({
      query: () => ({
        url: "/loyalty/admin/overview",
        method: "GET",
      }),
      providesTags: ["Loyalty"],
    }),

    // 2. Get Paginated Loyalty Members List
    getLoyaltyMembers: builder.query<
      ApiResponse<LoyaltyMembersResponseData>,
      LoyaltyMembersQueryParams | void
    >({
      query: (params) => ({
        url: "/loyalty/admin/members",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["Loyalty"],
    }),

    // 3. Admin Adjust Customer Points (Credit/Debit)
    adjustUserPoints: builder.mutation<
      ApiResponse<AdjustPointsResponseData>,
      AdjustPointsRequest
    >({
      query: (body) => ({
        url: "/loyalty/admin/adjust",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Loyalty", "User"],
    }),

    // 4. Get Gift Cards List
    getAdminGiftCards: builder.query<
      ApiResponse<GiftCardsResponseData | GiftCardItem[]>,
      GiftCardQueryParams | void
    >({
      query: (params) => ({
        url: "/gift-cards",
        method: "GET",
        params: params || undefined,
      }),
      providesTags: ["GiftCard"],
    }),

    // 5. Issue Gift Card
    createAdminGiftCard: builder.mutation<
      ApiResponse<GiftCardItem>,
      CreateGiftCardInput
    >({
      query: (body) => ({
        url: "/gift-cards",
        method: "POST",
        body,
      }),
      invalidatesTags: ["GiftCard"],
    }),
  }),
});

export const {
  useGetLoyaltyOverviewQuery,
  useGetLoyaltyMembersQuery,
  useAdjustUserPointsMutation,
  useGetAdminGiftCardsQuery,
  useCreateAdminGiftCardMutation,
} = loyaltyApi;
