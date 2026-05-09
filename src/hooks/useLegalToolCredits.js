import { useCallback } from 'react';
import useCreditStore from '../userStore/useCreditStore';
import { useToast } from '../Components/Toast/ToastContext';

/**
 * Hook to manage credit deduction for AI Legal tools.
 * Provides handleToolUsage helper.
 */
export const useLegalToolCredits = () => {
    const { currentCredits, deductCredits, isLoading } = useCreditStore();
    const toast = useToast();

    const handleToolUsage = useCallback(async (toolName, cost = 50) => {
        // 1. Initial check (optimistic)
        if (currentCredits < cost) {
            toast.error("Insufficient Credits");
            // Optionally open upgrade modal
            window.dispatchEvent(new CustomEvent('open_upgrade_modal'));
            return false;
        }

        // 2. Perform backend deduction
        const result = await deductCredits(toolName, cost, "AI Legal");

        if (result.success) {
            // Success! UI will auto-update via store
            return true;
        } else {
            if (result.code === 'OUT_OF_CREDITS') {
                toast.error("Insufficient Credits");
                window.dispatchEvent(new CustomEvent('open_upgrade_modal'));
            } else {
                toast.error(result.message || "Failed to process credit deduction");
            }
            return false;
        }
    }, [currentCredits, deductCredits, toast]);

    return {
        handleToolUsage,
        currentCredits,
        isLoading
    };
};
