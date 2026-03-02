import React from 'react';
import { motion } from 'framer-motion';
import { useSubscription } from '../../context/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { Image, Video, Search, FileText, Code, Mic, Zap } from 'lucide-react';

// -1 means unlimited (backend sends -1 instead of Infinity for JSON compat)
const isUnlimited = (val) => val === -1 || val === Infinity || val === null || val === undefined;

const UsageStats = () => {
    const { usage, planLimits, plan, loading } = useSubscription();
    const navigate = useNavigate();

    if (loading) return null;

    const normPlan = (plan || 'basic').toLowerCase();
    const isUpgradeable = normPlan === 'basic'; // Only show upgrade CTA for basic users

    const stats = [
        { label: 'Images', current: usage?.imageCount || 0, limit: planLimits?.imageCount, icon: <Image size={14} /> },
        { label: 'Videos', current: usage?.videoCount || 0, limit: planLimits?.videoCount, icon: <Video size={14} /> },
        { label: 'Deep Search', current: usage?.deepSearchCount || 0, limit: planLimits?.deepSearchCount, icon: <Search size={14} /> },
        { label: 'Documents', current: usage?.documentConvertCount || 0, limit: planLimits?.documentConvertCount, icon: <FileText size={14} /> },
        { label: 'Audio', current: usage?.audioConvertCount || 0, limit: planLimits?.audioConvertCount, icon: <Mic size={14} /> },
        { label: 'Code', current: usage?.codeWriterCount || 0, limit: planLimits?.codeWriterCount, icon: <Code size={14} /> },
    ];

    const getPercentage = (curr, lim) => {
        if (isUnlimited(lim)) return 0; // No bar for unlimited
        return Math.min(100, (curr / lim) * 100);
    };

    const planLabel = normPlan.charAt(0).toUpperCase() + normPlan.slice(1);

    return (
        <div className="p-4 bg-surface/30 rounded-2xl border border-border mt-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-maintext uppercase tracking-wider">
                    Your Usage ({planLabel})
                </h3>
                {isUpgradeable && (
                    <span
                        onClick={() => navigate('/dashboard/pricing')}
                        className="text-[10px] text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full cursor-pointer hover:bg-primary/20 transition-colors"
                    >
                        Upgrade
                    </span>
                )}
                {!isUpgradeable && (
                    <span className="text-[10px] text-green-500 font-bold px-2 py-0.5 bg-green-500/10 rounded-full flex items-center gap-1">
                        <Zap size={9} className="fill-green-500" />
                        {planLabel} Active
                    </span>
                )}
            </div>

            <div className="space-y-4">
                {stats.map((s, i) => {
                    const unlimited = isUnlimited(s.limit);
                    const pct = getPercentage(s.current, s.limit);
                    const nearLimit = !unlimited && pct > 90;
                    const atLimit = !unlimited && s.current >= s.limit;

                    return (
                        <div key={i}>
                            <div className="flex justify-between items-center text-[11px] mb-1">
                                <div className="flex items-center gap-1.5 text-subtext">
                                    {s.icon}
                                    <span>{s.label}</span>
                                </div>
                                <span className={`font-medium ${atLimit ? 'text-red-500' : nearLimit ? 'text-amber-500' : 'text-maintext'}`}>
                                    {unlimited
                                        ? <span><span className="text-maintext">{s.current} / </span><span className="text-primary font-bold">∞ Unlimited</span></span>
                                        : `${s.current} / ${s.limit}`}
                                </span>
                            </div>

                            {/* Progress bar — hidden for unlimited features */}
                            {!unlimited && (
                                <div className="h-1.5 w-full bg-border/50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                        className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' :
                                            pct > 70 ? 'bg-amber-500' : 'bg-primary'
                                            }`}
                                    />
                                </div>
                            )}

                            {!unlimited && s.limit - s.current === 1 && (
                                <p className="text-[9px] text-amber-600 mt-1 animate-pulse">
                                    Only 1 left this month!
                                </p>
                            )}
                            {atLimit && isUpgradeable && (
                                <p className="text-[9px] text-red-500 mt-1">
                                    Limit reached — <span className="underline cursor-pointer" onClick={() => navigate('/dashboard/pricing')}>Upgrade</span> to continue
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UsageStats;
