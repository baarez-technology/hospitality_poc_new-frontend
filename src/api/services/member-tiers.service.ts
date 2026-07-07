/**
 * Member Tiers Service
 * Handles loyalty program member tier operations for the CRM AI system
 */
import { apiClient as api } from '../client';

// Types
export interface MemberTier {
  id: number;
  name: string;
  slug: string;
  description?: string;
  level: number;
  color: string;
  icon?: string;
  min_points: number;
  max_points?: number;
  min_stays?: number;
  min_spend?: number;
  benefits: TierBenefit[];
  discount_percentage: number;
  points_multiplier: number;
  member_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface TierBenefit {
  id?: number;
  name: string;
  description: string;
  category: 'discount' | 'upgrade' | 'service' | 'amenity' | 'exclusive' | 'priority';
  value?: string;
  icon?: string;
  is_featured: boolean;
}

export interface TierMember {
  member_id: number;
  guest_id: number;
  guest_name: string;
  email: string;
  tier_id: number;
  tier_name: string;
  current_points: number;
  lifetime_points: number;
  total_stays: number;
  total_spend: number;
  member_since: string;
  tier_achieved_at: string;
  next_tier?: {
    name: string;
    points_needed: number;
    stays_needed?: number;
    spend_needed?: number;
  };
  expiring_points?: {
    amount: number;
    expiry_date: string;
  };
  status: 'active' | 'inactive' | 'suspended';
}

export interface TierStats {
  total_members: number;
  active_members: number;
  tier_distribution: {
    tier_id: number;
    tier_name: string;
    member_count: number;
    percentage: number;
  }[];
  total_points_issued: number;
  total_points_redeemed: number;
  average_member_value: number;
  new_members_this_month: number;
  tier_upgrades_this_month: number;
  tier_downgrades_this_month: number;
}

export interface CreateTierRequest {
  name: string;
  description?: string;
  level: number;
  color: string;
  icon?: string;
  min_points: number;
  max_points?: number;
  min_stays?: number;
  min_spend?: number;
  benefits: Omit<TierBenefit, 'id'>[];
  discount_percentage: number;
  points_multiplier: number;
  is_active?: boolean;
}

export interface UpdateTierRequest {
  name?: string;
  description?: string;
  level?: number;
  color?: string;
  icon?: string;
  min_points?: number;
  max_points?: number;
  min_stays?: number;
  min_spend?: number;
  benefits?: Omit<TierBenefit, 'id'>[];
  discount_percentage?: number;
  points_multiplier?: number;
  is_active?: boolean;
}

export interface PointsTransaction {
  id: number;
  member_id: number;
  guest_name?: string;
  transaction_type: 'earn' | 'redeem' | 'expire' | 'adjust' | 'bonus' | 'transfer';
  points: number;
  balance_after: number;
  description: string;
  reference_type?: 'booking' | 'review' | 'referral' | 'promotion' | 'manual';
  reference_id?: number;
  created_at: string;
  created_by?: string;
}

export interface MemberListParams {
  tier_id?: number;
  status?: 'active' | 'inactive' | 'suspended';
  search?: string;
  sort_by?: 'points' | 'stays' | 'spend' | 'member_since';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface AdjustPointsRequest {
  member_id: number;
  points: number;
  transaction_type: 'earn' | 'redeem' | 'adjust' | 'bonus';
  description: string;
  reference_type?: string;
  reference_id?: number;
}

// API Service
class MemberTiersService {
  private baseUrl = '/api/v1/crm-ai/member-tiers';

  // Tier CRUD Operations

  /**
   * Get all member tiers
   */
  async getTiers(includeInactive = false): Promise<MemberTier[]> {
    const queryParams = includeInactive ? '?include_inactive=true' : '';
    const response = await api.get(`${this.baseUrl}${queryParams}`);
    return response.data.data || response.data;
  }

  /**
   * Get a specific tier by ID
   */
  async getTier(tierId: number): Promise<MemberTier> {
    const response = await api.get(`${this.baseUrl}/${tierId}`);
    return response.data.data || response.data;
  }

  /**
   * Get tier by slug
   */
  async getTierBySlug(slug: string): Promise<MemberTier> {
    const response = await api.get(`${this.baseUrl}/slug/${slug}`);
    return response.data.data || response.data;
  }

  /**
   * Create a new tier
   */
  async createTier(request: CreateTierRequest): Promise<MemberTier> {
    const response = await api.post(`${this.baseUrl}`, request);
    return response.data.data || response.data;
  }

  /**
   * Update an existing tier
   */
  async updateTier(tierId: number, updates: UpdateTierRequest): Promise<MemberTier> {
    const response = await api.patch(`${this.baseUrl}/${tierId}`, updates);
    return response.data.data || response.data;
  }

  /**
   * Delete a tier
   */
  async deleteTier(tierId: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${tierId}`);
  }

  /**
   * Reorder tiers (update levels)
   */
  async reorderTiers(tierIds: number[]): Promise<MemberTier[]> {
    const response = await api.post(`${this.baseUrl}/reorder`, { tier_ids: tierIds });
    return response.data.data || response.data;
  }

  // Member Operations

  /**
   * Get members list with filtering
   */
  async getMembers(params: MemberListParams = {}): Promise<{ count: number; members: TierMember[] }> {
    const queryParams = new URLSearchParams();
    if (params.tier_id) queryParams.append('tier_id', params.tier_id.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await api.get(`${this.baseUrl}/members?${queryParams}`);
    return response.data.data || response.data;
  }

  /**
   * Get a specific member
   */
  async getMember(memberId: number): Promise<TierMember> {
    const response = await api.get(`${this.baseUrl}/members/${memberId}`);
    return response.data.data || response.data;
  }

  /**
   * Get member by guest ID
   */
  async getMemberByGuestId(guestId: number): Promise<TierMember> {
    const response = await api.get(`${this.baseUrl}/members/guest/${guestId}`);
    return response.data.data || response.data;
  }

  /**
   * Get members by tier
   */
  async getMembersByTier(tierId: number, limit = 50): Promise<TierMember[]> {
    const response = await api.get(`${this.baseUrl}/${tierId}/members?limit=${limit}`);
    return response.data.data || response.data;
  }

  /**
   * Enroll a guest in the loyalty program
   */
  async enrollMember(guestId: number, initialTierId?: number): Promise<TierMember> {
    const response = await api.post(`${this.baseUrl}/members/enroll`, {
      guest_id: guestId,
      tier_id: initialTierId
    });
    return response.data.data || response.data;
  }

  /**
   * Update member status
   */
  async updateMemberStatus(
    memberId: number,
    status: 'active' | 'inactive' | 'suspended',
    reason?: string
  ): Promise<TierMember> {
    const response = await api.patch(`${this.baseUrl}/members/${memberId}/status`, {
      status,
      reason
    });
    return response.data.data || response.data;
  }

  /**
   * Manually upgrade/downgrade member tier
   */
  async changeMemberTier(
    memberId: number,
    newTierId: number,
    reason?: string
  ): Promise<TierMember> {
    const response = await api.post(`${this.baseUrl}/members/${memberId}/change-tier`, {
      tier_id: newTierId,
      reason
    });
    return response.data.data || response.data;
  }

  // Points Operations

  /**
   * Adjust member points
   */
  async adjustPoints(request: AdjustPointsRequest): Promise<PointsTransaction> {
    const response = await api.post(`${this.baseUrl}/points/adjust`, request);
    return response.data.data || response.data;
  }

  /**
   * Get points transaction history for a member
   */
  async getPointsHistory(
    memberId: number,
    limit = 50,
    transactionType?: string
  ): Promise<{ count: number; transactions: PointsTransaction[] }> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    if (transactionType) queryParams.append('transaction_type', transactionType);

    const response = await api.get(`${this.baseUrl}/members/${memberId}/points/history?${queryParams}`);
    return response.data.data || response.data;
  }

  /**
   * Get member points balance
   */
  async getPointsBalance(memberId: number): Promise<{
    current_points: number;
    lifetime_points: number;
    pending_points: number;
    expiring_soon: { amount: number; expiry_date: string } | null;
  }> {
    const response = await api.get(`${this.baseUrl}/members/${memberId}/points/balance`);
    return response.data.data || response.data;
  }

  /**
   * Award bonus points
   */
  async awardBonusPoints(
    memberId: number,
    points: number,
    reason: string
  ): Promise<PointsTransaction> {
    const response = await api.post(`${this.baseUrl}/members/${memberId}/points/bonus`, {
      points,
      reason
    });
    return response.data.data || response.data;
  }

  /**
   * Redeem points
   */
  async redeemPoints(
    memberId: number,
    points: number,
    redemptionType: string,
    redemptionId?: number
  ): Promise<PointsTransaction> {
    const response = await api.post(`${this.baseUrl}/members/${memberId}/points/redeem`, {
      points,
      redemption_type: redemptionType,
      redemption_id: redemptionId
    });
    return response.data.data || response.data;
  }

  // Statistics & Reports

  /**
   * Get tier statistics
   */
  async getTierStats(): Promise<TierStats> {
    const response = await api.get(`${this.baseUrl}/stats`);
    return response.data.data || response.data;
  }

  /**
   * Get tier eligibility check for a guest
   */
  async checkTierEligibility(guestId: number): Promise<{
    current_tier: MemberTier | null;
    eligible_tier: MemberTier;
    qualifications: {
      points: { current: number; required: number; met: boolean };
      stays?: { current: number; required: number; met: boolean };
      spend?: { current: number; required: number; met: boolean };
    };
  }> {
    const response = await api.get(`${this.baseUrl}/eligibility/${guestId}`);
    return response.data.data || response.data;
  }

  /**
   * Run tier evaluation for all members (batch job)
   */
  async evaluateAllTiers(): Promise<{
    processed: number;
    upgrades: number;
    downgrades: number;
    unchanged: number;
  }> {
    const response = await api.post(`${this.baseUrl}/evaluate-all`);
    return response.data.data || response.data;
  }

  /**
   * Get benefits comparison across tiers
   */
  async getBenefitsComparison(): Promise<{
    tiers: { id: number; name: string; level: number }[];
    benefits: { name: string; category: string; availability: Record<number, boolean | string> }[];
  }> {
    const response = await api.get(`${this.baseUrl}/benefits/comparison`);
    return response.data.data || response.data;
  }
}

export const memberTiersService = new MemberTiersService();
export default memberTiersService;
