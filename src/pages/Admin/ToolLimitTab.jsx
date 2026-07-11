import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import { AlertCircle, Save, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { LoadingSpinner } from './AdminCommon';

const ToolLimitTab = () => {
    const { t } = useLanguage();
    const [plans, setPlans] = useState([]);
    const [editedPlans, setEditedPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const data = await apiService.getPlans();
                const plansList = Array.isArray(data) ? data : data.plans || [];
                setPlans(plansList);
                setEditedPlans(JSON.parse(JSON.stringify(plansList)));
            } catch (err) {
                console.error('Failed to fetch plans:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleValueChange = (planId, field, value) => {
        setEditedPlans(prev => prev.map(p => {
            if (p._id === planId) {
                return { ...p, [field]: value };
            }
            return p;
        }));
    };

    const hasUnsavedChanges = JSON.stringify(plans) !== JSON.stringify(editedPlans);

    const handleSaveAll = async () => {
        setSaving(true);
        let successCount = 0;
        let failCount = 0;

        const modified = editedPlans.filter(ep => {
            const original = plans.find(p => p._id === ep._id);
            return JSON.stringify(ep) !== JSON.stringify(original);
        });

        for (const plan of modified) {
            try {
                const body = {
                    planId: plan.planId,
                    planName: plan.planName,
                    priceMonthly: Number(plan.priceMonthly),
                    priceYearly: Number(plan.priceYearly),
                    chatLimit: Number(plan.chatLimit),
                    chatScope: plan.chatScope,
                    imageLimit: Number(plan.imageLimit),
                    carouselLimit: Number(plan.carouselLimit),
                    videoLimit: Number(plan.videoLimit),
                    editImageAllowed: Boolean(plan.editImageAllowed),
                    cashflowAllowed: Boolean(plan.cashflowAllowed),
                    validityDays: Number(plan.validityDays),
                    aiLegalAllowed: Boolean(plan.aiLegalAllowed),
                    aiAdsAllowed: Boolean(plan.aiAdsAllowed),
                    voiceGenAllowed: Boolean(plan.voiceGenAllowed),
                    webSearchAllowed: Boolean(plan.webSearchAllowed),
                    deepSearchAllowed: Boolean(plan.deepSearchAllowed),
                    codeWriterAllowed: Boolean(plan.codeWriterAllowed),
                    documentConvertAllowed: Boolean(plan.documentConvertAllowed),
                    features: plan.features,
                    badge: plan.badge,
                    isPopular: plan.isPopular,
                    isActive: plan.isActive
                };
                const res = await apiService.updatePlan(plan._id, body);
                if (res.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (err) {
                console.error(`Failed to update plan ${plan.planName}:`, err);
                failCount++;
            }
        }

        if (successCount > 0) {
            toast.success(`Successfully saved ${successCount} plan limit configuration${successCount > 1 ? 's' : ''}`);
        }
        if (failCount > 0) {
            toast.error(`Failed to save ${failCount} plan configurations`);
        }

        try {
            const data = await apiService.getPlans();
            const freshPlans = Array.isArray(data) ? data : data.plans || [];
            setPlans(freshPlans);
            setEditedPlans(JSON.parse(JSON.stringify(freshPlans)));
        } catch (err) {
            console.error('Failed to reload plans:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    // Matrix representation fields classified according to home chat screen categories
    const services = [
        {
            category: 'Plan Core Settings',
            items: [
                {
                    name: 'AI Chat Scope',
                    description: 'Chat availability type',
                    field: 'chatScope',
                    type: 'select',
                    options: [
                        { value: 'total', label: 'Lifetime Cap' },
                        { value: 'unlimited', label: 'Unlimited' }
                    ]
                },
                {
                    name: 'AI Chat Limit',
                    description: 'Max messages count (-1 for unlimited)',
                    field: 'chatLimit',
                    type: 'number'
                },
                {
                    name: 'Validity (Days)',
                    description: 'Plan expiration duration',
                    field: 'validityDays',
                    type: 'number'
                }
            ]
        },
        {
            category: 'BUSINESS',
            items: [
                {
                    name: 'AI Legal™ Advisor',
                    description: 'Access to AI Legal documents and toolkit',
                    field: 'aiLegalAllowed',
                    type: 'boolean'
                },
                {
                    name: 'AI Cashflow™',
                    description: 'Permission to access stock analysis tabs',
                    field: 'cashflowAllowed',
                    type: 'boolean'
                },
                {
                    name: 'AI ADS™ Agent',
                    description: 'Access to AI Ads and Social Media generation',
                    field: 'aiAdsAllowed',
                    type: 'boolean'
                }
            ]
        },
        {
            category: 'CREATE',
            items: [
                {
                    name: 'AI Image Generation',
                    description: 'Daily image creation limit',
                    field: 'imageLimit',
                    type: 'number'
                },
                {
                    name: 'AI Image Editor',
                    description: 'Permission to edit/transform images',
                    field: 'editImageAllowed',
                    type: 'boolean'
                },
                {
                    name: 'AI Carousel Generation',
                    description: 'Daily AIAD carousel limit',
                    field: 'carouselLimit',
                    type: 'number'
                },
                {
                    name: 'AI Video Generation',
                    description: 'Daily video creation limit',
                    field: 'videoLimit',
                    type: 'number'
                },
                {
                    name: 'Voice Generation',
                    description: 'Text-to-speech audio synthesis',
                    field: 'voiceGenAllowed',
                    type: 'boolean'
                }
            ]
        },
        {
            category: 'INTELLIGENCE',
            items: [
                {
                    name: 'AI Web Search',
                    description: 'Real-time web search capability',
                    field: 'webSearchAllowed',
                    type: 'boolean'
                },
                {
                    name: 'AI Deep Search',
                    description: 'AI Deep Search capability',
                    field: 'deepSearchAllowed',
                    type: 'boolean'
                },
                {
                    name: 'AI Code Writer',
                    description: 'Programming support and code generator',
                    field: 'codeWriterAllowed',
                    type: 'boolean'
                },
                {
                    name: 'AI Document Converter',
                    description: 'Access to document format conversion tool',
                    field: 'documentConvertAllowed',
                    type: 'boolean'
                }
            ]
        }
    ];

    return (
        <div className="space-y-6 pb-24">
            <div>
                <h2 className="text-lg font-bold text-maintext">Plan Services & Limits (Tool Matrix)</h2>
                <p className="text-xs text-subtext">Directly edit limits, permissions, and service capabilities for each plan in the grid below.</p>
            </div>

            {/* Matrix Card */}
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="border-b border-white/20 dark:border-white/10 bg-white/20 dark:bg-black/20">
                            <th className="p-4 text-xs font-bold text-subtext uppercase tracking-wider w-[280px]">Service / Tool Name</th>
                            {editedPlans.map(plan => (
                                <th key={plan._id} className="p-4 text-xs font-black text-maintext uppercase tracking-wider text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-sm text-maintext">{plan.planName}</span>
                                        <span className="text-[10px] text-primary/80 lowercase font-medium mt-0.5">₹{plan.priceMonthly}/mo</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((cat, idx) => (
                            <React.Fragment key={idx}>
                                {/* Category Header */}
                                <tr className="bg-white/10 dark:bg-white/5">
                                    <td colSpan={editedPlans.length + 1} className="px-4 py-2 text-xs font-extrabold text-primary uppercase tracking-wider">
                                        {cat.category}
                                    </td>
                                </tr>
                                {cat.items.map((item, itemIdx) => (
                                    <tr key={itemIdx} className="border-b border-white/10 dark:border-b-white/5 hover:bg-white/10 dark:hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-maintext text-sm">{item.name}</p>
                                            <p className="text-[11px] text-subtext/80 mt-0.5">{item.description}</p>
                                        </td>
                                        {editedPlans.map(plan => {
                                            const val = plan[item.field];

                                            return (
                                                <td key={plan._id} className="p-4 text-center">
                                                    {item.type === 'boolean' && (
                                                        <input
                                                            type="checkbox"
                                                            checked={!!val}
                                                            onChange={(e) => handleValueChange(plan._id, item.field, e.target.checked)}
                                                            className="w-4.5 h-4.5 accent-primary rounded border-white/20 cursor-pointer flex items-center justify-center mx-auto"
                                                        />
                                                    )}
                                                    {item.type === 'number' && (
                                                        <input
                                                            type="number"
                                                            value={val ?? 0}
                                                            onChange={(e) => handleValueChange(plan._id, item.field, Number(e.target.value))}
                                                            className="bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-1.5 px-3 text-xs outline-none focus:border-primary text-maintext font-bold text-center w-24 mx-auto block no-spinner font-mono"
                                                        />
                                                    )}
                                                    {item.type === 'select' && (
                                                        <select
                                                            value={val || ''}
                                                            onChange={(e) => handleValueChange(plan._id, item.field, e.target.value)}
                                                            className="bg-white/20 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl py-1.5 px-3 text-xs outline-none focus:border-primary text-maintext font-bold text-center max-w-[150px] mx-auto block font-mono"
                                                        >
                                                            {item.options.map(opt => (
                                                                <option key={opt.value} value={opt.value} className="bg-slate-50 dark:bg-zinc-900 text-maintext text-xs font-semibold">
                                                                    {opt.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Hint Box */}
            <div className="bg-white/20 dark:bg-white/5 rounded-2xl p-4 border border-white/10 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-xs text-subtext space-y-1">
                    <p className="font-bold text-maintext">Quick Edit Matrix</p>
                    <p>Adjust limits and check permissions directly in the comparison grid. Changes are kept locally until you click the save bar at the bottom.</p>
                </div>
            </div>

            {/* Floating Save/Reset Bar */}
            <AnimatePresence>
                {hasUnsavedChanges && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-6 px-6 py-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-2xl rounded-2xl min-w-[320px] md:min-w-[500px]"
                    >
                        <div className="flex items-center gap-2.5 text-maintext">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                            <div className="text-left">
                                <p className="text-sm font-bold text-maintext">Unsaved Changes</p>
                                <p className="text-[11px] text-subtext">You have modified the plan limits and permissions matrix.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 font-semibold">
                            <button
                                onClick={() => setEditedPlans(JSON.parse(JSON.stringify(plans)))}
                                className="px-4 py-2 text-xs font-bold text-subtext hover:text-maintext hover:bg-white/10 rounded-xl transition-all"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleSaveAll}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs hover:opacity-90 transition-all shadow-lg shadow-primary/30 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-3.5 h-3.5" />
                                        Save All Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ToolLimitTab;
