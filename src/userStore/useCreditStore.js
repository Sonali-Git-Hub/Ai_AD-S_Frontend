import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiService } from '../services/apiService';

/**
 * Global Quota Store — replaces the old Credit Store.
 * Tracks the user's current plan and daily/lifetime usage quotas.
 *
 * LEGACY: The old credit fields (currentCredits, deductCredits, etc.) are stubbed
 * for backward compatibility so components that still reference them don't crash.
 */
const useCreditStore = create(
  persist(
    (set, get) => ({
      // ── QUOTA STATE ───────────────────────────────────────────────────────────
      planKey: 'free',           // 'free' | 'starter' | 'pro' | 'business' | 'admin'
      planExpired: false,
      limits: {
        chat: 100,
        chatScope: 'total',
        images: 0,
        carousels: 0,
        videos: 0,
        editImage: false,
        cashflow: false,
      },
      usage: {
        chat: 0,
        images: 0,
        carousels: 0,
        videos: 0,
      },
      planActivatedAt: null,
      renewalDate: null,
      isLoading: false,

      // ── LEGACY COMPAT FIELDS (so old components don't crash) ─────────────────
      currentCredits: 0,
      recentTransactions: [],

      // ── SYNC FROM BACKEND ─────────────────────────────────────────────────────
      syncCredits: async () => {
        try {
          const response = await apiService.getQuotaStatus();
          if (response.success) {
            set({
              planKey: response.planKey || 'free',
              planExpired: response.planExpired || false,
              limits: response.limits || {},
              usage: response.usage || {},
              planActivatedAt: response.planActivatedAt,
              renewalDate: response.renewalDate,
              currentCredits: 0, // legacy stub
            });
          }
          return response;
        } catch (error) {
          console.error('[QuotaStore] Sync failed:', error);
          return { success: false };
        }
      },

      // ── OPTIMISTIC LOCAL INCREMENT (called after successful action) ───────────
      incrementLocal: (type) => {
        set((state) => ({
          usage: {
            ...state.usage,
            [type]: (state.usage[type] || 0) + 1,
          }
        }));
      },

      // ── CHECK IF ACTION IS WITHIN PLAN LIMITS (client-side pre-check) ────────
      canPerform: (action) => {
        const { planKey, limits, usage, planExpired } = get();
        if (planKey === 'admin') return { allowed: true };
        if (planExpired) return { allowed: false, reason: 'Your free plan has expired. Please upgrade to continue.' };

        switch (action) {
          case 'chat':
            if (limits.chatScope === 'unlimited') return { allowed: true };
            if (limits.chat !== -1 && usage.chat >= limits.chat) {
              return { allowed: false, reason: `You've used all ${limits.chat} messages on the Free plan. Upgrade for unlimited conversations.` };
            }
            return { allowed: true };
          case 'generate_image':
            if (!limits.images || limits.images === 0) return { allowed: false, reason: 'Image generation is not available on your current plan. Upgrade to Pro (₹999/mo).' };
            if (usage.images >= limits.images) return { allowed: false, reason: `You've used your ${limits.images} images for today. Your limit resets tomorrow.` };
            return { allowed: true };
          case 'edit_image':
            if (!limits.editImage) return { allowed: false, reason: 'Image editing requires Starter plan (₹499/mo) or higher.' };
            return { allowed: true };
          case 'generate_carousel':
            if (!limits.carousels || limits.carousels === 0) return { allowed: false, reason: 'Carousel generation requires Pro plan (₹999/mo) or higher.' };
            if (usage.carousels >= limits.carousels) return { allowed: false, reason: `You've used your ${limits.carousels} carousel${limits.carousels > 1 ? 's' : ''} for today.` };
            return { allowed: true };
          case 'generate_video':
            if (!limits.videos || limits.videos === 0) return { allowed: false, reason: 'Video generation requires Business plan (₹2499/mo).' };
            if (usage.videos >= limits.videos) return { allowed: false, reason: `You've used your ${limits.videos} videos for today.` };
            return { allowed: true };
          case 'cashflow':
            if (!limits.cashflow) return { allowed: false, reason: 'CashFlow Explorer requires Starter plan (₹499/mo) or higher.' };
            return { allowed: true };
          default:
            return { allowed: true };
        }
      },

      // ── FETCH HISTORY (legacy stub) ──────────────────────────────────────────
      fetchHistory: async () => ({ success: true, logs: [] }),

      // ── LEGACY DEDUCT CREDITS (stub — credits no longer used) ────────────────
      deductCredits: async (toolName, amount = 0, category = 'General') => {
        console.log('[QuotaStore] deductCredits called (no-op, credits replaced by quota system)');
        return { success: true, credits: 0 };
      },

      // ── LEGACY HELPERS ────────────────────────────────────────────────────────
      setCredits: (credits) => set({ currentCredits: 0 }),
      addCredits: (amount) => set({ currentCredits: 0 }),
      addTransaction: (transaction) => {},
    }),
    {
      name: 'aisa-quota-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        planKey: state.planKey,
        planExpired: state.planExpired,
        limits: state.limits,
        usage: state.usage,
        planActivatedAt: state.planActivatedAt,
        renewalDate: state.renewalDate,
        currentCredits: 0,    // keep for legacy compat
        recentTransactions: [],
      }),
    }
  )
);

export default useCreditStore;
