import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getUserData } from '../userStore/userData';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
    const [subscription, setSubscription] = useState({
        plan: 'basic',
        planLimits: {
            imageCount: 5,
            videoCount: 5,
            deepSearchCount: 20,
            audioConvertCount: 10,
            documentConvertCount: 15,
            codeWriterCount: 50,
            chatCount: 100
        },
        usage: {
            imageCount: 0,
            videoCount: 0,
            deepSearchCount: 0,
            audioConvertCount: 0,
            documentConvertCount: 0,
            codeWriterCount: 0,
            chatCount: 0
        },
        isActive: true,
        loading: true
    });

    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    const fetchSubscriptionStatus = useCallback(async () => {
        const user = getUserData();
        if (!user || !user.token) {
            setSubscription(prev => ({ ...prev, loading: false }));
            return;
        }

        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL || '/api'}/user/subscription`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (response.data) {
                setSubscription(prev => ({
                    ...prev,
                    ...response.data,
                    // Ensure usage and planLimits are present if data is missing them
                    usage: response.data.usage || prev.usage,
                    planLimits: response.data.planLimits || prev.planLimits,
                    loading: false
                }));
            }
        } catch (error) {
            console.error("Error fetching subscription:", error);
            setSubscription(prev => ({ ...prev, loading: false }));
        }
    }, []);

    useEffect(() => {
        fetchSubscriptionStatus();
    }, [fetchSubscriptionStatus]);

    // Function to check limit on frontend before calling API
    const checkLimitLocally = (feature) => {
        const { usage, planLimits } = subscription;
        if (!usage || !planLimits) return true; // Fail safe

        const keyMap = {
            'image': 'imageCount',
            'video': 'videoCount',
            'deepSearch': 'deepSearchCount',
            'audio': 'audioConvertCount',
            'document': 'documentConvertCount',
            'codeWriter': 'codeWriterCount',
            'chat': 'chatCount'
        };
        const key = keyMap[feature] || feature;
        
        if (planLimits[key] !== undefined && planLimits[key] !== Infinity && usage[key] >= planLimits[key]) {
            setIsUpgradeModalOpen(true);
            return false;
        }
        return true;
    };

    return (
        <SubscriptionContext.Provider value={{
            ...subscription,
            isUpgradeModalOpen,
            setIsUpgradeModalOpen,
            checkLimitLocally,
            refreshSubscription: fetchSubscriptionStatus
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (!context) throw new Error("useSubscription must be used within SubscriptionProvider");
    return context;
};
