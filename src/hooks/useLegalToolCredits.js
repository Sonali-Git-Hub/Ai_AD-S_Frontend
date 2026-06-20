import { useCallback } from 'react';
import useCreditStore from '../userStore/useCreditStore';

/**
 * Hook to manage credit deduction for AI Legal tools.
 * All AI Legal tools are now free under the plan-based system.
 * Returns true immediately.
 */
export const useLegalToolCredits = () => {
    const { isLoading } = useCreditStore();

    const handleToolUsage = useCallback(async (toolName, cost = 0) => {
        return true;
    }, []);

    return {
        handleToolUsage,
        currentCredits: 9999, // dummy value for legacy UI compatibility
        isLoading: false
    };
};
