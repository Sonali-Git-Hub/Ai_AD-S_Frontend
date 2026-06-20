import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Zap, AlertTriangle, Clock, ImageIcon, Video, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserData } from '../userStore/userData';

// Map quota actions to user-friendly feature bullets
const PLAN_FEATURES_MAP = {
    'PLAN_EXPIRED': ['Restore access to all AISA features', 'Unlimited AI Chat', 'Image & Video Generation', 'AI Ads Agent'],
    'chat':          ['Unlimited AI Conversations', 'Image Generation (Pro+)', 'AI Ads Agent', 'CashFlow Explorer'],
    'generate_image':['5–10 Images per day (HD & Ultra)', 'Edit & Transform Images', 'AI Carousel Generation', 'AI Video Generation'],
    'edit_image':    ['Image Editing & Transformations', 'Unlimited AI Chat', 'Image Generation', 'AI Ads Agent'],
    'generate_carousel': ['1–5 AI Carousels per day', '5–10 Images per day', 'AI Video Generation', 'AI Ads Agent'],
    'generate_video':    ['5 Videos per day (Standalone)', '10 Images per day', 'AI Carousels', 'Priority Support'],
    'cashflow':          ['CashFlow Explorer', 'Unlimited AI Chat', 'Image & Video Generation', 'AI Ads Agent'],
    default:             ['Unlimited AI Chat', 'Image & Video Generation', 'AI Ads Agent', 'CashFlow Explorer'],
};

const ICON_MAP = {
    'chat': MessageSquare,
    'generate_image': ImageIcon,
    'generate_video': Video,
    'PLAN_EXPIRED': Clock,
};

const CreditUpsellPopup = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [popupData, setPopupData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const isAdmin = () => {
            const user = getUserData();
            return user && user.email && user.email.toLowerCase() === 'admin@uwo24.com';
        };

        // ── NEW: quota_exceeded event (from new quota system) ─────────────────
        const handleQuotaExceeded = (e) => {
            if (isAdmin()) return;
            const { code, toolName, customMessage, used, limit } = e.detail || {};

            let title = 'Plan Limit Reached';
            let description = customMessage || 'You have reached your plan limit. Upgrade to continue using AISA.';

            if (code === 'PLAN_EXPIRED') {
                title = 'Your Free Plan Has Expired';
                description = 'Your 3-month free period has ended. Upgrade to continue using AISA services.';
            } else if (code === 'QUOTA_EXCEEDED' && limit) {
                title = 'Daily Limit Reached';
                description = customMessage || `You've used all ${limit} allowed today. Upgrade for higher limits.`;
            } else if (code === 'PLAN_RESTRICTED') {
                title = 'Feature Not Available';
            }

            // Determine feature key from toolName/code
            const action = toolName?.includes('video') ? 'generate_video'
                : toolName?.includes('image') ? 'generate_image'
                : toolName?.includes('carousel') ? 'generate_carousel'
                : code === 'PLAN_EXPIRED' ? 'PLAN_EXPIRED'
                : 'default';

            setPopupData({ title, description, action, code });
            setIsOpen(true);
        };

        // ── LEGACY: out_of_credits event (backward compat) ────────────────────
        const handleOutOfCredits = () => {
            if (isAdmin()) return;
            setPopupData({
                title: 'Plan Limit Reached',
                description: 'You have reached your plan limit. Upgrade to continue using AISA.',
                action: 'default',
                code: 'OUT_OF_CREDITS',
            });
            setIsOpen(true);
        };

        // ── LEGACY: premium_required event ────────────────────────────────────
        const handlePremiumRequired = (e) => {
            if (isAdmin()) return;
            const { customMessage } = e.detail || {};
            setPopupData({
                title: 'Upgrade Required',
                description: customMessage || 'This feature requires a paid plan. Upgrade to continue.',
                action: 'default',
                code: 'PREMIUM_ONLY',
            });
            setIsOpen(true);
        };

        window.addEventListener('quota_exceeded', handleQuotaExceeded);
        window.addEventListener('out_of_credits', handleOutOfCredits);
        window.addEventListener('premium_required', handlePremiumRequired);

        return () => {
            window.removeEventListener('quota_exceeded', handleQuotaExceeded);
            window.removeEventListener('out_of_credits', handleOutOfCredits);
            window.removeEventListener('premium_required', handlePremiumRequired);
        };
    }, []);

    if (!isOpen) return null;

    const features = PLAN_FEATURES_MAP[popupData?.action] || PLAN_FEATURES_MAP.default;
    const IconComponent = ICON_MAP[popupData?.action] || AlertTriangle;
    const isExpired = popupData?.code === 'PLAN_EXPIRED';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex justify-center items-center p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Glow BG */}
                        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-1.5 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-full transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Icon */}
                        <div className={`flex items-center justify-center w-14 h-14 rounded-2xl shadow-lg mb-5 relative ${isExpired ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30' : 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30'}`}>
                            <IconComponent className="w-7 h-7 text-white" />
                        </div>

                        {/* Text */}
                        <h3 className="text-xl font-black text-white mb-2">
                            {popupData?.title || 'Plan Limit Reached'}
                        </h3>
                        <p className="text-white/50 text-sm mb-6 leading-relaxed">
                            {popupData?.description}{' '}
                            <span className="text-amber-400 font-bold">Upgrade your plan</span> to get higher limits and unlock all premium AISA features instantly.
                        </p>

                        {/* Feature bullets */}
                        <div className="flex flex-col gap-2 mb-6">
                            {features.map(f => (
                                <div key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                                    <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                                        <Zap className="w-2.5 h-2.5 text-amber-400" />
                                    </div>
                                    {f}
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <button
                            onClick={() => { setIsOpen(false); navigate('/pricing'); }}
                            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black text-sm hover:shadow-lg hover:shadow-amber-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Upgrade Plan
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full mt-3 py-2.5 text-xs font-semibold text-white/30 hover:text-white/60 transition-colors"
                        >
                            Maybe Later
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CreditUpsellPopup;
