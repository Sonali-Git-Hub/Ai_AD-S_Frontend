import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Crown, Zap, Shield, Sparkles } from 'lucide-react';

const PricingModal = ({ onClose, currentPlan, onUpgrade }) => {
    const plans = [
        {
            id: 'basic',
            name: 'Basic',
            price: 0,
            description: 'Essential AI for everyday use',
            features: [
                'Access to standard models',
                'Basic response speed',
                'Standard support',
                'Limited daily queries'
            ],
            icon: Shield,
            color: 'bg-gray-100 dark:bg-zinc-800',
            textColor: 'text-gray-900 dark:text-white',
            borderColor: 'border-gray-200 dark:border-zinc-700'
        },
        {
            id: 'pro',
            name: 'Pro',
            price: 499,
            originalPrice: 999,
            offer: '50% OFF',
            description: 'Advanced capabilities for professionals',
            features: [
                'Access to advanced models',
                'Fast response speed',
                'Priority support',
                'Unlimited queries',
                'Image generation'
            ],
            icon: Zap,
            color: 'bg-blue-50 dark:bg-blue-900/20',
            textColor: 'text-blue-600 dark:text-blue-400',
            borderColor: 'border-blue-200 dark:border-blue-800'
        },
        {
            id: 'king',
            name: 'King',
            price: 2499,
            originalPrice: 4999,
            offer: '50% OFF',
            description: 'Ultimate power for power users',
            features: [
                'Access to all models (including Beta)',
                'Instant response speed',
                '24/7 Dedicated support',
                'Unlimited everything',
                'Early access to new features',
                'API Access'
            ],
            icon: Crown,
            color: 'bg-amber-50 dark:bg-amber-900/20',
            textColor: 'text-amber-600 dark:text-amber-400',
            borderColor: 'border-amber-200 dark:border-amber-800'
        }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-[#18181b] w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
                >
                    <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center shrink-0">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Upgrade your Plan</h2>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Choose the plan that fits your needs.</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-[#121212] custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {plans.map((plan) => {
                                const isCurrent = currentPlan?.toLowerCase() === plan.id;
                                const Icon = plan.icon;

                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative bg-white dark:bg-[#1f1f1f] rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-xl flex flex-col ${isCurrent ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-200 dark:hover:border-zinc-700'}`}
                                    >
                                        {plan.offer && (
                                            <div className="absolute top-4 right-4 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                                                {plan.offer}
                                            </div>
                                        )}

                                        {isCurrent && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                Current Plan
                                            </div>
                                        )}

                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${plan.color}`}>
                                            <Icon className={`w-6 h-6 ${plan.textColor}`} />
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 min-h-[40px]">{plan.description}</p>

                                        {plan.offer && (
                                            <div className="text-[11px] font-bold text-blue-500 dark:text-blue-400 mb-1 flex items-center gap-1.5 uppercase tracking-wide">
                                                <Sparkles className="w-3 h-3" />
                                                {plan.offer} Launching Offer
                                            </div>
                                        )}

                                        <div className="mb-6 flex items-baseline gap-2">
                                            <div className="flex flex-col">
                                                {plan.originalPrice && (
                                                    <span className="text-sm text-gray-400 line-through font-medium">₹{plan.originalPrice}</span>
                                                )}
                                                <div className="flex items-baseline">
                                                    <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{plan.price}</span>
                                                    <span className="text-gray-500 dark:text-gray-400 ml-1">/month</span>
                                                </div>
                                            </div>
                                        </div>

                                        <ul className="space-y-3 mb-8 flex-1">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                                    <Check className={`w-5 h-5 shrink-0 ${plan.textColor}`} />
                                                    <span className="leading-tight">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => !isCurrent && onUpgrade(plan)}
                                            disabled={isCurrent}
                                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${isCurrent
                                                ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed'
                                                : 'bg-primary hover:bg-primary/90 text-white hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
                                                }`}
                                        >
                                            {isCurrent ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PricingModal;
